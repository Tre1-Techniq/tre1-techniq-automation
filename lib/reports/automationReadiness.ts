export type AutomationReadinessAuditInput = {
  primary_pain?: string | null
  time_wasters?: string[] | null
  current_tools?: string[] | null
  automation_goals?: string | null
  integration_needs?: string | null
  budget?: string | null
}

export type AutomationReadinessResult = {
  score: number
  band: 'Early Stage' | 'Emerging' | 'Ready' | 'High Readiness'
  summary: string
  factors: {
    label: string
    points: number
    max: number
    detail: string
  }[]
}

function hasText(value?: string | null) {
  return Boolean(value && value.trim().length > 0)
}

function textLength(value?: string | null) {
  return value?.trim().length || 0
}

function scoreBudget(budget?: string | null) {
  if (!hasText(budget)) return 2

  const normalized = budget!.toLowerCase()

  if (
    normalized.includes('not sure') ||
    normalized.includes('unsure') ||
    normalized.includes('unknown') ||
    normalized.includes('exploring')
  ) {
    return 2
  }

  if (
    normalized.includes('under') ||
    normalized.includes('low') ||
    normalized.includes('small')
  ) {
    return 5
  }

  return 10
}

function getBand(score: number): AutomationReadinessResult['band'] {
  if (score >= 88) return 'High Readiness'
  if (score >= 68) return 'Ready'
  if (score >= 40) return 'Emerging'
  return 'Early Stage'
}

function getSummary(score: number) {
  if (score >= 80) {
    return 'Strong automation readiness signals are present. The next step is prioritizing implementation.'
  }

  if (score >= 60) {
    return 'The audit shows enough clarity to begin mapping a focused automation plan.'
  }

  if (score >= 40) {
    return 'Some useful signals are present, but more workflow clarity would strengthen the automation plan.'
  }

  return 'The audit shows early signals. More detail is needed before recommending a strong automation path.'
}

export function calculateAutomationReadiness(
  audit: AutomationReadinessAuditInput
): AutomationReadinessResult {
  const painLength = textLength(audit.primary_pain)
  const painPoints = painLength >= 80 ? 15 : painLength > 0 ? 10 : 0

  const integrations = hasText(audit.integration_needs) ? 15 : 0

  const budget = scoreBudget(audit.budget)

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
    toolsCount >= 3
      ? 10
      : toolsCount === 2
        ? 7
        : toolsCount === 1
          ? 4
          : 0

  const goals =
    textLength(audit.automation_goals) >= 80
      ? 20
      : hasText(audit.automation_goals)
        ? 10
        : 0

  const executionReadiness =
    textLength(audit.primary_pain) >= 120 && textLength(audit.automation_goals) >= 120
      ? 15
      : textLength(audit.primary_pain) >= 80 && textLength(audit.automation_goals) >= 80
        ? 10
        : textLength(audit.primary_pain) >= 40 && textLength(audit.automation_goals) >= 40
          ? 5
          : 0     

  const factors = [
    {
  label: 'Pain clarity',
  points: painPoints,
  max: 15,
  detail:
    painPoints === 15
      ? 'Primary pain point is detailed and clearly identified.'
      : painPoints === 10
        ? 'Primary pain point is identified but needs more operational detail.'
        : 'Primary pain point needs more detail.',
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
      toolsCount >= 3
        ? 'Multiple current tools were provided.'
        : toolsCount === 2
          ? 'Two current tools were provided.'
          : toolsCount === 1
            ? 'One current tool was provided.'
            : 'Current tool stack needs more detail.',
  },
  {
    label: 'Automation goal clarity',
    points: goals,
    max: 20,
    detail:
      goals === 20
        ? 'Automation goals are detailed enough to guide planning.'
        : goals === 10
          ? 'Automation goals are present but need more specificity.'
          : 'Automation goals are missing or unclear.',
  },
  {
  label: 'Integration opportunity',
  points: integrations,
  max: 15,
  detail: integrations
    ? 'Integration needs suggest a clear systems opportunity.'
    : 'Integration needs are not yet defined.',
  },
  {
    label: 'Budget readiness',
    points: budget,
    max: 10,
    detail:
      budget === 10
        ? 'Budget signal is defined.'
        : budget === 5
          ? 'Budget signal suggests a cautious starting point.'
          : 'Budget signal is early or uncertain.',
  },
  {
    label: 'Execution readiness',
    points: executionReadiness,
    max: 15,
    detail:
      executionReadiness === 15
        ? 'Pain points and automation goals are detailed enough to support implementation planning.'
        : executionReadiness === 10
          ? 'Inputs show meaningful planning signals, but implementation details could be stronger.'
          : executionReadiness === 5
            ? 'Some execution signals are present, but the workflow needs more detail.'
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

  // Prevent high readiness scores unless strong planning + execution signals exist

  return {
    score,
    band: getBand(score),
    summary: getSummary(score),
    factors,
  }
}

export type ScoreAwareRecommendation = {
  title: string
  why: string
  nextStep: string
}

export function getScoreAwareRecommendations(
  readiness: AutomationReadinessResult
): ScoreAwareRecommendation[] {
  const weakestFactors = [...readiness.factors]
    .map((factor) => ({
      ...factor,
      ratio: factor.max > 0 ? factor.points / factor.max : 0,
    }))
    .sort((a, b) => a.ratio - b.ratio)
    .slice(0, 3)

  return weakestFactors.map((factor) => {
    switch (factor.label) {
      case 'Pain clarity':
        return {
          title: 'Clarify your primary workflow bottleneck',
          why: 'Automation works best when the exact constraint is clearly defined.',
          nextStep: 'Write one sentence that describes where the workflow slows down, who is affected, and what happens next.',
        }

      case 'Repetitive task signals':
        return {
          title: 'List your recurring manual tasks',
          why: 'Repeatable tasks are usually the safest first candidates for automation.',
          nextStep: 'Identify two to three tasks your team repeats every week, then rank them by time spent.',
        }

      case 'Tool stack clarity':
        return {
          title: 'Map your current tool stack',
          why: 'Clear tool mapping helps identify where data should move automatically.',
          nextStep: 'List the tools involved in your workflow and note what information each tool sends or receives.',
        }

      case 'Automation goal clarity':
        return {
          title: 'Define the outcome automation should improve',
          why: 'A clear goal keeps automation focused on business value instead of novelty.',
          nextStep: 'Choose one measurable target such as faster response time, fewer manual updates, or better lead qualification.',
        }

      case 'Integration opportunity':
        return {
          title: 'Identify your key system handoffs',
          why: 'Most automation value comes from reducing manual handoffs between tools.',
          nextStep: 'Pick one workflow and document where information moves from one system, person, or spreadsheet to another.',
        }

      case 'Budget readiness':
        return {
          title: 'Set a starting implementation range',
          why: 'Budget clarity helps match recommendations to the right level of complexity.',
          nextStep: 'Choose a comfortable starting range for a first automation project, even if it is only exploratory.',
        }

      case 'Execution readiness':
        return {
          title: 'Document the workflow before automating it',
          why: 'A workflow must be understood before it can be automated reliably.',
          nextStep: 'Write the current process as 5–7 steps, then mark which steps are manual, repetitive, or error-prone.',
        }

      default:
        return {
          title: factor.label,
          why: factor.detail,
          nextStep: 'Review this area and add more detail to improve your automation plan.',
        }
    }
  })
}

export type ToolAwareRecommendation = ScoreAwareRecommendation & {
  toolContext?: string
  suggestedPath?: string
}

function normalizeTools(tools?: string[] | null) {
  return (tools || []).map((tool) => tool.toLowerCase())
}

function hasTool(tools: string[], keywords: string[]) {
  return tools.some((tool) => keywords.some((keyword) => tool.includes(keyword)))
}

export function addToolContextToRecommendations({
  recommendations,
  currentTools,
}: {
  recommendations: ScoreAwareRecommendation[]
  currentTools?: string[] | null
}): ToolAwareRecommendation[] {
  const tools = normalizeTools(currentTools)

  return recommendations.map((recommendation) => {
    if (hasTool(tools, ['google', 'gmail', 'workspace', 'sheets', 'docs'])) {
      return {
        ...recommendation,
        toolContext: 'Your current Google Workspace setup can often support lightweight workflow automation and data organization.',
        suggestedPath: 'Start by mapping where forms, emails, documents, or spreadsheets currently create manual handoffs.',
      }
    }

    if (hasTool(tools, ['slack'])) {
      return {
        ...recommendation,
        toolContext: 'Slack can become a useful notification and triage layer for automation workflows.',
        suggestedPath: 'Identify which alerts, approvals, or status updates should route into Slack instead of living in email threads.',
      }
    }

    if (hasTool(tools, ['hubspot', 'salesforce', 'crm'])) {
      return {
        ...recommendation,
        toolContext: 'Your CRM can become the central system of record for lead and customer workflow automation.',
        suggestedPath: 'Start by identifying which lead status changes, follow-ups, or qualification steps should trigger automatically.',
      }
    }

    if (hasTool(tools, ['zapier', 'make', 'n8n'])) {
      return {
        ...recommendation,
        toolContext: 'Your stack already includes an automation connector, which makes implementation more realistic.',
        suggestedPath: 'Choose one repeatable workflow and define the trigger, action, and destination before building the automation.',
      }
    }

    if (hasTool(tools, ['notion', 'airtable', 'clickup', 'asana', 'trello', 'monday'])) {
      return {
        ...recommendation,
        toolContext: 'Your project or knowledge-management tools can help structure repeatable workflows before automation is added.',
        suggestedPath: 'Document the current process in one shared workspace, then identify where status updates or task creation can be automated.',
      }
    }

    return {
      ...recommendation,
      toolContext: 'Your submitted tools provide useful context, but the workflow should be mapped before selecting an automation path.',
      suggestedPath: 'Start by identifying the trigger, manual step, and desired output for one repeatable workflow.',
    }
  })
}