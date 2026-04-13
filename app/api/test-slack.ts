// app/api/test-slack/route.ts - SEPARATE FILE
import { NextRequest, NextResponse } from 'next/server'
import { sendSlackNotification } from '@/lib/slack'

export async function GET(request: NextRequest) {
  try {
    // Test with simple message
    await sendSlackNotification({
      text: 'Test message from Tre1 TechnIQ',
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '*Test Data:*\nName: Test Name\nCompany: Test Company\nEmail: test@example.com'
          }
        }
      ]
    })
    
    return NextResponse.json({ success: true, message: 'Test Slack notification sent' })
    
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) })
  }
}