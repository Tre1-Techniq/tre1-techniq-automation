// lib/data/types.ts
export interface LeadInput {
 name: string
 company: string
 email: string
 businessType: string
 painPoint?: string
}
export interface LeadRecord extends LeadInput {
 id: string
 status: string
 createdAt: string
}
