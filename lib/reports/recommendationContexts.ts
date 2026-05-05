import type { AutomationReadinessAuditInput } from './automationReadiness'

export type RecommendationContext = {
  isEcommerce: boolean
  hasShopify: boolean
  hasSocialMedia: boolean
  hasLeadPain: boolean
  hasContentPain: boolean
  hasReportingPain: boolean
  hasManualEntry: boolean
  hasClientCommunication: boolean
  hasInternalOpsPain: boolean
  hasSlack: boolean
  hasMicrosoft365: boolean
  hasGoogleWorkspace: boolean
  hasCRM: boolean
  hasProjectManagement: boolean
  hasAccountingWorkflow: boolean
  hasPosWorkflow: boolean
}

function normalizeAuditText(audit: AutomationReadinessAuditInput) {
  return [
    audit.company_name,
    audit.industry,
    audit.company_size,
    audit.primary_pain,
    Array.isArray(audit.automation_goals)
      ? audit.automation_goals.join(' ')
      : audit.automation_goals,
    Array.isArray(audit.integration_needs)
      ? audit.integration_needs.join(' ')
      : audit.integration_needs,
    ...(audit.time_wasters || []),
    ...(audit.current_tools || []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

export function detectRecommendationContext(
  audit: AutomationReadinessAuditInput
): RecommendationContext {
  const text = normalizeAuditText(audit)

  return {
    isEcommerce:
        text.includes('e-commerce') ||
        text.includes('ecommerce') ||
        text.includes('commerce') ||
        text.includes('shopify') ||
        text.includes('store') ||
        text.includes('checkout'),

    hasShopify: text.includes('shopify'),

    hasSocialMedia:
        text.includes('social') ||
        text.includes('instagram') ||
        text.includes('facebook') ||
        text.includes('tiktok') ||
        text.includes('youtube') ||
        text.includes('marketplace'),

    hasLeadPain:
        text.includes('lead') ||
        text.includes('sales follow') ||
        text.includes('sales follow-up') ||
        text.includes('prospect') ||
        text.includes('pipeline') ||
        text.includes('qualification') ||
        text.includes('deal stage') ||
        text.includes('sales process'),

    hasContentPain:
        text.includes('content') ||
        text.includes('youtube') ||
        text.includes('podcast') ||
        text.includes('publishing') ||
        text.includes('editorial') ||
        text.includes('video') ||
        text.includes('shorts') ||
        text.includes('reels') ||
        text.includes('newsletter') ||
        text.includes('blog') ||
        text.includes('social media'),

    hasReportingPain:
        text.includes('lack of reporting') ||
        text.includes('reporting') ||
        text.includes('dashboard') ||
        text.includes('manual data') ||
        text.includes('data entry') ||
        text.includes('data cleanup') ||
        text.includes('copy and paste') ||
        text.includes('visibility') ||
        text.includes('kpi') ||
        text.includes('metrics'),

    hasManualEntry:
        text.includes('manual data entry') ||
        text.includes('manual entry') ||
        text.includes('copy and paste') ||
        text.includes('spreadsheet') ||
        text.includes('data cleanup') ||
        text.includes('re-enter') ||
        text.includes('rekey'),

    hasClientCommunication:
        text.includes('client communication') ||
        text.includes('customer communication') ||
        text.includes('follow up') ||
        text.includes('follow-up') ||
        text.includes('intake') ||
        text.includes('inquiry') ||
        text.includes('email overload') ||
        text.includes('appointment') ||
        text.includes('booking') ||
        text.includes('onboarding') ||
        text.includes('support request') ||
        text.includes('request form'),

    hasInternalOpsPain:
        text.includes('managing internal workflows') ||
        text.includes('internal workflows') ||
        text.includes('internal workflow') ||
        text.includes('team coordination') ||
        text.includes('handoff') ||
        text.includes('handoffs') ||
        text.includes('task ownership') ||
        text.includes('approval') ||
        text.includes('status changes') ||
        text.includes('project updates'),

    hasProjectManagement:
        text.includes('asana') ||
        text.includes('trello') ||
        text.includes('notion') ||
        text.includes('clickup') ||
        text.includes('monday') ||
        text.includes('jira') ||
        text.includes('project management'),

    hasSlack: text.includes('slack'),

    hasMicrosoft365:
        text.includes('microsoft 365') ||
        text.includes('office 365') ||
        text.includes('outlook') ||
        text.includes('excel') ||
        text.includes('sharepoint') ||
        text.includes('onedrive'),

    hasAccountingWorkflow:
        text.includes('quickbooks') ||
        text.includes('invoice') ||
        text.includes('invoicing') ||
        text.includes('payment') ||
        text.includes('reconciliation') ||
        text.includes('expense') ||
        text.includes('bookkeeping') ||
        text.includes('accounting'),

    hasPosWorkflow:
        text.includes('pos') ||
        text.includes('point of sale') ||
        text.includes('sales transactions') ||
        text.includes('receipt') ||
        text.includes('daily sales') ||
        text.includes('square') ||
        text.includes('toast') ||
        text.includes('clover') ||
        text.includes('lightspeed'),

    hasGoogleWorkspace:
        text.includes('google workspace') ||
        text.includes('gmail') ||
        text.includes('google sheets') ||
        text.includes('google docs') ||
        text.includes('google drive'),

    hasCRM:
        text.includes('crm') ||
        text.includes('salesforce') ||
        text.includes('hubspot') ||
        text.includes('zoho'),
    }
}