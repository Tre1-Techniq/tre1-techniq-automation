import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

type AngleName = 'upgrade' | 'implementation' | 'audit' | 'general' | 'unknown'

type StatBucket = {
  sent: number
  replied: number
  replyRate: number
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('lead_outreach')
      .select('outcome, metadata, created_at')

    if (error) {
      throw error
    }

    const angleStats: Record<AngleName, StatBucket> = {
      upgrade: { sent: 0, replied: 0, replyRate: 0 },
      implementation: { sent: 0, replied: 0, replyRate: 0 },
      audit: { sent: 0, replied: 0, replyRate: 0 },
      general: { sent: 0, replied: 0, replyRate: 0 },
      unknown: { sent: 0, replied: 0, replyRate: 0 },
    }

    const stepStats: Record<string, StatBucket> = {}

    for (const row of data || []) {
      const rawAngle = row.metadata?.angle
      const angle: AngleName =
        rawAngle === 'upgrade' ||
        rawAngle === 'implementation' ||
        rawAngle === 'audit' ||
        rawAngle === 'general'
          ? rawAngle
          : 'unknown'

      const step = String(row.metadata?.sequence_step || 'unknown')

      if (!stepStats[step]) {
        stepStats[step] = { sent: 0, replied: 0, replyRate: 0 }
      }

      angleStats[angle].sent += 1
      stepStats[step].sent += 1

      if (row.outcome === 'replied') {
        angleStats[angle].replied += 1
        stepStats[step].replied += 1
      }
    }

    for (const angle of Object.keys(angleStats) as AngleName[]) {
      const stat = angleStats[angle]
      stat.replyRate = stat.sent > 0 ? Number(((stat.replied / stat.sent) * 100).toFixed(2)) : 0
    }

    for (const step of Object.keys(stepStats)) {
      const stat = stepStats[step]
      stat.replyRate = stat.sent > 0 ? Number(((stat.replied / stat.sent) * 100).toFixed(2)) : 0
    }

    const totalSent = Object.values(angleStats).reduce((sum, stat) => sum + stat.sent, 0)
    const totalReplied = Object.values(angleStats).reduce((sum, stat) => sum + stat.replied, 0)
    const overallReplyRate =
      totalSent > 0 ? Number(((totalReplied / totalSent) * 100).toFixed(2)) : 0

    return NextResponse.json({
      totals: {
        sent: totalSent,
        replied: totalReplied,
        replyRate: overallReplyRate,
      },
      angleStats,
      stepStats,
    })
  } catch (error) {
    console.error('Lead analytics route error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch outreach analytics' },
      { status: 500 }
    )
  }
}