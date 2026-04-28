import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient as createServerSupabaseClient } from '@/lib/server/supabase'

export const dynamic = 'force-dynamic'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

type AuditData = {
  id: string
  company_name: string | null
  industry: string | null
  company_size: string | null
  primary_pain: string | null
  time_wasters: string[] | null
  current_tools: string[] | null
  automation_goals: string | null
  integration_needs: string | null
  budget: string | null
}

function fallbackSummary(audit: AuditData) {
  return {
    executive_summary:
      `Based on your Initial Audit, your strongest automation opportunity appears to center on ${audit.primary_pain || 'your highest-friction workflow'}. The report highlights workflow friction, current tools, and practical next steps without overstating outcomes.`,
    recommendations: [
      audit.primary_pain
        ? `Clarify the workflow connected to "${audit.primary_pain}" and identify the first repeatable step.`
        : 'Identify the highest-friction workflow in your business.',
      audit.time_wasters?.[0]
        ? `Prioritize automation around "${audit.time_wasters[0]}" because it appears to be a recurring operational drag.`
        : 'Prioritize one repetitive task that happens every week.',
      audit.current_tools?.[0]
        ? `Review how ${audit.current_tools[0]} fits into the workflow and whether it should trigger or receive automation updates.`
        : 'Document the tools involved in intake, follow-up, or reporting.',
    ],
  }
}

export async function GET() {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const auditSelect =
    'id, company_name, industry, company_size, primary_pain, time_wasters, current_tools, automation_goals, integration_needs, budget'

  const { data: audit, error: auditError } = await supabase
    .from('audit_requests')
    .select(auditSelect)
    .eq('submitted_by_user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (auditError) {
    return NextResponse.json({ error: 'Audit lookup failed' }, { status: 500 })
  }

  if (!audit) {
    return NextResponse.json({ error: 'Audit not found' }, { status: 404 })
  }

  const typedAudit = audit as AuditData

  const { data: existingReport, error: existingReportError } = await supabase
    .from('audit_reports')
    .select('executive_summary, recommendations')
    .eq('audit_request_id', typedAudit.id)
    .maybeSingle()

  if (existingReportError) {
    console.warn('Existing audit report lookup failed:', existingReportError)
  }

  if (existingReport?.executive_summary && existingReport?.recommendations) {
    return NextResponse.json({
      executive_summary: existingReport.executive_summary,
      recommendations: existingReport.recommendations,
    })
  }

  try {
    const response = await openai.responses.create({
      model: 'gpt-4o-mini',
      input: [
        {
          role: 'system',
          content:
            'You generate concise, practical Initial Audit report content for a business automation platform. Do not exaggerate outcomes. Do not promise ROI. Keep the tone professional, clear, and implementation-oriented.',
        },
        {
          role: 'user',
          content: JSON.stringify({
            task: 'Generate an executive summary and three recommendations from this Initial Audit data.',
            audit: typedAudit,
          }),
        },
      ],
      text: {
        format: {
          type: 'json_schema',
          name: 'audit_ai_summary',
          strict: true,
          schema: {
            type: 'object',
            additionalProperties: false,
            properties: {
              executive_summary: {
                type: 'string',
              },
              recommendations: {
                type: 'array',
                minItems: 3,
                maxItems: 3,
                items: {
                  type: 'string',
                },
              },
            },
            required: ['executive_summary', 'recommendations'],
          },
        },
      },
    })

    const parsed = JSON.parse(response.output_text)

    const reportPayload = {
      audit_request_id: typedAudit.id,
      user_id: user.id,
      executive_summary: parsed.executive_summary,
      recommendations: parsed.recommendations,
      generated_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      version: 1,
    }

    const { error: insertError } = await supabase
      .from('audit_reports')
      .insert(reportPayload)

    if (insertError) {
      console.warn('Audit report insert failed:', insertError)
    }

    return NextResponse.json(parsed)
  } catch (error) {
    console.warn('AI summary generation failed, using fallback:', error)

    const fallback = fallbackSummary(typedAudit)

    await supabase.from('audit_reports').insert({
      audit_request_id: typedAudit.id,
      user_id: user.id,
      executive_summary: fallback.executive_summary,
      recommendations: fallback.recommendations,
      generated_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      version: 1,
    })

    return NextResponse.json(fallback)
  }
}