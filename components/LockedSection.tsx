export default function LockedSection({ title }: { title: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 text-center">
      <p className="text-sm font-semibold text-tre1-teal mb-2">
        🔒 Unlock {title}
      </p>

      <p className="text-sm text-gray-600 mb-4">
        Upgrade to access your full automation plan and actionable next steps.
      </p>

      <a
        href="/members/billing"
        className="inline-flex items-center rounded-full bg-tre1-orange px-5 py-2 text-sm font-semibold text-white hover:bg-orange-600"
      >
        Unlock Full Report
      </a>
    </div>
  )
}