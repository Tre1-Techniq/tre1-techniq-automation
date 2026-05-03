export type AutomationReadinessAuditInput = {
  company_name?: string | null
  industry?: string | null
  company_size?: string | null
  primary_pain?: string | null
  time_wasters?: string[] | null
  current_tools?: string[] | null
  automation_goals?: string | string[] | null
  integration_needs?: string | string[] | null
  budget?: string | null
}

export type ReadinessFactor = {
  label: string
  points: number
  max: number
  detail: string
}

export type AutomationReadinessBand =
  | 'Early Stage'
  | 'Emerging'
  | 'Ready'
  | 'High Readiness'

export type AutomationReadinessResult = {
  score: number
  band: AutomationReadinessBand
  summary: string
  factors: ReadinessFactor[]
}

export type ScoreAwareRecommendation = {
  title: string
  why: string
  nextStep: string
}

export type ToolAwareRecommendation = ScoreAwareRecommendation & {
  toolContext?: string
  suggestedPath?: string
}

function wordCount(value?: string | null) {
  if (!value) return 0
  return value.trim().split(/\s+/).filter(Boolean).length
}

function hasOperationalDetail(value?: string | null) {
  if (!value) return false

  const text = value.toLowerCase()

  return [
    'daily',
    'weekly',
    'monthly',
    'hours',
    'team',
    'customer',
    'client',
    'lead',
    'handoff',
    'manual',
    'follow up',
    'follow-up',
    'crm',
    'email',
    'report',
    'reporting',
    'approval',
    'intake',
    'tracking',
    'update',
    'qualify',
    'publish',
    'review',
    'order',
    'checkout',
    'inventory',
    'fulfillment',
    'schedule',
    'pipeline',
    'dashboard',
  ].some((term) => text.includes(term))
}

function specificityLevel(value?: string | null) {
  const count = wordCount(value)

  if (!value || count === 0) return 0
  if (count < 4) return 1
  if (count < 10) return 2
  if (hasOperationalDetail(value)) return 4
  return 3
}

function normalizeToText(value?: string | string[] | null) {
  if (!value) return ''
  return Array.isArray(value) ? value.join(' ') : value
}

function scoreBudget(budget?: string | null) {
  if (!budget) return 0

  const value = budget.toLowerCase().trim()

  if (
    value.includes('$3,000') ||
    value.includes('$3000') ||
    value.includes('3000') ||
    value.includes('$5,000') ||
    value.includes('$5000') ||
    value.includes('5000') ||
    value.includes('enterprise') ||
    value.includes('custom')
  ) {
    return 10
  }

  if (
    (value.includes('$1,000') || value.includes('$1000') || value.includes('1000')) &&
    (value.includes('$3,000') || value.includes('$3000') || value.includes('3000'))
  ) {
    return 8
  }

  if (
    (value.includes('$500') || value.includes('500')) &&
    (value.includes('$1,000') || value.includes('$1000') || value.includes('1000'))
  ) {
    return 5
  }

  if (
    value.includes('under') ||
    value.includes('less than') ||
    value.includes('<') ||
    value.includes('$0') ||
    value.includes('0')
  ) {
    return 3
  }

  if (
    value.includes('not sure') ||
    value.includes('unsure') ||
    value.includes('unknown') ||
    value.includes('no budget')
  ) {
    return 0
  }

  return 5
}

export function getBand(score: number): AutomationReadinessBand {
  if (score >= 85) return 'High Readiness'
  if (score >= 70) return 'Ready'
  if (score >= 45) return 'Emerging'
  return 'Early Stage'
}

export function getSummary(score: number) {
  if (score >= 85) {
    return 'Strong automation readiness signals are present. The next step is prioritizing implementation.'
  }

  if (score >= 70) {
    return 'The audit shows strong automation potential with a few planning gaps to resolve before implementation.'
  }

  if (score >= 45) {
    return 'The audit shows enough clarity to begin mapping a focused automation plan.'
  }

  return 'The audit suggests the first priority should be clarifying workflows, tools, and automation goals.'
}

export function calculateAutomationReadiness(
  audit: AutomationReadinessAuditInput
): AutomationReadinessResult {
  const painLevel = specificityLevel(audit.primary_pain)

  const goalText = normalizeToText(audit.automation_goals)
  const goalLevel = specificityLevel(goalText)

  const integrationText = normalizeToText(audit.integration_needs)
  const integrationLevel = specificityLevel(integrationText)

  const painPoints =
    painLevel >= 4
      ? 15
      : painLevel === 3
        ? 12
        : painLevel === 2
          ? 8
          : painLevel === 1
            ? 5
            : 0

  const timeWastersCount = audit.time_wasters?.length || 0
  const timeWasters =
    timeWastersCount >= 3
      ? 15
      : timeWastersCount === 2
        ? 10
        : timeWastersCount === 1
          ? 6
          : 0

  const toolsCount = audit.current_tools?.length || 0
  const tools =
    toolsCount >= 4
      ? 10
      : toolsCount === 3
        ? 8
        : toolsCount === 2
          ? 6
          : toolsCount === 1
            ? 3
            : 0

  const goals =
    goalLevel >= 4
      ? 20
      : goalLevel === 3
        ? 15
        : goalLevel === 2
          ? 10
          : goalLevel === 1
            ? 5
            : 0

  const integrations =
    integrationLevel >= 4
      ? 15
      : integrationLevel === 3
        ? 12
        : integrationLevel === 2
          ? 8
          : integrationLevel === 1
            ? 5
            : 0

  const budget = scoreBudget(audit.budget)

  const executionReadiness =
    painLevel >= 4 && goalLevel >= 4
      ? 15
      : painLevel >= 3 && goalLevel >= 3
        ? 10
        : painLevel >= 2 && goalLevel >= 2
          ? 5
          : 0

  const factors: ReadinessFactor[] = [
    {
      label: 'Pain clarity',
      points: painPoints,
      max: 15,
      detail:
        painLevel >= 4
          ? 'Primary pain point includes operational detail and a clear workflow signal.'
          : painLevel === 3
            ? 'Primary pain point is specific enough to guide initial automation planning.'
            : painLevel === 2
              ? 'Primary pain point is identified but needs more operational detail.'
              : painLevel === 1
                ? 'Primary pain point is present but too vague to guide automation planning.'
                : 'No primary pain point was provided.',
    },
    {
      label: 'Repetitive task signals',
      points: timeWasters,
      max: 15,
      detail:
        timeWastersCount >= 3
          ? 'Multiple repeatable workflow frictions were identified.'
          : timeWastersCount === 2
            ? 'Two repeatable workflow frictions were identified.'
            : timeWastersCount === 1
              ? 'One repeatable workflow friction was identified.'
              : 'No repeatable workflow friction was identified.',
    },
    {
      label: 'Tool stack clarity',
      points: tools,
      max: 10,
      detail:
        toolsCount >= 4
          ? 'A multi-tool stack was provided, suggesting usable workflow infrastructure.'
          : toolsCount === 3
            ? 'Several current tools were provided, giving useful implementation context.'
            : toolsCount === 2
              ? 'Two current tools were provided, but the stack still needs more workflow context.'
              : toolsCount === 1
                ? 'One current tool was provided, which gives limited implementation context.'
                : 'Current tool stack needs more detail.',
    },
    {
      label: 'Automation goal clarity',
      points: goals,
      max: 20,
      detail:
        goalLevel >= 4
          ? 'Automation goal is specific and tied to an operational workflow.'
          : goalLevel === 3
            ? 'Automation goal is specific enough to guide planning.'
            : goalLevel === 2
              ? 'Automation goal is useful but needs more measurable detail.'
              : goalLevel === 1
                ? 'Automation goal is present but too broad.'
                : 'No automation goal was provided.',
    },
    {
      label: 'Integration opportunity',
      points: integrations,
      max: 15,
      detail:
        integrationLevel >= 4
          ? 'Integration need shows a clear system handoff or workflow connection.'
          : integrationLevel === 3
            ? 'Integration need suggests a useful systems opportunity.'
            : integrationLevel === 2
              ? 'Integration need is identified but needs clearer system handoff detail.'
              : integrationLevel === 1
                ? 'Integration need is present but vague.'
                : 'No integration need was identified.',
    },
    {
      label: 'Budget readiness',
      points: budget,
      max: 10,
      detail:
        budget === 10
          ? 'Budget signal indicates strong implementation capacity.'
          : budget >= 8
            ? 'Budget signal supports a meaningful automation implementation.'
            : budget >= 5
              ? 'Budget signal supports a cautious starting point or scoped pilot.'
              : budget > 0
                ? 'Budget signal suggests early exploration rather than full implementation readiness.'
                : 'Budget signal is missing or uncertain.',
    },
    {
      label: 'Execution readiness',
      points: executionReadiness,
      max: 15,
      detail:
        executionReadiness === 15
          ? 'Pain points and automation goals include enough operational detail to support implementation planning.'
          : executionReadiness === 10
            ? 'Inputs show meaningful planning signals, but implementation details could be stronger.'
            : executionReadiness === 5
              ? 'Some execution signals are present, but workflow and goal detail need more specificity.'
              : 'Execution readiness is limited because workflow and goal detail are still thin.',
    },
  ]

  let score = factors.reduce((total, factor) => total + factor.points, 0)

  if (goals < 20 && score > 80) {
    score -= 10
  }

  if (executionReadiness < 15 && score > 85) {
    score -= 8
  }

  if (painPoints < 12 && score > 75) {
    score -= 6
  }

  if (integrations < 12 && score > 82) {
    score -= 5
  }

  score = Math.max(0, Math.min(100, score))

  return {
    score,
    band: getBand(score),
    summary: getSummary(score),
    factors,
  }
}