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
      text.includes('sales') ||
      text.includes('prospect') ||
      text.includes('pipeline') ||
      text.includes('qualification') ||
      text.includes('crm'),

    hasContentPain:
      text.includes('content') ||
      text.includes('youtube') ||
      text.includes('podcast') ||
      text.includes('publishing') ||
      text.includes('editorial') ||
      text.includes('social media'),

    hasReportingPain:
      text.includes('reporting') ||
      text.includes('report') ||
      text.includes('dashboard') ||
      text.includes('spreadsheet') ||
      text.includes('manual data') ||
      text.includes('data entry'),

    hasManualEntry:
      text.includes('manual data entry') ||
      text.includes('manual entry') ||
      text.includes('copy and paste') ||
      text.includes('spreadsheet'),

    hasClientCommunication:
      text.includes('client communication') ||
      text.includes('customer communication') ||
      text.includes('follow up') ||
      text.includes('follow-up') ||
      text.includes('intake') ||
      text.includes('inquiry') ||
      text.includes('email overload'),

    hasInternalOpsPain:
      text.includes('handoff') ||
      text.includes('task') ||
      text.includes('project management') ||
      text.includes('approval') ||
      text.includes('status update') ||
      text.includes('team') ||
      text.includes('operations'),

    hasSlack: text.includes('slack'),

    hasMicrosoft365:
      text.includes('microsoft 365') ||
      text.includes('office 365') ||
      text.includes('outlook') ||
      text.includes('excel') ||
      text.includes('sharepoint') ||
      text.includes('onedrive'),

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

    hasProjectManagement:
      text.includes('asana') ||
      text.includes('trello') ||
      text.includes('notion') ||
      text.includes('clickup') ||
      text.includes('monday') ||
      text.includes('jira'),
  }
}