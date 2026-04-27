import { NextResponse } from 'next/server'
import { jsPDF } from 'jspdf'
import { createClient as createServerSupabaseClient } from '@/lib/server/supabase'

export const dynamic = 'force-dynamic'

type AuditData = {
  company_name: string | null
  industry: string | null
  company_size: string | null
  primary_pain: string | null
  time_wasters: string[] | null
  current_tools: string[] | null
  automation_goals: string | null
  integration_needs: string | null
  budget: string | null
  submitted_at: string | null
  created_at: string | null
}

function formatDate(value: string | null) {
  if (!value) return 'Pending'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Pending' : date.toLocaleDateString()
}

function text(value: string | null | undefined) {
  return value?.trim() || '—'
}

function addWrappedText(
  doc: jsPDF,
  content: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight = 6
) {
  const lines = doc.splitTextToSize(content, maxWidth)
  doc.text(lines, x, y)
  return y + lines.length * lineHeight
}

function addSectionTitle(doc: jsPDF, title: string, y: number) {
  if (y > 260) {
    doc.addPage()
    y = 20
  }

  doc.setTextColor(0, 181, 165)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.text(title, 20, y)

  y += 4
  doc.setDrawColor(229, 231, 235)
  doc.line(20, y, 190, y)

  return y + 8
}

function addLabelValue(
  doc: jsPDF,
  label: string,
  value: string | null | undefined,
  y: number
) {
  if (y > 265) {
    doc.addPage()
    y = 20
  }

  doc.setTextColor(64, 72, 85)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text(label.toUpperCase(), 20, y)

  y += 5

  doc.setTextColor(30, 32, 34)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  y = addWrappedText(doc, text(value), 20, y, 170)

  return y + 5
}

function addList(doc: jsPDF, items: string[], y: number) {
  if (!items.length) {
    doc.setTextColor(30, 32, 34)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    doc.text('—', 20, y)
    return y + 8
  }

  for (const [index, item] of items.entries()) {
    if (y > 265) {
      doc.addPage()
      y = 20
    }

    doc.setTextColor(0, 181, 165)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.text(`${index + 1}.`, 20, y)

    doc.setTextColor(30, 32, 34)
    doc.setFont('helvetica', 'normal')
    y = addWrappedText(doc, item, 28, y, 160)

    y += 4
  }

  return y + 2
}

function buildPdf(audit: AuditData) {
  const doc = new jsPDF({
    unit: 'mm',
    format: 'letter',
  })

  let y = 22
  const submittedDate = formatDate(audit.submitted_at || audit.created_at)

  doc.setTextColor(30, 32, 34)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.text('Initial Audit Report', 20, y)

  y += 8

  doc.setTextColor(64, 72, 85)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.text(`Prepared for ${text(audit.company_name)} · Submitted ${submittedDate}`, 20, y)

  y += 14

  y = addSectionTitle(doc, 'Executive Summary', y)
  doc.setTextColor(30, 32, 34)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  y = addWrappedText(
    doc,
    `This Initial Audit identifies the primary workflow constraints, tool stack signals, and repetitive tasks submitted by ${text(audit.company_name)}. The goal is to turn those inputs into a clear automation roadmap without overstating outcomes.`,
    20,
    y,
    170
  )

  y += 8

  y = addSectionTitle(doc, 'Company Context', y)
  y = addLabelValue(doc, 'Company', audit.company_name, y)
  y = addLabelValue(doc, 'Industry', audit.industry, y)
  y = addLabelValue(doc, 'Company Size', audit.company_size, y)
  y = addLabelValue(doc, 'Budget', audit.budget, y)

  y = addSectionTitle(doc, 'Workflow Friction', y)
  y = addLabelValue(doc, 'Major Pain Point', audit.primary_pain, y)

  doc.setTextColor(64, 72, 85)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text('TIME WASTERS', 20, y)
  y += 6
  y = addList(doc, audit.time_wasters || [], y)

  y = addSectionTitle(doc, 'Current Stack & Goals', y)

  doc.setTextColor(64, 72, 85)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text('CURRENT TOOLS', 20, y)
  y += 6
  y = addList(doc, audit.current_tools || [], y)

  y = addLabelValue(doc, 'Automation Goals', audit.automation_goals, y)
  y = addLabelValue(doc, 'Integration Needs', audit.integration_needs, y)

  const findings = [
    audit.primary_pain ? `Primary constraint identified: ${audit.primary_pain}` : null,
    audit.time_wasters?.length
      ? `${audit.time_wasters.length} repetitive task signal${audit.time_wasters.length === 1 ? '' : 's'} identified.`
      : null,
    audit.current_tools?.length
      ? `Current stack includes ${audit.current_tools.slice(0, 3).join(', ')}${audit.current_tools.length > 3 ? ', and more' : ''}.`
      : null,
    audit.integration_needs
      ? 'Integration opportunity identified based on submitted workflow requirements.'
      : null,
  ].filter(Boolean) as string[]

  y = addSectionTitle(doc, 'Key Findings', y)
  y = addList(doc, findings, y)

  const recommendations = [
    audit.primary_pain
      ? `Clarify the workflow connected to "${audit.primary_pain}" and identify the first repeatable step.`
      : 'Identify the highest-friction workflow in the business.',
    audit.time_wasters?.[0]
      ? `Prioritize automation around "${audit.time_wasters[0]}" because it appears to be a recurring operational drag.`
      : 'Prioritize one repetitive task that happens every week.',
    audit.current_tools?.[0]
      ? `Review how ${audit.current_tools[0]} fits into the workflow and whether it should trigger or receive automation updates.`
      : 'Document the tools involved in intake, follow-up, or reporting.',
  ]

  y = addSectionTitle(doc, 'Recommendations', y)
  y = addList(doc, recommendations, y)

  y = addSectionTitle(doc, 'Next Step', y)
  doc.setTextColor(30, 32, 34)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  y = addWrappedText(
    doc,
    'Schedule a focused recap session to review this audit, identify the highest-leverage automation opportunity, and map the next implementation step.',
    20,
    y,
    170
  )

  doc.setFontSize(9)
  doc.setTextColor(102, 102, 102)
  doc.text('© 2024 Tre1 TechnIQ Automation – All rights reserved', 20, 270)

  return Buffer.from(doc.output('arraybuffer'))
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
    'company_name, industry, company_size, primary_pain, time_wasters, current_tools, automation_goals, integration_needs, budget, submitted_at, created_at'

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

  const buffer = buildPdf(audit as AuditData)

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="Tre1TechnIQ-Initial-Audit-Report.pdf"',
    },
  })
}