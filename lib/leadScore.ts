export function calculateLeadScore(signals: any[]) {
  let score = 0

  for (const signal of signals) {
    if (signal.signal_type === 'interest_tag') score += 1
    if (signal.signal_type === 'high_intent_download') score += 3
    if (signal.signal_type === 'upsell_intent') score += 5
  }

  let label = 'Cold'
  if (score >= 10) label = 'Hot'
  else if (score >= 5) label = 'Warm'

  return { score, label }
}