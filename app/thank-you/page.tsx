import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { CheckCircleIcon, CalendarIcon, DocumentTextIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline'

export default function ThankYouPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-tre1-light to-white">
      <Header />
      
      <section className="px-4 py-20 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        {/* Success Icon */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-100 mb-8">
            <CheckCircleIcon className="h-16 w-16 text-green-600" />
          </div>
          
          <h1 className="text-4xl font-bold text-tre1-dark mb-4">
            You're Scheduled for Your Workflow Audit!
          </h1>
          
          <p className="text-xl text-tre1-gray max-w-2xl mx-auto">
            Thanks for requesting a workflow audit with Tre1 TechnIQ. 
            Check your email for confirmation and next steps.
          </p>
        </div>

        {/* Next Steps */}
        <div className="bg-white rounded-2xl p-8 shadow-sm mb-12">
          <h2 className="text-2xl font-semibold text-tre1-dark mb-8 text-center">
            Here's What Happens Next
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 border border-gray-100 rounded-xl hover:border-tre1-teal transition-colors">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                <CalendarIcon className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-tre1-dark mb-2">1. Calendar Confirmation</h3>
              <p className="text-tre1-gray text-sm">
                Check your email for the calendar invite with meeting details and Google Meet link.
              </p>
            </div>
            
            <div className="text-center p-6 border border-gray-100 rounded-xl hover:border-tre1-teal transition-colors">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 mb-4">
                <DocumentTextIcon className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-tre1-dark mb-2">2. Pre-Audit Form (Optional)</h3>
              <p className="text-tre1-gray text-sm">
                Complete a brief 3-minute form to help us focus on your specific workflow challenges.
              </p>
            </div>
            
            <div className="text-center p-6 border border-gray-100 rounded-xl hover:border-tre1-teal transition-colors">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 mb-4">
                <ChatBubbleLeftRightIcon className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-tre1-dark mb-2">3. 15-Minute Audit Call</h3>
              <p className="text-tre1-gray text-sm">
                Join the call at your scheduled time. We'll identify your top 3 automation opportunities.
              </p>
            </div>
          </div>
        </div>

        {/* Preparation Tips */}
        <div className="bg-gradient-to-r from-tre1-teal to-teal-600 rounded-2xl p-8 text-white mb-12">
          <h2 className="text-2xl font-semibold mb-6">How to Prepare</h2>
          <ul className="space-y-4">
            <li className="flex items-start">
              <span className="inline-block w-6 h-6 bg-white text-tre1-teal rounded-full text-center font-bold mr-3 flex-shrink-0">✓</span>
              <span>Think about one repetitive task that takes up significant time each week</span>
            </li>
            <li className="flex items-start">
              <span className="inline-block w-6 h-6 bg-white text-tre1-teal rounded-full text-center font-bold mr-3 flex-shrink-0">✓</span>
              <span>Note any tools or platforms involved (Google Sheets, CRM, email, etc.)</span>
            </li>
            <li className="flex items-start">
              <span className="inline-block w-6 h-6 bg-white text-tre1-teal rounded-full text-center font-bold mr-3 flex-shrink-0">✓</span>
              <span>Consider what "done automatically" would look like for that task</span>
            </li>
          </ul>
        </div>

        {/* Contact & Support */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <h2 className="text-2xl font-semibold text-tre1-dark mb-6">Need to Reschedule or Have Questions?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-medium text-tre1-dark mb-4">Contact Support</h3>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <span className="text-tre1-gray mr-2">📧</span>
                  <a href="mailto:support@tre1techniq.com" className="text-tre1-teal hover:underline">
                    support@tre1techniq.com
                  </a>
                </li>
                <li className="flex items-center">
                  <span className="text-tre1-gray mr-2">⏰</span>
                  <span className="text-tre1-gray">Response within 24 hours</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-medium text-tre1-dark mb-4">Common Questions</h3>
              <ul className="space-y-3 text-tre1-gray">
                <li>• The audit is completely free with no obligation</li>
                <li>• We focus on process, not pushing products</li>
                <li>• All discussions are confidential</li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-lg bg-tre1-teal px-8 py-3 text-base font-semibold text-white hover:bg-teal-600 transition"
          >
            Return to Home
          </a>
          <a
            href="/about-lite"
            className="inline-flex items-center justify-center rounded-lg border border-tre1-teal px-8 py-3 text-base font-semibold text-tre1-teal hover:bg-tre1-teal hover:text-white transition"
          >
            Learn More About Us
          </a>
        </div>

        {/* Confirmation Note */}
        <div className="mt-12 text-center">
          <p className="text-sm text-tre1-gray">
            A confirmation email has been sent to the address you provided. 
            If you don't see it within 5 minutes, please check your spam folder.
          </p>
          <p className="text-xs text-gray-500 mt-4">
            Tre1 TechnIQ Automation • Orange County, CA • By appointment only
          </p>
        </div>
      </section>
      
      <Footer />
    </div>
  )
}