import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { calculateLeadScore } from '@/lib/leadScore'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const segments = url.pathname.split('/').filter(Boolean)
    const userId = segments[2]

    const { data: signals, error } = await supabase
      .from('engagement_signals')
      .select('*')
      .eq('user_id', userId)

    if (error) {
      return NextResponse.json(
        {
          error: 'Signals query failed',
          pathname: url.pathname,
          segments,
          userId,
          details: error.message,
          code: error.code,
        },
        { status: 500 }
      )
    }

    const score = calculateLeadScore(signals || [])

    return NextResponse.json({
      userId,
      score,
      signalsCount: signals?.length || 0,
      signals: signals || [],
    })
  } catch (error) {
    console.error('Lead score error:', error)

    return NextResponse.json(
      { error: 'Failed to calculate score' },
      { status: 500 }
    )
  }
}