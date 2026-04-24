import Header from '@/components/Header'
import Footer from '@/components/Footer'
//import LeadForm from '@/components/LeadForm'
import MultiStepAuditForm from '@/components/MultiStepAuditForm'

export default function AuditPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-tre1-light to-white">
      <Header />
      
      <section className="px-4 py-20 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-tre1-dark mb-4">
            Start Your Workflow Audit
          </h1>
          <p className="text-xl text-tre1-gray">
            A 15-minute session to map repetitive tasks costing you time and money.
          </p>
          <p className="mt-4 text-sm text-tre1-gray">
            Member login is available after submitting a free audit request. New here? Start with the free audit.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <div className="bg-white rounded-2xl p-8 shadow-sm mb-8">
              <h2 className="text-2xl font-semibold text-tre1-dark mb-4">
                What You'll Get
              </h2>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-tre1-teal/10 flex items-center justify-center">
                      <span className="text-tre1-teal font-bold">1</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="font-medium text-tre1-dark">Identify Top 3 Automation Opportunities</h3>
                    <p className="text-sm text-tre1-gray">Pinpoint where automation will save the most time</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-tre1-teal/10 flex items-center justify-center">
                      <span className="text-tre1-teal font-bold">2</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="font-medium text-tre1-dark">ROI Estimate</h3>
                    <p className="text-sm text-tre1-gray">See potential time and cost savings</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-tre1-teal/10 flex items-center justify-center">
                      <span className="text-tre1-teal font-bold">3</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="font-medium text-tre1-dark">Implementation Roadmap</h3>
                    <p className="text-sm text-tre1-gray">Clear next steps if you decide to proceed</p>
                  </div>
                </li>
              </ul>
            </div>
            
            <div className="bg-tre1-light rounded-2xl p-8">
              <h3 className="text-lg font-semibold text-tre1-dark mb-4">
                Trust & Confidentiality
              </h3>
              <p className="text-tre1-gray text-sm">
                Your workflow details are confidential. We focus on process improvement, 
                not selling pre-packaged solutions. Used by teams across Orange County.
              </p>
            </div>
          </div>
          
          <div>
            <div className="sticky top-24">
              <MultiStepAuditForm />
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  )
}
