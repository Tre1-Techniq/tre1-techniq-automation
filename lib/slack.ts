export async function sendSlackMessage(payload: Record<string, unknown>) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL

  if (!webhookUrl) {
    throw new Error('SLACK_WEBHOOK_URL is not set')
  }

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Slack webhook failed: ${response.status} ${text}`)
  }
}