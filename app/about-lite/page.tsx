import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function AboutLitePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-tre1-light to-white">
      <Header />
      
      <section className="px-4 py-20 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-tre1-dark mb-6">
            About Tre1 TechnIQ
          </h1>
          <div className="w-32 h-32 rounded-full bg-gradient-to-r from-tre1-teal to-teal-600 mx-auto mb-6"></div>
        </div>
        
        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-semibold text-tre1-dark mb-4">
              Hi, I'm Tre
            </h2>
            <p className="text-tre1-gray mb-6">
              I'm a software developer who helps businesses automate their day-to-day processes using modern AI systems. 
              My background in JavaScript/TypeScript and Python means I integrate directly with your tech stack 
              rather than selling off-the-shelf chatbots.
            </p>
            
            <h3 className="text-xl font-semibold text-tre1-dark mb-4">
              Why Start with an Audit?
            </h3>
            <p className="text-tre1-gray mb-6">
              Most businesses have repetitive tasks they don't even realize can be automated. A 15-minute workflow audit 
              identifies the top 3 opportunities where automation can save you the most time and reduce errors.
            </p>
            
            <div className="bg-tre1-light rounded-xl p-6 my-8">
              <h4 className="text-lg font-semibold text-tre1-dark mb-3">
                My Approach
              </h4>
              <ul className="space-y-2 text-tre1-gray">
                <li className="flex items-start">
                  <span className="inline-block w-6 h-6 bg-tre1-teal text-white rounded-full text-center mr-3 flex-shrink-0">✓</span>
                  <span>No AI jargon, just practical process improvements</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-6 h-6 bg-tre1-teal text-white rounded-full text-center mr-3 flex-shrink-0">✓</span>
                  <span>Focus on measurable time savings and ROI</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-6 h-6 bg-tre1-teal text-white rounded-full text-center mr-3 flex-shrink-0">✓</span>
                  <span>Build systems that work with your existing tools</span>
                </li>
              </ul>
            </div>
            
            <div className="text-center mt-12">
              <a
                href="/audit"
                className="inline-flex items-center justify-center rounded-lg bg-tre1-orange px-8 py-3 text-base font-semibold text-white hover:bg-orange-600"
              >
                Book Your Workflow Audit
              </a>
              <p className="mt-4 text-sm text-tre1-gray">
                Orange County businesses only • 15-minute consultation • No obligation
              </p>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  )
}