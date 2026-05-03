export type IndustryModifier = {
  key: string
  label: string
  languageHints: string[]
  exampleWorkflows: string[]
}

export const industryModifiers: Record<string, IndustryModifier> = {
  ecommerce: {
    key: 'ecommerce',
    label: 'E-commerce',
    languageHints: [
      'orders',
      'inventory',
      'checkout',
      'customer activity',
      'fulfillment',
      'sales channels',
    ],
    exampleWorkflows: [
      'social channel to Shopify checkout',
      'order tracking',
      'inventory updates',
      'customer follow-up',
    ],
  },
}

// Not used in BETA1 yet.
// Future use:
// audit industry → industry modifier → adjust wording/examples in recommendation templates.
export function getIndustryModifier(industry?: string | null) {
  if (!industry) return null

  const value = industry.toLowerCase()

  if (
    value.includes('e-commerce') ||
    value.includes('ecommerce') ||
    value.includes('retail') ||
    value.includes('commerce')
  ) {
    return industryModifiers.ecommerce
  }

  return null
}