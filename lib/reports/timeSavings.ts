export type TimeSavingsAuditInput = {
  primary_pain?: string | null
  time_wasters?: string[] | null
  company_size?: string | null
  automation_goals?: string | null
}

export type TimeSavingsResult = {
  hoursPerWeek: number
  confidence: 'Low' | 'Moderate' | 'High'
  summary: string
  tasks: string[]
}

function hasText(value?: string | null) {
  return Boolean(value && value.trim().length > 0)
}

function companySizeMultiplier(companySize?: string | null) {
  const normalized = companySize?.toLowerCase() || ''

  if (normalized.includes('1-5') || normalized.includes('solo')) return 0.8
  if (normalized.includes('6-20')) return 1
  if (normalized.includes('21-50')) return 1.25
  if (normalized.includes('51') || normalized.includes('100')) return 1.5

  return 1
}

export function calculateTimeSavings(audit: TimeSavingsAuditInput): TimeSavingsResult {
  const timeWasters = audit.time_wasters || []
  const taskCount = timeWasters.length

  let baseHours = 0

  if (taskCount === 1) baseHours = 3
  if (taskCount === 2) baseHours = 6
  if (taskCount === 3) baseHours = 10
  if (taskCount === 4) baseHours = 12
  if (taskCount >= 5) baseHours = 15

  if (hasText(audit.automation_goals)) {
        baseHours += 1
  }

  const adjustedHours = Math.round(baseHours * companySizeMultiplier(audit.company_size))

  const hoursPerWeek = Math.min(Math.max(adjustedHours, 1), 25)

  const confidence =
    taskCount >= 3 && hasText(audit.automation_goals)
      ? 'High'
      : taskCount >= 2
        ? 'Moderate'
        : 'Low'

  const tasks = [
    ...timeWasters,
    audit.primary_pain,
  ].filter(Boolean) as string[]

  return {
    hoursPerWeek,
    confidence,
    tasks,
    summary:
      confidence === 'High'
        ? 'This estimate is based on multiple repetitive workflow signals and clear automation goals.'
        : confidence === 'Moderate'
          ? 'This estimate is based on recurring workflow friction identified in the audit.'
          : 'This is a conservative estimate based on limited workflow signals.',
  }
}