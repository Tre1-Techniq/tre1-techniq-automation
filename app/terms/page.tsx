import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-tre1-light to-white">
      <Header />

      <main className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl space-y-8 rounded-2xl bg-white p-8 shadow-sm">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
            <p className="mt-3 text-gray-700">
              These terms explain how{' '}
              <a href="https://tre1-techniq.com" style={{ fontWeight: 'bold', color: 'black' }}>
                tre1-techniq.com
              </a>{' '}
              works, what users can expect, and the responsibilities that apply when using the platform.
            </p>
          </div>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">Acceptance of Terms</h2>
            <p className="text-gray-700 leading-7">
              By using{' '}
              <a href="https://tre1-techniq.com" style={{ fontWeight: 'bold', color: 'black' }}>
                tre1-techniq.com
              </a>
              , you agree to these terms. If you do not agree, please do not use the platform.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">Description of Service</h2>
            <p className="text-gray-700 leading-7">
              <a href="https://tre1-techniq.com" style={{ fontWeight: 'bold', color: 'black' }}>
                tre1-techniq.com
              </a>{' '}
              provides workflow audits, automation insights, and related account features designed to help users identify opportunities to improve business processes.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">Service Disclaimer</h2>
            <p className="text-gray-700 leading-7">
              <a href="https://tre1-techniq.com" style={{ fontWeight: 'bold', color: 'black' }}>
                tre1-techniq.com
              </a>{' '}
              provides automation insights and recommendations for informational purposes only. Results are not guaranteed.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">BETA Notice</h2>
            <p className="text-gray-700 leading-7">
              This service is currently in BETA. Additional features, outputs, and availability will be rolled out throughout the BETA phase. Users can opt-in to receive notification of new iterations via email and/or posts on LinkedIn.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">Payments and Refunds</h2>
            <p className="text-gray-700 leading-7">
              All payments are processed via Paddle.
            </p>
            <p className="text-gray-700 leading-7">
              Payments are final and non-refundable for any digital downloads and/or services. Subscriptions may be cancelled anytime via the User Settings page.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">User Responsibilities</h2>
            <p className="text-gray-700 leading-7">
              Users are responsible for how they review, interpret, and implement recommendations provided by the platform.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">Limitation of Liability</h2>
            <p className="text-gray-700 leading-7">
              <a href="https://tre1-techniq.com" style={{ fontWeight: 'bold', color: 'black' }}>
                tre1-techniq.com
              </a>{' '}
              is not responsible for business outcomes, implementation choices, or decisions made using information from the platform.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">Acceptable Use</h2>
            <p className="text-gray-700 leading-7">
              You agree not to misuse the service, attempt to disrupt it, or use it in a harmful way. You should not rely on the platform for critical decisions without appropriate review or professional guidance.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">Contact Information</h2>
            <p className="text-gray-700 leading-7">
              If you have questions about these terms, please contact us at{' '}
              <a href="mailto:info@tre1-techniq.com" className="text-tre1-orange hover:underline">
                info@tre1-techniq.com
              </a>.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
