import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { auditId, notes } = body

    if (!auditId) {
      return NextResponse.json(
        { error: 'Missing auditId' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('audits')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        notes,
      })
      .eq('id', auditId)

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: 'Audit marked as completed',
    })
  } catch (error) {
    console.error('Error completing audit:', error)
    return NextResponse.json(
      { error: 'Failed to complete audit' },
      { status: 500 }
    )
  }
}