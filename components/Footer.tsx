import NewsletterForm from '@/components/NewsletterForm'

export default function Footer() {
  return (
    <footer className="bg-tre1-dark text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-tre1-teal to-teal-600"></div>
              <span className="text-xl font-bold">Tre1 TechnIQ</span>
            </div>
            <p className="text-gray-400 text-sm">
              AI-driven workflow automation for growing Orange County businesses.
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Services</h3>
            <ul className="mt-4 space-y-2">
              <li><a href="/audit" className="text-gray-300 hover:text-white transition">Workflow Audit</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition">Lead Automation</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition">Scheduling Systems</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition">Reporting Dashboards</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Industries</h3>
            <ul className="mt-4 space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-white transition">Real Estate</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition">Local Services</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition">Clinics</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition">Law Firms</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Contact</h3>
            <ul className="mt-4 space-y-2">
              <li className="text-gray-300">Orange County, CA</li>
              <li><a href="mailto:info@tre1techniq.com" className="text-gray-300 hover:text-white transition">info@tre1techniq.com</a></li>
              <li className="text-gray-300">By appointment only</li>
            </ul>
            <div className="mt-4 flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">LinkedIn</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-semibold text-white mb-4">Automation Insights</h3>
          <p className="text-gray-300 mb-4">Get weekly tips to streamline your business</p>
          <NewsletterForm />
        </div>
        
        <div className="mt-8 border-t border-gray-800 pt-8">
          <p className="text-center text-gray-400 text-sm">
            © {new Date().getFullYear()} Tre1 TechnIQ Automation. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}