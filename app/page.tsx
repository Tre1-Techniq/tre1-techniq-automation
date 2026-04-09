import Header from '../components/Header'
import Footer from '../components/Footer'
import LeadForm from '../components/LeadForm'
import { ArrowRightIcon, ClockIcon, ChartBarIcon, UserGroupIcon } from '@heroicons/react/24/outline'

export default function Home() {
  const industries = [
    { name: 'Real Estate Teams', description: 'Lead qualification, scheduling, follow-up automation' },
    { name: 'Local Service Businesses', description: 'Appointment booking, customer communication' },
    { name: 'Clinics & Med Spas', description: 'Patient intake, scheduling, follow-up care' },
    { name: 'Law Firms', description: 'Client intake, document management, billing' },
  ]

  const automations = [
    { name: 'Lead Follow-Up', description: 'Instant response to new inquiries', hours: 5 },
    { name: 'Scheduling', description: 'Automated calendar booking', hours: 3 },
    { name: 'Reporting', description: 'Weekly performance dashboards', hours: 2 },
    { name: 'Client Intake', description: 'Streamlined onboarding forms', hours: 4 },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-tre1-light to-white">
      <Header />
      
      {/* Hero Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center">
          <h1 className="text-4xl font-display font-bold tracking-tight text-tre1-dark sm:text-5xl md:text-6xl">
            Automate Your Workflows.
            <span className="block text-tre1-teal">Reclaim Focus.</span>
          </h1>
          <p className="mt-6 text-xl text-tre1-gray max-w-3xl mx-auto">
            AI-driven systems that reduce admin time and accelerate response for growing businesses.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/audit"
              className="inline-flex items-center justify-center rounded-lg bg-tre1-orange px-8 py-3 text-base font-semibold text-white hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
            >
              Book a Workflow Audit
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </a>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center rounded-lg border border-tre1-teal px-8 py-3 text-base font-semibold text-tre1-teal hover:bg-tre1-teal hover:text-white focus:outline-none focus:ring-2 focus:ring-tre1-teal focus:ring-offset-2"
            >
              How It Works
            </a>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6 rounded-xl bg-white shadow-sm">
            <ClockIcon className="h-12 w-12 text-tre1-teal mx-auto" />
            <h3 className="mt-4 text-xl font-semibold text-tre1-dark">Save Time</h3>
            <p className="mt-2 text-tre1-gray">Recover 10+ hours per week with intelligent automation</p>
          </div>
          <div className="text-center p-6 rounded-xl bg-white shadow-sm">
            <ChartBarIcon className="h-12 w-12 text-tre1-teal mx-auto" />
            <h3 className="mt-4 text-xl font-semibold text-tre1-dark">Ensure Consistency</h3>
            <p className="mt-2 text-tre1-gray">Never miss a lead or task hand-off with automated workflows</p>
          </div>
          <div className="text-center p-6 rounded-xl bg-white shadow-sm">
            <UserGroupIcon className="h-12 w-12 text-tre1-teal mx-auto" />
            <h3 className="mt-4 text-xl font-semibold text-tre1-dark">Scale Smarter</h3>
            <p className="mt-2 text-tre1-gray">Grow operations without increasing overhead or headcount</p>
          </div>
        </div>
      </section>

      {/* Who We Help */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-tre1-dark mb-12">Practical Automations Built For:</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {industries.map((industry) => (
            <div key={industry.name} className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold text-tre1-dark">{industry.name}</h3>
              <p className="mt-2 text-sm text-tre1-gray">{industry.description}</p>
              <a href="/audit" className="mt-4 inline-block text-sm font-medium text-tre1-teal hover:text-teal-700">
                Get audit →
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* What We Automate */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 max-w-7xl mx-auto" id="how-it-works">
        <h2 className="text-3xl font-bold text-center text-tre1-dark mb-12">Simplify Your Most Repetitive Workflows</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {automations.map((auto) => (
            <div key={auto.name} className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-tre1-dark">{auto.name}</h3>
                  <p className="mt-2 text-sm text-tre1-gray">{auto.description}</p>
                </div>
                <span className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                  {auto.hours}h/week saved
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section with Lead Form */}
      <section className="px-4 py-20 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-tre1-teal to-teal-600 rounded-2xl p-8 md:p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Identify Your Top 3 Automation Opportunities</h2>
          <p className="text-teal-100 mb-8">
            Get a free 15-minute workflow audit to discover where automation can save you the most time.
          </p>
          <div className="max-w-md mx-auto">
            <LeadForm />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}