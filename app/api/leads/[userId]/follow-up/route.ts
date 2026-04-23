import { NextRequest, NextResponse } from 'next/server'
import { generateLeadFollowUpDraft } from '@/lib/followUpGenerator'

export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const body = await request.json().catch(() => ({}))
    const { tone } = body || {}

    const result = await generateLeadFollowUpDraft(params.userId, tone || 'default')

    return NextResponse.json({
      userId: params.userId,
      ...result,
    })
  } catch (error) {
    console.error('Follow-up generator error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate follow-up email' },
      { status: 500 }
    )
  }
}