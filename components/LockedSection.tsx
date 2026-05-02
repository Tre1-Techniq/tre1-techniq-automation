import Link from 'next/link'

export default function LockedSection({ title }: { title: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 text-center">
      <p className="mb-2 text-sm font-semibold text-tre1-teal">
        🔒 Unlock {title}
      </p>

      <p className="mb-4 text-sm text-gray-600">
        Continue to your report to unlock the full automation plan and actionable next steps.
      </p>

      <Link
        href="/members/reports"
        className="inline-flex items-center rounded-full bg-tre1-orange px-5 py-2 text-sm font-semibold text-white hover:bg-orange-600"
      >
        Go to Report Unlock
      </Link>
    </div>
  )
}