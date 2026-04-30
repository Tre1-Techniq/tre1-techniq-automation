import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-tre1-light to-white">
      <Header />

      <main className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl space-y-8 rounded-2xl bg-white p-8 shadow-sm">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
            <p className="mt-3 text-gray-700">
              This policy explains what information{' '}
              <a href="https://tre1-techniq.com" style={{ fontWeight: 'bold', color: 'black' }}>
                tre1-techniq.com
              </a>{' '}
              collects, how we use it, and how we keep it protected.
            </p>
          </div>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">Overview</h2>
            <p className="text-gray-700 leading-7">
              <a href="https://tre1-techniq.com" style={{ fontWeight: 'bold', color: 'black' }}>
                tre1-techniq.com
              </a>{' '}
              helps users review workflow problems, understand automation opportunities, and manage their account access. This policy describes how we handle information when you use the site, submit an audit, or interact with our services.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">Information We Collect</h2>
            <p className="text-gray-700 leading-7">
              We collect your email address for authentication and account communication. We also collect audit inputs that you choose to submit, such as business workflow details, tools, pain points, and related context. In addition, we may collect usage data about how you interact with the site so we can keep the service working well and improve it over time.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">How We Use Information</h2>
            <p className="text-gray-700 leading-7">
              We use the information you provide to generate reports, improve the system, and communicate with you about your audit, your account, and related updates. We may also use aggregated usage data to understand what is working and where the experience can be improved.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">Third-Party Services</h2>
            <p className="text-gray-700 leading-7">
              We use Supabase for authentication and database services. We also use Stripe for payments.
            </p>
            <p className="text-gray-700 leading-7">
              Payments are processed securely via Stripe. We do not store or have access to your full payment details.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">Data Sharing</h2>
            <p className="text-gray-700 leading-7">
              We do not sell user data. We may share limited information with trusted service providers, such as Stripe and Supabase, only as needed to run the service, process payments, or support authentication and storage.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">Data Retention</h2>
            <p className="text-gray-700 leading-7">
              We keep personal information and audit data only as long as needed to provide the service, support your account, meet business needs, and comply with legal or operational requirements.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">Data Security</h2>
            <p className="text-gray-700 leading-7">
              We use reasonable safeguards designed to protect your information. No online system is completely secure, but we work to protect data with appropriate technical and operational measures.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">Contact Information</h2>
            <p className="text-gray-700 leading-7">
              If you have questions about this policy or how your data is handled, please contact us at{' '}
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
