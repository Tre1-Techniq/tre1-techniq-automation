export type AutomationReadinessAuditInput = {
  primary_pain?: string | null
  time_wasters?: string[] | null
  current_tools?: string[] | null
  automation_goals?: string | null
  integration_needs?: string | null
  budget?: string | null
  industry?: string | null
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
    'lead',
    'handoff',
    'manual',
    'follow up',
    'follow-up',
    'crm',
    'email',
    'report',
    'approval',
    'intake',
    'tracking',
    'update',
    'qualify',
    'publish',
    'review',
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

function hasText(value?: string | null) {
  return Boolean(value && value.trim().length > 0)
}

function textLength(value?: string | null) {
  return value?.trim().length || 0
}

function scoreBudget(budget?: string | null) {
  if (!budget) return 0

  const value = budget.toLowerCase().trim()

  if (value.includes('$3,000') || value.includes('$5000') || value.includes('$5,000')) {
    return 10
  }

  if (value.includes('$1,000') && value.includes('$3,000')) {
    return 8
  }

  if (value.includes('$500') && value.includes('$1,000')) {
    return 5
  }

  if (value.includes('under') || value.includes('less than')) {
    return 3
  }

  if (value.includes('not sure') || value.includes('unknown')) {
    return 0
  }

  return 5
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
  const painLevel = specificityLevel(audit.primary_pain)

  const goalText = Array.isArray(audit.automation_goals)
    ? audit.automation_goals.join(' ')
    : audit.automation_goals || ''

  const goalLevel = specificityLevel(goalText)

  const integrationText = Array.isArray(audit.integration_needs)
    ? audit.integration_needs.join(' ')
    : audit.integration_needs || ''

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

  const executionReadiness =
    painLevel >= 4 && goalLevel >= 4
      ? 15
      : painLevel >= 3 && goalLevel >= 3
        ? 10
        : painLevel >= 2 && goalLevel >= 2
          ? 5
          : 0

  const factors = [
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

function detectRecommendationContext(audit: AutomationReadinessAuditInput) {
  const text = [
    audit.industry,
    audit.primary_pain,
    audit.automation_goals,
    audit.integration_needs,
    ...(audit.time_wasters || []),
    ...(audit.current_tools || []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  return {
    isEcommerce: text.includes('e-commerce') || text.includes('ecommerce') || text.includes('shopify'),
    hasShopify: text.includes('shopify'),
    hasSocialMedia: text.includes('social') || text.includes('instagram') || text.includes('facebook') || text.includes('tiktok'),
    hasLeadPain: text.includes('lead') || text.includes('sales') || text.includes('prospect'),
    hasContentPain: text.includes('content') || text.includes('youtube') || text.includes('podcast') || text.includes('social media'),
    hasReportingPain: text.includes('reporting') || text.includes('report'),
    hasManualEntry: text.includes('manual data entry') || text.includes('manual entry'),
    hasSlack: text.includes('slack'),
    hasMicrosoft365: text.includes('microsoft 365') || text.includes('office 365'),
    hasGoogleWorkspace: text.includes('google workspace'),
    hasCRM: text.includes('crm') || text.includes('salesforce') || text.includes('hubspot'),
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

function getEcommerceShopifyRecommendations(
  audit: AutomationReadinessAuditInput
): ToolAwareRecommendation[] {
  return [
    {
      title: 'Map the social-commerce order path before automating Shopify handoffs',
      why: 'Your audit points to social media sales and Shopify integration as the central automation opportunity. Before automation is added, the path from social interaction to product selection, checkout, customer record, and fulfillment needs to be clearly defined.',
      nextStep: 'Write the current path from social inquiry to Shopify order as 5–7 steps, then mark where manual entry, missed follow-up, or reporting delays occur.',
      toolContext: 'Shopify should remain the system of record for products, orders, and customer activity, while Slack and Microsoft 365 can support alerts, internal handoffs, and lightweight reporting.',
      suggestedPath: 'Start with one social channel and map how a customer moves from message, comment, or product interest into Shopify checkout and post-purchase follow-up.',
    },
    {
      title: 'Define what qualifies as a social-driven sale or lead',
      why: 'Automation will be more useful if the system can distinguish casual engagement from a purchase-ready customer or support-worthy inquiry.',
      nextStep: 'Create 3–5 qualification rules, such as product interest, purchase intent, order question, abandoned checkout signal, or repeat customer status.',
      toolContext: 'Shopify can anchor customer and order data, while Microsoft 365 can help document qualification rules and Slack can notify the team when a high-priority social interaction needs attention.',
      suggestedPath: 'Begin by tagging the most common social interactions and deciding which ones should create a Shopify action, internal alert, or follow-up task.',
    },
    {
      title: 'Create a simple reporting loop for social sales performance',
      why: 'Your audit identified reporting and social media integration as recurring friction points. A lightweight reporting loop can show which social channels are actually driving sales or customer activity.',
      nextStep: 'Choose three metrics to track weekly, such as social-driven orders, abandoned checkouts, and customer inquiries that converted into purchases.',
      toolContext: 'Shopify can provide sales/order data, Microsoft 365 can support weekly reporting, and Slack can deliver automated summaries or exceptions to the team.',
      suggestedPath: 'Start with a weekly report that connects social activity to Shopify outcomes before expanding into more advanced automation.',
    },
  ]
}

export function getContextAwareRecommendations({
  audit,
  readiness,
}: {
  audit: AutomationReadinessAuditInput
  readiness: AutomationReadinessResult
}): ToolAwareRecommendation[] {
  const context = detectRecommendationContext(audit)

  if (context.isEcommerce && context.hasShopify && context.hasSocialMedia) {
    return getEcommerceShopifyRecommendations(audit)
  }

  const baseRecommendations = getScoreAwareRecommendations(readiness)

  return addToolContextToRecommendations({
    recommendations: baseRecommendations,
    currentTools: audit.current_tools,
  })
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