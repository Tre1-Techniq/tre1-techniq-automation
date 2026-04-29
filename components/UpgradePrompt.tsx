import Link from 'next/link'
import { ArrowRightIcon } from '@heroicons/react/24/outline'

export default function UpgradePrompt({
  title,
  body,
  cta = 'Unlock Full Report',
}: {
  title: string
  body: string
  cta?: string
}) {
  return (
    <section className="rounded-xl border border-gray-200 bg-gray-50 p-6 text-center">
      <p className="text-sm font-semibold text-tre1-teal">
        🔒 {title}
      </p>

      <p className="mx-auto mt-2 max-w-xl text-sm text-gray-600">
        {body}
      </p>

      <Link
        href="/members/billing"
        className="mt-5 inline-flex items-center rounded-full bg-orange-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
      >
        {cta}
        <ArrowRightIcon className="ml-2 h-4 w-4" />
      </Link>
    </section>
  )
}