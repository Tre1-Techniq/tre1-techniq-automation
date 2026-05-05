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

function capitalizeFirst(value: string) {
  if (!value) return value
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export function getScoreAwareRecommendations(
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

export function addToolContextToRecommendations({
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
  const toolsText = (audit.current_tools || []).join(' ').toLowerCase()

  const hasSlack = toolsText.includes('slack')
  const hasMicrosoft365 = toolsText.includes('microsoft 365')

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

const usesProjectManagement =
  audit.uses_project_management === true ||
  (audit.project_management_platforms || []).length > 0

const projectToolContext =
  usesProjectManagement && projectTool
    ? `${projectTool} can help route tasks, handoffs, owners, deadlines, and follow-up visibility.`
    : 'Because no project management platform was listed, a lightweight project management layer could help route tasks, owners, deadlines, and handoffs without relying on memory, email threads, or informal follow-up.'

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
      toolContext: `${crmName} can organize lead stages and follow-up rules. ${projectToolContext}`,
      suggestedPath:
        'Begin with one lead source and define what should happen when a lead is new, qualified, waiting on response, overdue, or ready for a sales conversation.',
    },
    {
      title: 'Create a visibility loop for lead follow-up performance',
      why:
        'Lead follow-up often breaks down because teams cannot easily see which leads are overdue, which source is producing qualified prospects, or where conversations are stalling.',
      nextStep:
        'Choose three weekly metrics to track, such as new leads, overdue follow-ups, and qualified leads moved to the next stage.',
      toolContext: `${crmName} can provide lead and pipeline data, and ${workspaceTool} can support lightweight reporting. ${projectToolContext}`,
      suggestedPath:
        'Start with a simple weekly review that connects lead source, CRM status, follow-up owner, and next action before building more advanced automation.',
    },
  ]
}

function getContentProductionRecommendations(
  audit: AutomationReadinessAuditInput
): ToolAwareRecommendation[] {
  const toolsText = (audit.current_tools || []).join(' ').toLowerCase()

  const hasGoogleWorkspace =
    toolsText.includes('google workspace') ||
    toolsText.includes('gmail') ||
    toolsText.includes('google sheets') ||
    toolsText.includes('google docs') ||
    toolsText.includes('google drive')

  const hasMicrosoft365 =
    toolsText.includes('microsoft 365') ||
    toolsText.includes('office 365') ||
    toolsText.includes('outlook') ||
    toolsText.includes('excel') ||
    toolsText.includes('sharepoint') ||
    toolsText.includes('onedrive')

  const hasSlack = toolsText.includes('slack')
  const hasTrello = toolsText.includes('trello')
  const hasAsana = toolsText.includes('asana')
  const hasNotion = toolsText.includes('notion')

  const workspaceTool = hasGoogleWorkspace
    ? 'Google Workspace'
    : hasMicrosoft365
      ? 'Microsoft 365'
      : 'your workspace tools'

const projectTool =
  audit.project_management_platforms?.[0] ||
  (toolsText.includes('trello')
    ? 'Trello'
    : toolsText.includes('asana')
      ? 'Asana'
      : toolsText.includes('notion')
        ? 'Notion'
        : toolsText.includes('clickup')
          ? 'ClickUp'
          : toolsText.includes('monday')
            ? 'Monday'
            : toolsText.includes('jira')
              ? 'Jira'
              : null)

const projectToolName = projectTool || 'a lightweight project management tool'
const projectToolSentence = capitalizeFirst(projectToolName)

  const communicationTool = hasSlack ? 'Slack' : 'your communication tools'

  return [
    {
      title: 'Map the content production pipeline from idea to publishing',
      why:
        'Your audit points to repeatable content work as a meaningful automation opportunity. Before automating content tasks, the business needs a clear production path from idea capture to drafting, editing, approval, publishing, and repurposing.',
      nextStep:
        'Write the current content workflow as 5–7 steps, starting with idea intake and ending with the published or repurposed asset.',
      toolContext: `${workspaceTool} can support scripts, drafts, content calendars, and asset organization, while ${projectTool} can track production stages, owners, deadlines, and publishing status.`,
      suggestedPath:
        'Start by choosing one content format, such as YouTube, podcast, blog, or social post, then map who owns each step and where assets currently move manually.',
    },
    {
      title: 'Define content handoff and approval rules',
      why:
        'Content workflows often slow down because ownership, review status, and publishing readiness are unclear. Automation works best when the system knows what triggers the next step.',
      nextStep:
        'Create 3–5 workflow rules, such as when an idea becomes a draft, when an edit is ready for review, when an asset is approved, and when a post should be scheduled.',
      toolContext: `${projectToolSentence} can organize content stages and task ownership, while ${communicationTool} can support alerts, review reminders, and approval handoffs.`,
      suggestedPath:
        'Begin with one recurring content type and define the trigger, owner, due date, review step, and publishing destination for each stage.',
    },
    {
      title: 'Create a repurposing and performance feedback loop',
      why:
        'Content automation becomes more valuable when one core asset can generate multiple outputs and performance data informs what should be produced next.',
      nextStep:
        'Choose three repeatable outputs from one core asset, such as a short clip, social post, email summary, or blog outline.',
      toolContext: `${workspaceTool} can help store source content, drafts, and performance notes, while ${projectTool} can track which repurposed assets have been created, scheduled, and reviewed.`,
      suggestedPath:
        'Start with one published asset and define how it should be transformed into smaller content pieces, where those pieces are stored, and how performance gets reviewed weekly.',
    },
  ]
}

function getReportingDataEntryRecommendations(
  audit: AutomationReadinessAuditInput
): ToolAwareRecommendation[] {
  const toolsText = (audit.current_tools || []).join(' ').toLowerCase()

  const hasGoogleWorkspace =
    toolsText.includes('google workspace') ||
    toolsText.includes('google sheets') ||
    toolsText.includes('google drive')

  const hasMicrosoft365 =
    toolsText.includes('microsoft 365') ||
    toolsText.includes('excel') ||
    toolsText.includes('sharepoint') ||
    toolsText.includes('onedrive')

  const hasSlack = toolsText.includes('slack')

  const dataTool = hasGoogleWorkspace
    ? 'Google Sheets'
    : hasMicrosoft365
      ? 'Excel'
      : 'your spreadsheet or reporting tool'

  const workspaceTool = hasGoogleWorkspace
    ? 'Google Workspace'
    : hasMicrosoft365
      ? 'Microsoft 365'
      : 'your workspace tools'

  const alertTool = hasSlack ? 'Slack' : 'your communication tools'
  

  return [
    {
      title: 'Map where manual data entry enters the workflow',
      why:
        'Your audit points to reporting, spreadsheets, or manual data movement as a meaningful automation opportunity. Before building dashboards or automations, the business needs to identify where data is being copied, cleaned, re-entered, or manually summarized.',
      nextStep:
        'List the top 3 recurring data tasks and identify the source, destination, owner, frequency, and final report or decision they support.',
      toolContext: `${dataTool} can help reveal where data is being manually organized, while ${workspaceTool} can support documentation, shared files, and lightweight reporting structure.`,
      suggestedPath:
        'Start with one recurring report and map where the data comes from, who updates it, what gets transformed, and who uses the final output.',
    },
    {
      title: 'Define a clean source-of-truth for reporting data',
      why:
        'Reporting automation breaks down when multiple people or tools maintain different versions of the same information. A clear source-of-truth reduces duplication and makes dashboards more reliable.',
      nextStep:
        'Choose which system should own each important data type, such as leads, orders, clients, tasks, revenue, appointments, or performance metrics.',
      toolContext: `${workspaceTool} can support shared documentation and reporting files, while ${dataTool} can act as a lightweight reporting layer when the source data is clearly defined.`,
      suggestedPath:
        'Begin by marking which data is original, which data is copied, which data is calculated, and which data should trigger a report or follow-up action.',
    },
    {
      title: 'Create a reporting loop that turns data into decisions',
      why:
        'The goal is not just to collect data faster. The real value comes from creating a repeatable reporting loop that shows what changed, what needs attention, and what action should happen next.',
      nextStep:
        'Choose three weekly metrics that would help the team make better decisions or reduce manual follow-up.',
      toolContext: `${dataTool} can summarize key metrics, and ${alertTool} can help notify the team when a report is ready or when a metric needs attention.`,
      suggestedPath:
        'Start with one simple weekly dashboard or summary before expanding into more complex reporting automation.',
    },
  ]
}

function getClientCommunicationRecommendations(
  audit: AutomationReadinessAuditInput
): ToolAwareRecommendation[] {
  const toolsText = (audit.current_tools || []).join(' ').toLowerCase()

  const hasGoogleWorkspace =
    toolsText.includes('google workspace') ||
    toolsText.includes('gmail') ||
    toolsText.includes('google forms') ||
    toolsText.includes('google sheets')

  const hasMicrosoft365 =
    toolsText.includes('microsoft 365') ||
    toolsText.includes('outlook') ||
    toolsText.includes('excel') ||
    toolsText.includes('sharepoint')

  const hasCalendly = toolsText.includes('calendly')
  const hasZoom = toolsText.includes('zoom')
  const hasCrm =
    toolsText.includes('hubspot') ||
    toolsText.includes('salesforce') ||
    toolsText.includes('crm')

  const intakeTool = hasGoogleWorkspace
    ? 'Google Forms or Google Sheets'
    : hasMicrosoft365
      ? 'Microsoft Forms, Outlook, or Excel'
      : 'your intake tools'

  const meetingTool = hasCalendly && hasZoom
    ? 'Calendly and Zoom'
    : hasCalendly
      ? 'Calendly'
      : hasZoom
        ? 'Zoom'
        : 'your scheduling or meeting tools'

  const recordTool = hasCrm ? 'your CRM' : 'your client record system'

  const recordToolSentence = capitalizeFirst(recordTool)

  return [
    {
      title: 'Map the client intake path from inquiry to next action',
      why:
        'Your audit points to intake, communication, or follow-up as a workflow opportunity. Before automating responses, the business needs a clear path from initial inquiry to qualification, scheduling, internal handoff, and next action.',
      nextStep:
        'Write the current client intake path as 5–7 steps, starting with the first inquiry and ending with the next scheduled action or completed handoff.',
      toolContext: `${intakeTool} can capture structured client information, ${meetingTool} can support scheduling or consultation steps, and ${recordTool} can preserve client status and follow-up history.`,
      suggestedPath:
        'Start by identifying where requests enter, what information is required, who reviews it, and what should happen when the client is ready for the next step.',
    },
    {
      title: 'Define communication and follow-up trigger rules',
      why:
        'Client communication often breaks down when response timing, ownership, and follow-up expectations are unclear. Automation works best when the system knows what event should trigger the next message or task.',
      nextStep:
        'Create 3–5 communication rules, such as new inquiry received, missing information, consultation booked, no response after 48 hours, or follow-up required.',
      toolContext: `${recordToolSentence} can track client status and follow-up history, while ${intakeTool} can reduce back-and-forth by collecting the right information upfront.`,
      suggestedPath:
        'Begin with one common inquiry type and define the trigger, message, owner, deadline, and desired outcome for each follow-up step.',
    },
    {
      title: 'Create a visibility loop for open client requests',
      why:
        'A client communication workflow needs visibility into what is open, overdue, waiting on the client, or ready for internal action.',
      nextStep:
        'Choose three status categories to track, such as new inquiry, waiting on client, scheduled, overdue, or completed.',
      toolContext: `${intakeTool} can support request tracking, while ${recordTool} can help maintain a reliable view of client status and next action.`,
      suggestedPath:
        'Start with a simple weekly or daily view of open client requests before building more advanced reminders, routing, or automated follow-up.',
    },
  ]
}

function getInternalOpsRecommendations(
  audit: AutomationReadinessAuditInput
): ToolAwareRecommendation[] {
  const toolsText = (audit.current_tools || []).join(' ').toLowerCase()

  const hasTrello = toolsText.includes('trello')
  const hasAsana = toolsText.includes('asana')
  const hasNotion = toolsText.includes('notion')
  const hasClickUp = toolsText.includes('clickup')
  const hasMonday = toolsText.includes('monday')
  const hasJira = toolsText.includes('jira')
  const hasSlack = toolsText.includes('slack')

  const projectTool = hasTrello
    ? 'Trello'
    : hasAsana
      ? 'Asana'
      : hasNotion
        ? 'Notion'
        : hasClickUp
          ? 'ClickUp'
          : hasMonday
            ? 'Monday'
            : hasJira
              ? 'Jira'
              : 'your project management tool'

  const communicationTool = hasSlack ? 'Slack' : 'your communication tools'

  return [
    {
      title: 'Map the internal handoff path from trigger to completion',
      why:
        'Your audit points to internal workflow coordination, task ownership, or handoffs as a meaningful automation opportunity. Before automating tasks, the business needs to define what triggers work, who owns it, and what completion looks like.',
      nextStep:
        'Write one recurring internal workflow as 5–7 steps, starting with the trigger and ending with the completed task, approval, or status update.',
      toolContext: `${projectTool} can track task ownership, stages, deadlines, and completion status, while ${communicationTool} can support alerts, exceptions, and handoff reminders.`,
      suggestedPath:
        'Start with one workflow that frequently stalls and identify the trigger, owner, next step, due date, and final output for each stage.',
    },
    {
      title: 'Define task ownership and status rules',
      why:
        'Internal operations often slow down when ownership and status are unclear. Automation works best when every task has a defined owner, trigger, deadline, and next action.',
      nextStep:
        'Create 3–5 task rules, such as who receives new work, when a task becomes overdue, what requires approval, and what status means complete.',
      toolContext: `${projectTool} can organize status rules and ownership, while ${communicationTool} can notify the team when work is blocked, overdue, or ready for review.`,
      suggestedPath:
        'Begin by defining the statuses your team actually uses, then connect each status to the next expected action.',
    },
    {
      title: 'Create an operational visibility loop',
      why:
        'A strong internal workflow needs visibility into what is active, blocked, overdue, waiting on review, or completed. This makes automation more useful because the system can highlight exceptions instead of just creating more tasks.',
      nextStep:
        'Choose three operational signals to review weekly, such as overdue tasks, blocked handoffs, approval delays, or work completed on time.',
      toolContext: `${projectTool} can provide workflow status, while ${communicationTool} can surface alerts and exceptions without relying on manual check-ins.`,
      suggestedPath:
        'Start with one simple operations view that shows active work, blocked work, overdue work, and completed work before adding advanced automation.',
    },
  ]
}

function getLowInputFallbackRecommendations(
  audit: AutomationReadinessAuditInput,
  readiness: AutomationReadinessResult
): ToolAwareRecommendation[] {
  const baseRecommendations = getScoreAwareRecommendations(readiness)

  const fallbackRecommendations: ScoreAwareRecommendation[] =
    baseRecommendations.length > 0
      ? baseRecommendations
      : [
          {
            title: 'Clarify the first workflow automation should improve',
            why:
              'The audit does not yet include enough detail to identify a specific automation path. The first priority is to define one workflow clearly enough to evaluate.',
            nextStep:
              'Choose one workflow and describe where it starts, who is involved, what slows it down, and what the desired outcome should be.',
          },
        ]

  return addToolContextToRecommendations({
    recommendations: fallbackRecommendations,
    currentTools: audit.current_tools,
  })
}

function getAccountingPosRecommendations(
  audit: AutomationReadinessAuditInput
): ToolAwareRecommendation[] {
  return [
    {
      title: 'Map the transaction flow between POS activity and QuickBooks',
      why:
        'Your audit points to financial or transaction systems as important workflow inputs. Before automation is added, the business needs to understand how sales, payments, receipts, invoices, and accounting records move between the POS system, QuickBooks, and reporting workflows.',
      nextStep:
        'Write the current transaction path as 5–7 steps, starting with a sale or payment and ending with the accounting record, report, or reconciliation step.',
      toolContext:
        'QuickBooks should support accounting, invoices, payments, and reconciliation, while the POS system should capture front-line sales or transaction activity.',
      suggestedPath:
        'Start with one common transaction type and identify where it is entered, where it is verified, where it is summarized, and where errors or manual re-entry occur.',
    },
    {
      title: 'Define which system owns each financial data point',
      why:
        'Automation becomes unreliable when sales, payment, customer, invoice, and accounting data are duplicated across systems without clear ownership.',
      nextStep:
        'List the key data fields that matter most, such as sale amount, payment status, customer name, invoice number, product or service sold, tax, and reconciliation status.',
      toolContext:
        'The POS system can act as the source for sales transactions, while QuickBooks can act as the source for accounting, invoicing, reconciliation, and financial reporting.',
      suggestedPath:
        'Begin by marking which data starts in the POS system, which data belongs in QuickBooks, and which data needs to appear in reports.',
    },
    {
      title: 'Create a simple reconciliation and reporting loop',
      why:
        'A transaction workflow needs visibility into whether sales, payments, invoices, and accounting records match. This is often where manual review and spreadsheet work become expensive.',
      nextStep:
        'Choose three weekly checks, such as POS sales vs. QuickBooks revenue, unpaid invoices, and transactions requiring manual correction.',
      toolContext:
        'QuickBooks can support financial reporting and reconciliation, while POS data can provide the operational sales activity that needs to be checked or summarized.',
      suggestedPath:
        'Start with a weekly summary that compares POS activity to QuickBooks records before adding more advanced automation.',
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

  if (context.hasContentPain) {
    return getContentProductionRecommendations(audit)
  }

  if (context.hasClientCommunication) {
    return getClientCommunicationRecommendations(audit)
  }

  if (context.hasInternalOpsPain || context.hasProjectManagement) {
    return getInternalOpsRecommendations(audit)
  }

  if (context.hasAccountingWorkflow || context.hasPosWorkflow) {
    return getAccountingPosRecommendations(audit)
  }

  if (context.hasReportingPain || context.hasManualEntry) {
    return getReportingDataEntryRecommendations(audit)
  }

  if (context.hasLeadPain && context.hasCRM) {
    return getLeadCrmRecommendations(audit)
  }

  return getLowInputFallbackRecommendations(audit, readiness)
}