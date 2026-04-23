import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const body = await request.json()
    const { hasReplied } = body as { hasReplied?: boolean }

    if (typeof hasReplied !== 'boolean') {
      return NextResponse.json(
        { error: 'Missing or invalid hasReplied value' },
        { status: 400 }
      )
    }

    const now = new Date().toISOString()

    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        has_replied: hasReplied,
        replied_at: hasReplied ? now : null,
      })
      .eq('id', params.userId)

    if (profileError) {
      console.error('Reply status profile update error:', profileError)
      return NextResponse.json(
        { error: 'Failed to update profile reply status' },
        { status: 500 }
      )
    }

    if (hasReplied) {
        const { error: outreachOutcomeError } = await supabase
            .from('lead_outreach')
            .update({ outcome: 'replied' })
            .eq('user_id', params.userId)
            .eq('status', 'sent')

        if (outreachOutcomeError) {
            console.error('Outreach outcome update error:', outreachOutcomeError)
            return NextResponse.json(
            { error: 'Failed to update outreach outcome' },
            { status: 500 }
            )
        }

        const { error: sequencePauseError } = await supabase
            .from('lead_sequences')
            .update({
            status: 'paused',
            reply_paused: true,
            reply_paused_at: now,
            reply_pause_reason: 'manual_reply_marked',
            paused_at: now,
            })
            .eq('user_id', params.userId)
            .eq('status', 'active')

        if (sequencePauseError) {
            console.error('Sequence pause error:', sequencePauseError)
            return NextResponse.json(
            { error: 'Failed to pause lead sequence' },
            { status: 500 }
            )
        }
        } else {
        const { error: sequenceResumeError } = await supabase
            .from('lead_sequences')
            .update({
            status: 'active',
            reply_paused: false,
            reply_paused_at: null,
            reply_pause_reason: null,
            paused_at: null,
            })
            .eq('user_id', params.userId)
            .eq('reply_paused', true)

        if (sequenceResumeError) {
            console.error('Sequence resume error:', sequenceResumeError)
            return NextResponse.json(
            { error: 'Failed to resume lead sequence' },
            { status: 500 }
            )
        }
    }

    return NextResponse.json({
      success: true,
      hasReplied,
      message: hasReplied
        ? 'Lead marked as replied and sequences paused'
        : 'Reply flag cleared and sequences resumed',
    })
  } catch (error) {
    console.error('Reply status route error:', error)
    return NextResponse.json(
      { error: 'Failed to update reply status' },
      { status: 500 }
    )
  }
}