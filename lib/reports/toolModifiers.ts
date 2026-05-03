export type ToolModifier = {
  key: string
  label: string
  role: string
  suggestedUses: string[]
}

export const toolModifiers: Record<string, ToolModifier> = {
  shopify: {
    key: 'shopify',
    label: 'Shopify',
    role: 'system of record for products, inventory, orders, checkout, customer activity, and fulfillment signals',
    suggestedUses: [
      'order tracking',
      'inventory sync',
      'customer records',
      'checkout workflows',
      'sales reporting',
      'social-commerce handoffs',
    ],
  },

  slack: {
    key: 'slack',
    label: 'Slack',
    role: 'notification and handoff layer for internal workflow alerts, approvals, and exceptions',
    suggestedUses: [
      'team alerts',
      'handoff notifications',
      'exception routing',
      'approval reminders',
      'workflow triage',
    ],
  },

  microsoft365: {
    key: 'microsoft365',
    label: 'Microsoft 365',
    role: 'documentation, email, spreadsheet, and reporting layer for operational workflows',
    suggestedUses: [
      'Outlook follow-up',
      'Excel reporting',
      'SharePoint or OneDrive documentation',
      'internal tracking',
      'workflow summaries',
    ],
  },

  googleWorkspace: {
    key: 'googleWorkspace',
    label: 'Google Workspace',
    role: 'lightweight workflow documentation, forms, spreadsheets, email, and shared file organization layer',
    suggestedUses: [
      'Google Forms intake',
      'Google Sheets tracking',
      'Gmail follow-up',
      'Google Docs SOPs',
      'Drive-based asset organization',
    ],
  },

  crm: {
    key: 'crm',
    label: 'CRM',
    role: 'system of record for leads, qualification stages, sales follow-up, customer notes, and pipeline visibility',
    suggestedUses: [
      'lead qualification',
      'follow-up triggers',
      'pipeline stages',
      'sales activity tracking',
      'customer lifecycle visibility',
    ],
  },

  projectManagement: {
    key: 'projectManagement',
    label: 'Project management tools',
    role: 'task ownership and workflow visibility layer for internal execution',
    suggestedUses: [
      'task routing',
      'workflow ownership',
      'project visibility',
      'status updates',
      'handoff tracking',
    ],
  },
}

function normalizeTools(currentTools?: string[] | null) {
  return (currentTools || []).join(' ').toLowerCase()
}

export function getActiveToolModifiers(currentTools?: string[] | null) {
  const text = normalizeTools(currentTools)
  const active: ToolModifier[] = []

  if (text.includes('shopify')) active.push(toolModifiers.shopify)

  if (text.includes('slack')) active.push(toolModifiers.slack)

  if (
    text.includes('microsoft 365') ||
    text.includes('office 365') ||
    text.includes('outlook') ||
    text.includes('excel') ||
    text.includes('sharepoint') ||
    text.includes('onedrive')
  ) {
    active.push(toolModifiers.microsoft365)
  }

  if (
    text.includes('google workspace') ||
    text.includes('gmail') ||
    text.includes('google sheets') ||
    text.includes('google docs') ||
    text.includes('google drive')
  ) {
    active.push(toolModifiers.googleWorkspace)
  }

  if (
    text.includes('crm') ||
    text.includes('salesforce') ||
    text.includes('hubspot') ||
    text.includes('zoho')
  ) {
    active.push(toolModifiers.crm)
  }

  if (
    text.includes('asana') ||
    text.includes('trello') ||
    text.includes('notion') ||
    text.includes('clickup') ||
    text.includes('monday') ||
    text.includes('jira')
  ) {
    active.push(toolModifiers.projectManagement)
  }

  return active
}

export function buildGeneralToolContext(currentTools?: string[] | null) {
  const active = getActiveToolModifiers(currentTools)

  if (active.length === 0) {
    return 'Your current tool stack needs to be clarified before automation recommendations can be tied to specific systems.'
  }

  if (active.length === 1) {
    return `${active[0].label} can support automation by serving as the ${active[0].role}.`
  }

  const labels = active.map((tool) => tool.label).join(', ')

  return `${labels} can support automation when each tool has a clearly defined role in the workflow.`
}

export function buildGeneralSuggestedPath(currentTools?: string[] | null) {
  const active = getActiveToolModifiers(currentTools)

  if (active.length === 0) {
    return 'Start by listing where key information currently lives, who updates it, and what system should own the final record.'
  }

  const suggestedUses = active
    .flatMap((tool) => tool.suggestedUses.slice(0, 2))
    .slice(0, 4)

  return `Start by mapping where ${suggestedUses.join(', ')} currently happen, then decide which steps should be automated first.`
}