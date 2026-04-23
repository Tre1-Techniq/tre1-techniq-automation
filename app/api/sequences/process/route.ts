import { NextResponse } from 'next/server'
import { processPendingLeadSequences } from '@/lib/sequences'

export async function POST() {
  try {
    const results = await processPendingLeadSequences()

    return NextResponse.json({
      success: true,
      processed: results.length,
      results,
    })
  } catch (error) {
    console.error('Sequence processing error:', error)
    return NextResponse.json(
      { error: 'Failed to process sequences' },
      { status: 500 }
    )
  }
}