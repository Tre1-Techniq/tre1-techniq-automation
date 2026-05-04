import type {
  AutomationReadinessAuditInput,
  AutomationReadinessResult,
  ScoreAwareRecommendation,
  ToolAwareRecommendation,
} from './automationReadiness'
import { detectRecommendationContext } from './recommendationContexts'
import {
  buildGeneralSuggestedPath,
  buildGeneralToolContext,
} from './toolModifiers'

function getScoreAwareRecommendations(
  readiness: AutomationReadinessResult
): ScoreAwareRecommendation[] {
  const weakestFactors = [...(readiness.factors || [])]
    .sort((a, b) => {
      const aRatio = a.max > 0 ? a.points / a.max : 1
      const bRatio = b.max > 0 ? b.points / b.max : 1
      return aRatio - bRatio
    })
    .slice(0, 3)

  if (weakestFactors.length === 0) {
    return [
      {
        title: 'Clarify the first workflow automation should improve',
        why: 'Automation works best when the first workflow target is clearly defined.',
        nextStep:
          'Choose one workflow and describe where it starts, what slows it down, who is involved, and what the desired output should be.',
      },
    ]
  }

  return weakestFactors.map((factor) => {
    switch (factor.label) {
      case 'Pain clarity':
        return {
          title: 'Clarify your primary workflow bottleneck',
          why: 'Automation works best when the exact constraint is clearly defined.',
          nextStep:
            'Write one sentence that describes where the workflow slows down, who is affected, and what happens next.',
        }

      case 'Automation goal clarity':
        return {
          title: 'Define the outcome automation should improve',
          why: 'A clear goal keeps automation focused on business value instead of novelty.',
          nextStep:
            'Choose one measurable target such as faster response time, fewer manual updates, cleaner reporting, or better lead qualification.',
        }

      case 'Integration opportunity':
        return {
          title: 'Identify the system handoff automation should connect',
          why: 'Most automation value appears where information moves between people, tools, or departments.',
          nextStep:
            'Write down which tool or person owns the input, which system needs the output, and what currently happens manually between them.',
        }

      case 'Execution readiness':
        return {
          title: 'Document the workflow before automating it',
          why: 'A workflow must be understood before it can be automated reliably.',
          nextStep:
            'Write the current process as 5–7 steps, then mark which steps are manual, repetitive, or error-prone.',
        }

      case 'Tool stack clarity':
        return {
          title: 'Define where key business data currently lives',
          why: 'Automation depends on knowing which system owns each type of information.',
          nextStep:
            'List your core tools and mark what each one owns: leads, orders, tasks, files, messages, reports, or customer records.',
        }

      case 'Repetitive task signals':
        return {
          title: 'Identify the most repeated manual task',
          why: 'Repeated tasks are usually the best first automation candidates.',
          nextStep:
            'Choose the task that happens most often and write down its trigger, steps, owner, and expected result.',
        }

      case 'Budget readiness':
        return {
          title: 'Start with a scoped automation pilot',
          why: 'A focused pilot reduces risk while proving automation value.',
          nextStep:
            'Choose one workflow that can be improved without rebuilding your entire system.',
        }

      default:
        return {
          title: 'Map the workflow before selecting automation tools',
          why: 'Clear workflows reduce the risk of automating the wrong process.',
          nextStep:
            'Write the current process from trigger to final outcome, then mark where delays or manual handoffs occur.',
        }
    }
  })
}

function addToolContextToRecommendations({
  recommendations,
  currentTools,
}: {
  recommendations: ScoreAwareRecommendation[]
  currentTools?: string[] | null
}): ToolAwareRecommendation[] {
  const toolContext = buildGeneralToolContext(currentTools)
  const suggestedPath = buildGeneralSuggestedPath(currentTools)

  return recommendations.map((recommendation) => ({
    ...recommendation,
    toolContext,
    suggestedPath,
  }))
}

function getEcommerceShopifyRecommendations(
  audit: AutomationReadinessAuditInput
): ToolAwareRecommendation[] {
  const hasSlack = (audit.current_tools || [])
    .join(' ')
    .toLowerCase()
    .includes('slack')

  const hasMicrosoft365 = (audit.current_tools || [])
    .join(' ')
    .toLowerCase()
    .includes('microsoft 365')

  const supportTools =
    hasSlack && hasMicrosoft365
      ? 'Slack and Microsoft 365'
      : hasSlack
        ? 'Slack'
        : hasMicrosoft365
          ? 'Microsoft 365'
          : 'your internal tools'

  return [
    {
      title: 'Map the social-commerce data flow before automating Shopify handoffs',
      why:
        'Your audit points to social media sales and Shopify integration as the central automation opportunity. Shopify can support API-connected sales channels, but automation will only be useful if the path from social interaction to product selection, checkout, customer record, inventory update, and fulfillment is clearly defined.',
      nextStep:
        'Write the current path from social inquiry or marketplace activity to Shopify order as 5–7 steps, then mark where manual entry, missed follow-up, reporting delays, or inventory mismatches occur.',
      toolContext: `Shopify should remain the system of record for products, orders, inventory, checkout, and customer activity, while ${supportTools} can support alerts, internal handoffs, documentation, and lightweight reporting.`,
      suggestedPath:
        'Start with one social channel or marketplace and map how customer activity should move into Shopify, then define which fields need to be extracted, transformed, and loaded into reporting or follow-up workflows.',
    },
    {
      title: 'Define the ETL path for social marketplace activity',
      why:
        'Multi-channel commerce often creates fragmented data across comments, messages, marketplace actions, product interest, orders, and follow-up activity. The automation opportunity is not just connecting tools; it is defining how social and marketplace data should be extracted, transformed into consistent business signals, and loaded into Shopify or reporting workflows.',
      nextStep:
        'Create 3–5 data rules, such as what counts as purchase intent, which interactions should create a follow-up task, which order data should sync into reporting, and which inventory or fulfillment events need alerts.',
      toolContext:
        'Shopify can anchor customer, product, order, and inventory data. Supporting tools can document transformation rules, route exceptions, and help the team interpret social-commerce activity without manually sorting through every channel.',
      suggestedPath:
        'Begin by tagging the most common social or marketplace interactions and deciding which ones should create a Shopify action, internal alert, reporting update, or customer follow-up.',
    },
    {
      title: 'Create a reporting loop that connects social activity to Shopify outcomes',
      why:
        'Your audit identified reporting and social media integration as recurring friction points. A lightweight reporting loop can show which social channels actually drive product interest, customer activity, abandoned checkouts, and completed orders.',
      nextStep:
        'Choose three metrics to track weekly, such as social-driven orders, abandoned checkouts, and customer inquiries that converted into purchases.',
      toolContext:
        'Shopify can provide order and customer data, while internal reporting tools can summarize performance and alert the team to exceptions, conversion trends, or inventory signals.',
      suggestedPath:
        'Start with a weekly report that connects social activity to Shopify outcomes before expanding into more advanced automation or full multi-channel data pipelines.',
    },
  ]
}

function getLeadCrmRecommendations(
  audit: AutomationReadinessAuditInput
): ToolAwareRecommendation[] {
  const toolsText = (audit.current_tools || []).join(' ').toLowerCase()

  const hasHubSpot = toolsText.includes('hubspot')
  const hasSalesforce = toolsText.includes('salesforce')
  const hasTrello = toolsText.includes('trello')
  const hasAsana = toolsText.includes('asana')
  const hasGoogleWorkspace =
    toolsText.includes('google workspace') ||
    toolsText.includes('gmail') ||
    toolsText.includes('google sheets')

  const crmName = hasHubSpot
    ? 'HubSpot'
    : hasSalesforce
      ? 'Salesforce'
      : 'your CRM'

  const projectTool = hasTrello
    ? 'Trello'
    : hasAsana
      ? 'Asana'
      : 'your project management tool'

  const workspaceTool = hasGoogleWorkspace
    ? 'Google Workspace'
    : 'your workspace tools'

  return [
    {
      title: 'Map the lead follow-up path from inquiry to CRM stage',
      why:
        'Your audit points to lead follow-up as the main workflow constraint. Before automating reminders or handoffs, the business needs a clear path from initial inquiry to qualification, CRM stage, follow-up owner, and next action.',
      nextStep:
        'Write the current lead path as 5–7 steps, starting with the first inquiry and ending with the next scheduled follow-up or closed opportunity.',
      toolContext: `${crmName} should serve as the system of record for lead status, qualification notes, and follow-up history, while ${workspaceTool} can support forms, email, documents, and reporting around the sales process.`,
      suggestedPath:
        'Start by identifying where new leads enter the business, who reviews them, what qualifies them, and which CRM stage should trigger the next follow-up action.',
    },
    {
      title: 'Define lead qualification and follow-up trigger rules',
      why:
        'Follow-up automation works best when the system knows which leads require immediate action, which ones need nurturing, and which ones should be deprioritized.',
      nextStep:
        'Create 3–5 lead rules, such as inquiry source, urgency, budget fit, product or service interest, response status, and time since last contact.',
      toolContext: `${crmName} can organize lead stages and follow-up rules, while ${projectTool} can help route tasks or implementation follow-ups when a lead becomes actionable.`,
      suggestedPath:
        'Begin with one lead source and define what should happen when a lead is new, qualified, waiting on response, overdue, or ready for a sales conversation.',
    },
    {
      title: 'Create a visibility loop for lead follow-up performance',
      why:
        'Lead follow-up often breaks down because teams cannot easily see which leads are overdue, which source is producing qualified prospects, or where conversations are stalling.',
      nextStep:
        'Choose three weekly metrics to track, such as new leads, overdue follow-ups, and qualified leads moved to the next stage.',
      toolContext: `${crmName} can provide lead and pipeline data, ${workspaceTool} can support lightweight reporting, and ${projectTool} can help track internal follow-up tasks or handoffs.`,
      suggestedPath:
        'Start with a simple weekly review that connects lead source, CRM status, follow-up owner, and next action before building more advanced automation.',
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

  if (context.hasLeadPain && context.hasCRM) {
    return getLeadCrmRecommendations(audit)
  }

  const baseRecommendations = getScoreAwareRecommendations(readiness)

  return addToolContextToRecommendations({
    recommendations: baseRecommendations,
    currentTools: audit.current_tools,
  })
}