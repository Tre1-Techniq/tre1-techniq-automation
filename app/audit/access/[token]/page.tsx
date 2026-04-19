import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient as createServerClient } from '@/lib/server/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: {
    token: string
  }
}

export default async function AuditAccessPage({ params }: PageProps) {
  const supabase = await createServerClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect(`/login?redirectTo=/audit/access/${params.token}`)
  }

  const { data: auditRequest, error: auditError } = await supabaseAdmin
    .from('audit_requests')
    .select('*')
    .eq('report_access_token', params.token)
    .single()

  if (auditError || !auditRequest) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <ExclamationTriangleIcon className="h-14 w-14 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900">Invalid Access Link</h1>
          <p className="mt-3 text-gray-600">
            This audit access link is invalid or no longer exists.
          </p>
          <div className="mt-6">
            <Link
              href="/audit"
              className="inline-flex items-center px-6 py-3 bg-tre1-teal text-white font-semibold rounded-lg hover:bg-teal-600 transition"
            >
              Submit New Audit Request
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const expiresAt = auditRequest.report_access_token_expires_at
    ? new Date(auditRequest.report_access_token_expires_at)
    : null

  if (!expiresAt || expiresAt.getTime() < Date.now()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <ExclamationTriangleIcon className="h-14 w-14 text-amber-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900">Access Link Expired</h1>
          <p className="mt-3 text-gray-600">
            This audit access link has expired. Please request a new audit access link.
          </p>
          <div className="mt-6">
            <Link
              href="/audit"
              className="inline-flex items-center px-6 py-3 bg-tre1-teal text-white font-semibold rounded-lg hover:bg-teal-600 transition"
            >
              Start New Audit Request
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const normalizedSubmittedEmail =
    typeof auditRequest.submitted_email === 'string'
      ? auditRequest.submitted_email.trim().toLowerCase()
      : null

  const normalizedUserEmail =
    typeof user.email === 'string'
      ? user.email.trim().toLowerCase()
      : null

  const emailMatches =
    !!normalizedSubmittedEmail &&
    !!normalizedUserEmail &&
    normalizedSubmittedEmail === normalizedUserEmail

  if (!emailMatches) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center">
            <ExclamationTriangleIcon className="h-14 w-14 text-amber-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900">Email Verification Required</h1>
            <p className="mt-3 text-gray-600">
              The email used for this audit request does not match the email on your current logged-in account.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
              <p className="text-sm text-gray-500">Audit Submitted Email</p>
              <p className="mt-1 font-semibold text-gray-900">
                {auditRequest.submitted_email || 'Not available'}
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
              <p className="text-sm text-gray-500">Logged-In Account Email</p>
              <p className="mt-1 font-semibold text-gray-900">
                {user.email || 'Not available'}
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-xl bg-amber-50 border border-amber-200 p-5">
            <p className="text-sm text-amber-900">
              To protect report access and keep contact data accurate, please log in with the same email address used on the audit form, or submit a new audit request with the email tied to this account.
            </p>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-6 py-3 bg-tre1-teal text-white font-semibold rounded-lg hover:bg-teal-600 transition"
            >
              Switch Account
            </Link>
            <Link
              href="/audit"
              className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-800 font-semibold rounded-lg hover:bg-gray-50 transition"
            >
              Submit New Audit
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const now = new Date().toISOString()

  const { error: updateError } = await supabaseAdmin
    .from('audit_requests')
    .update({
      submitted_email_verified: true,
      submitted_email_verified_at: now,
      report_access_granted: true,
      submitted_by_user_id: user.id,
      email_mismatch_flag: false,
    })
    .eq('id', auditRequest.id)

  if (updateError) {
    console.error('Audit verification update error:', updateError)

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <ExclamationTriangleIcon className="h-14 w-14 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900">Verification Failed</h1>
          <p className="mt-3 text-gray-600">
            We could not finalize access to your audit request. Please try again.
          </p>
        </div>
      </div>
    )
  }

  const submittedEmail =
    typeof auditRequest.submitted_email === 'string'
      ? auditRequest.submitted_email.trim().toLowerCase()
      : null

  if (submittedEmail) {
    const { data: existingProfile, error: existingProfileError } = await supabaseAdmin
      .from('profiles')
      .select('contact_email, contact_email_verified_at')
      .eq('id', user.id)
      .single()

    if (existingProfileError) {
      console.error('Profile contact lookup error:', existingProfileError)
    } else {
      const existingContactEmail =
        typeof existingProfile?.contact_email === 'string'
          ? existingProfile.contact_email.trim().toLowerCase()
          : null

      if (!existingContactEmail) {
        const { error: profileUpdateError } = await supabaseAdmin
          .from('profiles')
          .update({
            contact_email: submittedEmail,
            contact_email_verified_at: now,
          })
          .eq('id', user.id)

        if (profileUpdateError) {
          console.error('Profile contact email update error:', profileUpdateError)
        }
      }
    }
  }

  const displayName =
    auditRequest.contact_name ||
    user.email ||
    'there'

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-green-100">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Audit Access Confirmed
              </h1>
              <p className="mt-2 text-gray-600">
                Thanks, {displayName}. Your email has been validated for this audit request, and your initial access has been granted.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-8">
          <div className="flex items-center gap-3 mb-6">
            <DocumentTextIcon className="h-7 w-7 text-tre1-teal" />
            <h2 className="text-2xl font-bold text-gray-900">Initial Audit Snapshot</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
              <p className="text-sm text-gray-500">Company</p>
              <p className="mt-1 font-semibold text-gray-900">
                {auditRequest.company_name || 'Not provided'}
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
              <p className="text-sm text-gray-500">Industry</p>
              <p className="mt-1 font-semibold text-gray-900">
                {auditRequest.industry || 'Not provided'}
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
              <p className="text-sm text-gray-500">Primary Pain Point</p>
              <p className="mt-1 font-semibold text-gray-900">
                {auditRequest.primary_pain || 'Not provided'}
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
              <p className="text-sm text-gray-500">Current Tools</p>
              <p className="mt-1 font-semibold text-gray-900">
                {Array.isArray(auditRequest.current_tools) && auditRequest.current_tools.length > 0
                  ? auditRequest.current_tools.join(', ')
                  : 'Not provided'}
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-xl bg-tre1-teal/5 border border-tre1-teal/20 p-6">
            <h3 className="text-lg font-bold text-gray-900">Initial Analysis</h3>
            <p className="mt-3 text-gray-700 leading-7">
              Based on your submission, your workflow likely has at least one strong automation opportunity related to
              lead handling, follow-up consistency, or repetitive operational steps. The next phase is to refine the
              exact bottlenecks, quantify the time drain, and identify the highest-value automation sequence.
            </p>
            <p className="mt-3 text-gray-700 leading-7">
              This initial report access confirms your submission and unlocks the next step in the audit journey. From
              here, your full analysis can be expanded into a more specific roadmap tied to your tools, business model,
              and implementation priorities.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-8">
          <h3 className="text-xl font-bold text-gray-900">Next Steps</h3>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-gray-200 p-5">
              <p className="font-semibold text-gray-900">1. Review your submission</p>
              <p className="mt-2 text-sm text-gray-600">
                Confirm the pain points and workflow details you submitted are accurate.
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 p-5">
              <p className="font-semibold text-gray-900">2. Prepare for recommendations</p>
              <p className="mt-2 text-sm text-gray-600">
                Be ready to identify the one process you most want to improve first.
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 p-5">
              <p className="font-semibold text-gray-900">3. Continue into the member system</p>
              <p className="mt-2 text-sm text-gray-600">
                Use the member portal to access gated resources and future audit-related updates.
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Link
              href="/members"
              className="inline-flex items-center justify-center px-6 py-3 bg-tre1-teal text-white font-semibold rounded-lg hover:bg-teal-600 transition"
            >
              Go to Member Portal
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Link>

            <Link
              href="/members/library"
              className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-800 font-semibold rounded-lg hover:bg-gray-50 transition"
            >
              Browse Resource Library
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}