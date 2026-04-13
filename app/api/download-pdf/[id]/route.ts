// app/api/download-pdf/[id]/route.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )
    
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get user tier
    const { data: profile } = await supabase
      .from('profiles')
      .select('tier')
      .eq('id', session.user.id)
      .single()
    
    const userTier = profile?.tier || 'free'
    
    // Get PDF details
    const { data: pdf, error: pdfError } = await supabase
      .from('pdf_library')
      .select('*')
      .eq('id', params.id)
      .single()
    
    if (pdfError || !pdf) {
      return NextResponse.json({ error: 'PDF not found' }, { status: 404 })
    }
    
    // Check tier access
    const tierOrder = ['free', 'starter', 'growth', 'enterprise']
    const userTierIndex = tierOrder.indexOf(userTier)
    const requiredTierIndex = tierOrder.indexOf(pdf.required_tier)
    
    if (userTierIndex < requiredTierIndex) {
      return NextResponse.json({ error: 'Insufficient tier access' }, { status: 403 })
    }
    
    // Increment download count
    await supabase
      .from('pdf_library')
      .update({ download_count: pdf.download_count + 1 })
      .eq('id', params.id)
    
    // Log access
    await supabase
      .from('pdf_access_logs')
      .insert({
        user_id: session.user.id,
        pdf_id: params.id,
        accessed_at: new Date().toISOString()
      })
    
    // For now, return placeholder - you'll need actual PDF files
    return NextResponse.json({
      message: 'Download access granted',
      pdf: {
        title: pdf.title,
        file_path: pdf.file_path,
        download_url: `/pdfs/${pdf.file_path}` // Adjust based on your storage
      }
    })
    
  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}