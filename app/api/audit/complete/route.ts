import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { auditId, notes } = body

    // Update audit status to completed
    const { error } = await supabase
      .from('audits')
      .update({ 
        status: 'completed',
        completed_at: new Date().toISOString(),
        notes
      })
      .eq('id', auditId)

    if (error) throw error

    return NextResponse.json({ 
      success: true, 
      message: 'Audit marked as completed' 
    })
  } catch (error) {
    console.error('Error completing audit:', error)
    return NextResponse.json(
      { error: 'Failed to complete audit' },
      { status: 500 }
    )
  }
}