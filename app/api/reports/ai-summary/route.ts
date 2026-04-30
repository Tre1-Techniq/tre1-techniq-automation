import { NextResponse } from 'next/server'
import { createClient as createServerSupabaseClient } from '@/lib/server/supabase'

import {
  calculateAutomationReadiness,
  getScoreAwareRecommendations,
  addToolContextToRecommendations,
} from '@/lib/reports/automationReadiness'

import { calculateTimeSavings } from '@/lib/reports/timeSavings'
import OpenAI from 'openai'

type AuditData = {
  id: string
  company_name?: string | null
  industry?: string | null
  company_size?: string | null
  primary_pain?: string | null
  time_wasters?: string[] | null
  current_tools?: string[] | null
  automation_goals?: string | null
  integration_needs?: string | null
  budget?: string | null
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

function buildExecutiveSummaryText(summary: any) {
  return [
    summary.headline,
    summary.readinessSummary,
    summary.timeSavingsSummary,
    summary.painPointSummary,
    summary.toolContextSummary,
    summary.recommendationDirection,
    summary.nextStepSummary,
  ].join('')
}

function buildDeterministicExecutiveSummary({
  readiness,
  timeSavings,
  recommendations,
  audit,
}: any) {
  const weakestFactor =
    readiness.weakestFactors?.[0] || 'process standardization'

  const topRecommendation = recommendations.structuredRecommendations?.[0]
  const rec = topRecommendation?.title || ''

  const recommendationDirection = rec
    ? `The strongest immediate opportunity is to ${rec.toLowerCase()}, which directly addresses your highest-friction workflow.`
    : `The strongest immediate opportunity is to standardize and automate your most repetitive workflow.`

  const band = readiness.band
  const score = readiness.score
  const hours = timeSavings.hoursPerWeek || 0

  let timeSavingsSummary = ''

  if (hours < 5) {
    timeSavingsSummary = `Even modest automation improvements could recover approximately <strong>${hours}</strong> hours per week.`
  } else if (hours < 15) {
    timeSavingsSummary = `The system estimates that targeted automation could recover approximately <strong>${hours}</strong> hours per week.`
  } else {
    timeSavingsSummary = `Significant efficiency gains are available, with up to <strong>${hours}</strong> hours per week recoverable through automation.`
  }

  const tools =
    audit.current_tools?.filter((tool: string) => {
      const normalized = tool.trim().toLowerCase()

      return (
        normalized &&
        normalized !== 'none' &&
        normalized !== 'no tools' &&
        normalized !== 'n/a' &&
        normalized !== 'na'
      )
    }) || []

  const hasTools = tools.length > 0
  const pain = audit.primary_pain || 'manual operational inefficiencies'

  let headline = ''

  if (band === 'Early Stage') {
    headline =
      'Your business has clear automation potential, but process clarity should come first.'
  } else if (band === 'Developing') {
    headline =
      'Your business is ready for targeted automation improvements.'
  } else if (band === 'Ready' && score >= 85) {
    headline =
      'Your business is well-positioned to leverage automation immediately.'
  } else if (band === 'Ready') {
    headline =
      'Your business is positioned for focused automation implementation.'
  } else {
    headline =
      'Your business has automation opportunities worth prioritizing.'
  }

  return {
    headline,
    readinessSummary: `Your Automation Readiness Score is <strong>${score}</strong>, placing you in the <strong>${band}</strong> phase. The primary constraint right now is ${weakestFactor}.`,
    timeSavingsSummary,
    painPointSummary: `Your primary bottleneck appears to be ${pain}, which is creating recurring inefficiencies.`,
    toolContextSummary: hasTools
      ? `Your existing tools (${tools.join(', ')}) can be leveraged to implement automation without requiring a full system replacement.`
      : `No core tools were identified, which suggests your first step should be defining where key processes and data currently live before layering automation.`,
    recommendationDirection,
    nextStepSummary:
      'Your next step is to move from diagnosis into implementation by defining triggers, workflows, and automation handoffs.',
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

  const { data: audit, error: auditError } = await supabase
    .from('audit_requests')
    .select(`
      id,
      company_name,
      industry,
      company_size,
      primary_pain,
      time_wasters,
      current_tools,
      automation_goals,
      integration_needs,
      budget
    `)
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

  const { data: existingReport, error: reportError } = await supabase
    .from('audit_reports')
    .select(`
      executive_summary,
      executive_summary_json,
      summary_source,
      recommendations,
      readiness_score,
      readiness_band,
      readiness_summary,
      readiness_factors
    `)
    .eq('audit_request_id', typedAudit.id)
    .maybeSingle()

  if (reportError) {
    return NextResponse.json(
      { error: 'Saved report lookup failed' },
      { status: 500 }
    )
  }

  // CRITICAL: cache check happens BEFORE OpenAI
  if (existingReport?.executive_summary_json || existingReport?.executive_summary) {
    console.log('[AI SUMMARY] Returning cached summary', {
      auditId: typedAudit.id,
      source: existingReport.summary_source,
    })

    return NextResponse.json({
      executive_summary: existingReport.executive_summary,
      executive_summary_json: existingReport.executive_summary_json,
      recommendations: existingReport.recommendations || [],
      readiness_score: existingReport.readiness_score,
      readiness_band: existingReport.readiness_band,
      readiness_summary: existingReport.readiness_summary,
      readiness_factors: existingReport.readiness_factors || [],
      summary_source: existingReport.summary_source,
    })
  }

  // Only reaches here if no cached summary exists
  const readiness = calculateAutomationReadiness(typedAudit)
  const baseRecommendations = getScoreAwareRecommendations(readiness)

  const structuredRecommendations = addToolContextToRecommendations({
    recommendations: baseRecommendations,
    currentTools: typedAudit.current_tools,
  })

  const timeSavings = calculateTimeSavings(typedAudit)

  const summary = buildDeterministicExecutiveSummary({
    readiness,
    timeSavings,
    recommendations: {
      structuredRecommendations,
    },
    audit: typedAudit,
  })

  let finalSummary = summary
  let summarySource = 'deterministic'

  try {
    console.log('[AI SUMMARY] Starting OpenAI polish call', {
      auditId: typedAudit.id,
      sourceBefore: summarySource,
    })

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.3,
      messages: [
        {
          role: 'system',
          content:
            'You rewrite executive summaries for clarity and professional tone. You must preserve all facts, numbers, sections, and meaning. Return only valid JSON.',
        },
        {
          role: 'user',
          content: `
Rewrite the following executive summary for clarity, flow, and professional tone.

DO NOT:
- change numerical values
- change readiness score or band
- change time savings estimate
- change pain point
- change tools
- change recommendation direction
- add new insights
- remove sections

Return the exact same JSON shape:
{
  "headline": "...",
  "readinessSummary": "...",
  "timeSavingsSummary": "...",
  "painPointSummary": "...",
  "toolContextSummary": "...",
  "recommendationDirection": "...",
  "nextStepSummary": "..."
}

Summary:
${JSON.stringify(summary)}
          `.trim(),
        },
      ],
    })

    const content = completion.choices[0]?.message?.content

    if (content) {
      finalSummary = JSON.parse(content)
      summarySource = 'ai_enhanced'

      console.log('[AI SUMMARY] OpenAI polish succeeded', {
        auditId: typedAudit.id,
        model: 'gpt-4o-mini',
        summarySource,
      })
    }
  } catch (error) {
    console.error('[AI SUMMARY] OpenAI polish failed', {
      auditId: typedAudit.id,
      error,
    })

    finalSummary = summary
    summarySource = 'deterministic'
  }

  const executiveSummaryText = buildExecutiveSummaryText(finalSummary)

  await supabase
  .from('audit_reports')
  .upsert({
    audit_request_id: typedAudit.id,
    executive_summary: executiveSummaryText,
    executive_summary_json: finalSummary,
    summary_source: summarySource,
    readiness_score: readiness.score,
    readiness_band: readiness.band,
    recommendations: structuredRecommendations,
  }, {
    onConflict: 'audit_request_id',
  })

  return NextResponse.json({
    executive_summary: executiveSummaryText,
    executive_summary_json: finalSummary,
    recommendations: structuredRecommendations,
    readiness_score: readiness.score,
    readiness_band: readiness.band,
    readiness_summary: existingReport?.readiness_summary,
    readiness_factors: readiness.factors || [],
    summary_source: summarySource,
  })
}