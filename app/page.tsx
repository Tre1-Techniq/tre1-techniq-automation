// app/page.tsx - COMPLETE WITH HEADER & FOOTER
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { 
  ArrowRightIcon,
  ChartBarIcon,
  ClockIcon,
  CogIcon,
  UserGroupIcon,
  LightBulbIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {/* Hero */}
        <div className="bg-gradient-to-r from-tre1-teal to-teal-600 text-white">
          <div className="max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Work Smarter, Not Harder
              </h1>
              <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto mb-10">
                Tre1 TechnIQ automates repetitive tasks so you can focus on growing your business.
              </p>
              <Link
                href="/audit"
                className="inline-flex items-center bg-white text-tre1-teal font-bold text-lg px-8 py-4 rounded-lg hover:bg-gray-50 transition shadow-lg"
              >
                Get Free Automation Audit
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-gray-50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-tre1-teal mb-2">48h</div>
                <div className="text-gray-600">Audit Turnaround</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-tre1-orange mb-2">40%</div>
                <div className="text-gray-600">Average Time Saved</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-tre1-dark mb-2">100+</div>
                <div className="text-gray-600">Businesses Automated</div>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How We Help Your Business
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              From lead capture to client onboarding, we automate the tedious so you can focus on the strategic.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-tre1-teal/10 rounded-full mb-6">
                <ChartBarIcon className="h-7 w-7 text-tre1-teal" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Workflow Analysis</h3>
              <p className="text-gray-600">
                We identify bottlenecks and automation opportunities in your current processes.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-tre1-orange/10 rounded-full mb-6">
                <CogIcon className="h-7 w-7 text-tre1-orange" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Custom Automation</h3>
              <p className="text-gray-600">
                Build tailored automations that integrate with your existing tools and workflows.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-tre1-dark/10 rounded-full mb-6">
                <UserGroupIcon className="h-7 w-7 text-tre1-dark" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Team Training</h3>
              <p className="text-gray-600">
                We train your team to use and maintain the automations for long-term success.
              </p>
            </div>
          </div>

          {/* Industries */}
          <div className="mt-20">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              Industries We Serve
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['Real Estate', 'Legal', 'Medical/Dental', 'HVAC', 'Plumbing', 'Auto Repair', 'Consulting', 'Digital Creators'].map((industry) => (
                <div key={industry} className="bg-gray-50 p-4 rounded-lg text-center">
                  <div className="font-medium text-gray-900">{industry}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Benefits */}
          <div className="mt-20 bg-gradient-to-r from-tre1-teal/5 to-teal-600/5 rounded-2xl p-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900">
                Why Choose Tre1 TechnIQ
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <LightBulbIcon className="h-6 w-6 text-tre1-teal" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Expert-Led Strategy</h4>
                  <p className="text-gray-600 mt-1">Our team of automation experts designs solutions specifically for your business needs.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <ClockIcon className="h-6 w-6 text-tre1-orange" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Fast Implementation</h4>
                  <p className="text-gray-600 mt-1">Get your automations up and running in days, not months.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <CheckCircleIcon className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Ongoing Support</h4>
                  <p className="text-gray-600 mt-1">We provide continuous support and optimization as your business grows.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <ChartBarIcon className="h-6 w-6 text-tre1-dark" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Measurable Results</h4>
                  <p className="text-gray-600 mt-1">Track time saved, errors reduced, and revenue increased with clear metrics.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Final CTA */}
          <div className="mt-20 text-center">
            <div className="bg-gradient-to-r from-tre1-teal to-teal-600 rounded-2xl p-10 text-white">
              <h3 className="text-2xl md:text-3xl font-bold mb-6">
                Ready to Transform Your Workflow?
              </h3>
              <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
                Get a free automation audit and discover how much time and money you can save.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/audit"
                  className="inline-flex items-center justify-center bg-white text-tre1-teal font-bold text-lg px-10 py-4 rounded-lg hover:bg-gray-50 transition shadow-lg"
                >
                  Start Free Audit
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  href="/about-lite"
                  className="inline-flex items-center justify-center bg-transparent border-2 border-white text-white font-bold text-lg px-10 py-4 rounded-lg hover:bg-white/10 transition"
                >
                  Learn More
                </Link>
              </div>
              <p className="mt-6 text-white/80 text-sm">
                No credit card required • Get results in 48 hours • No obligation
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}