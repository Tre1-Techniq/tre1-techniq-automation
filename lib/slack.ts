export async function sendSlackNotification(lead: any) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL
  
  if (!webhookUrl) {
    console.warn('SLACK_WEBHOOK_URL not configured')
    return
  }

  const message = {
    username: 'Tre1 TechnIQ Bot',
    icon_emoji: '⚡',
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '🎯 New Workflow Audit Request',
          emoji: true
        }
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Name:*\n${lead.name}`
          },
          {
            type: 'mrkdwn',
            text: `*Company:*\n${lead.company || 'Not provided'}`
          }
        ]
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Email:*\n${lead.email}`
          },
          {
            type: 'mrkdwn',
            text: `*Industry:*\n${lead.business_type}`
          }
        ]
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Pain Point:*\n${lead.pain_point || 'Not specified'}`
        }
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'View in Dashboard',
              emoji: true
            },
            url: `https://app.supabase.com/project/${process.env.NEXT_PUBLIC_SUPABASE_URL?.split('.')[0]}/editor/leads`
          },
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'Send Email',
              emoji: true
            },
            url: `mailto:${lead.email}?subject=Tre1%20TechnIQ%20Workflow%20Audit&body=Hi%20${encodeURIComponent(lead.name)}`
          }
        ]
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `🆔 ${lead.id} | 📅 ${new Date().toLocaleDateString()}`
          }
        ]
      }
    ]
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    })

    if (!response.ok) {
      throw new Error(`Slack API error: ${response.statusText}`)
    }

    console.log('Slack notification sent successfully')
    return response
  } catch (error) {
    console.error('Failed to send Slack notification:', error)
    throw error
  }
}

// Optional: Function for audit completion notifications
export async function sendAuditCompletedNotification(audit: any, lead: any) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL
  
  if (!webhookUrl) return

  const message = {
    username: 'Tre1 TechnIQ Bot',
    icon_emoji: '✅',
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '✅ Audit Completed',
          emoji: true
        }
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Client:*\n${lead.name}`
          },
          {
            type: 'mrkdwn',
            text: `*Company:*\n${lead.company || 'N/A'}`
          }
        ]
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Next Step:* Schedule follow-up call to discuss implementation`
        }
      }
    ]
  }

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    })
  } catch (error) {
    console.error('Failed to send audit completion notification:', error)
  }
}