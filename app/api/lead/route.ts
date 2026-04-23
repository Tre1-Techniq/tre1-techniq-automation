import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { sendSlackMessage } from '@/lib/slack'

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    // Validate required fields
    if (!data.name || !data.email || !data.businessType) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email, businessType' },
        { status: 400 }
      )
    }

    // Insert into Supabase
    const { data: lead, error: dbError } = await supabaseAdmin
      .from('leads')
      .insert([
        {
          name: data.name,
          email: data.email,
          company: data.company || null,
          business_type: data.businessType,
          pain_point: data.painPoint || null,
          status: 'new',
          source: 'website'
        }
      ])
      .select()
      .single()

    if (dbError) {
      console.error('Supabase error:', dbError)
      return NextResponse.json(
        { error: 'Database error', details: dbError.message },
        { status: 500 }
      )
    }

    // Send Slack notification (don't fail request if Slack fails)
    try {
      await sendSlackMessage(lead)
    } catch (slackError) {
      console.error('Slack notification failed:', slackError)
      // Continue anyway - Slack failure shouldn't break lead capture
    }

    return NextResponse.json(
      { success: true, leadId: lead.id },
      { status: 201 }
    )

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Optional: GET endpoint to check API health
export async function GET() {
  return NextResponse.json(
    { status: 'ok', message: 'Lead API is running' },
    { status: 200 }
  )
}