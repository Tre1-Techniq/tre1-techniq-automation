import Header from '@/components/Header'
import Footer from '@/components/Footer'
//import LeadForm from '@/components/LeadForm'
import MultiStepAuditForm from '@/components/MultiStepAuditForm'

export default function AuditPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-tre1-light to-white">
      <Header />
      
      <section className="px-4 py-16 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mx-auto mb-12 max-w-3xl text-center">
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
        <MultiStepAuditForm />
      </section>
      
      <Footer />
    </div>
  )
}
