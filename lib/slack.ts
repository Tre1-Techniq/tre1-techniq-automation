// lib/slack.ts - UPDATED WITH LOGGING
export async function sendSlackNotification(payload: any) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL
  
  if (!webhookUrl) {
    console.warn('SLACK_WEBHOOK_URL not set. Skipping Slack notification.')
    return
  }

  console.log('📤 Sending Slack notification payload:', JSON.stringify(payload, null, 2))

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    console.log('📨 Slack response status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Slack notification failed:', errorText)
      throw new Error(`Slack error: ${response.status} ${errorText}`)
    }
    
    console.log('✅ Slack notification sent successfully')
    
  } catch (error) {
    console.error('❌ Error sending Slack notification:', error)
    throw error
  }
}