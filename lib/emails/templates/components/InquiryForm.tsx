// components/InquiryForm.tsx
'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { sendWelcomeEmail, sendTeamAuditNotification } from '@/lib/resend' // ✅ Use exported functions instead of resend instance

const steps = [
  { id: 1, title: 'Company Info', fields: ['name', 'email', 'company', 'industry', 'size'] },
  { id: 2, title: 'Pain Points', fields: ['bottlenecks', 'goals', 'timeline'] },
  { id: 3, title: 'Review', fields: [] }
]

// email send logicin API vs Route.
export default function InquiryForm() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    industry: '',
    size: '',
    bottlenecks: '',
    goals: '',
    timeline: ''
  })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  
  // Animation variants
  const stepVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    
    try {
      // Send welcome email to the user
      const accessUrl = `${window.location.origin}/audit`

      await sendWelcomeEmail(
        formData.email,
        formData.name,
        formData.company,
        accessUrl
      )
      
      // Send team notification
      await sendTeamAuditNotification({
        company_name: formData.company,
        contact_name: formData.name,
        contact_email: formData.email,
        industry: formData.industry,
        size: formData.size,
        primary_pain: formData.bottlenecks,
        goals: formData.goals,
        timeline: formData.timeline
      })
      
      setSubmitted(true)
      console.log('✅ Form submitted successfully')
      
    } catch (error) {
      console.error('❌ Form submission error:', error)
      alert('There was an error submitting your form. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(s => s + 1)
    } else {
      handleSubmit()
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(s => s - 1)
    }
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto p-8 bg-white rounded-2xl shadow-xl text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-green-600 text-3xl">✓</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
          <p className="text-gray-600">
            Your inquiry was submitted successfully. We'll review your information and respond within 24 hours.
          </p>
        </div>
        <div className="p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            Check your email ({formData.email}) for a confirmation message.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-xl">
      {/* Step indicator */}
      <div className="flex justify-between mb-8">
        {steps.map((step) => (
          <div key={step.id} className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStep >= step.id ? 'bg-tre1-teal text-white' : 'bg-gray-200'}`}>
              {step.id}
            </div>
            <span className="mt-2 text-sm">{step.title}</span>
          </div>
        ))}
      </div>

      {/* Form steps with animations */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          variants={stepVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.3 }}
        >
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-tre1-teal focus:border-transparent transition"
                  placeholder="John Smith"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-tre1-teal focus:border-transparent transition"
                  placeholder="john@example.com"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                <input
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-tre1-teal focus:border-transparent transition"
                  placeholder="Acme Inc."
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                <select
                  name="industry"
                  value={formData.industry}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-tre1-teal focus:border-transparent transition"
                >
                  <option value="">Select industry</option>
                  <option value="real-estate">Real Estate</option>
                  <option value="legal">Legal Services</option>
                  <option value="medical">Medical/Dental</option>
                  <option value="trade">Trade Services</option>
                  <option value="ecommerce">E-commerce</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Size</label>
                <select
                  name="size"
                  value={formData.size}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-tre1-teal focus:border-transparent transition"
                >
                  <option value="">Select size</option>
                  <option value="1-10">1-10 employees</option>
                  <option value="11-50">11-50 employees</option>
                  <option value="51-200">51-200 employees</option>
                  <option value="201+">201+ employees</option>
                </select>
              </div>
            </div>
          )}
          
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Main Bottlenecks *</label>
                <textarea
                  name="bottlenecks"
                  value={formData.bottlenecks}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-tre1-teal focus:border-transparent transition min-h-[100px]"
                  placeholder="What are your biggest workflow challenges? (e.g., manual data entry, scheduling, customer follow-ups)"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Automation Goals</label>
                <textarea
                  name="goals"
                  value={formData.goals}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-tre1-teal focus:border-transparent transition min-h-[80px]"
                  placeholder="What do you hope to achieve with automation? (e.g., save time, reduce errors, scale operations)"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Timeline</label>
                <select
                  name="timeline"
                  value={formData.timeline}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-tre1-teal focus:border-transparent transition"
                >
                  <option value="">Select timeline</option>
                  <option value="immediate">Immediate (within 1 month)</option>
                  <option value="short-term">Short-term (1-3 months)</option>
                  <option value="planning">Planning phase (3-6 months)</option>
                  <option value="exploring">Just exploring</option>
                </select>
              </div>
            </div>
          )}
          
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Your Information</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium">{formData.name || 'Not provided'}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">{formData.email || 'Not provided'}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-600">Company:</span>
                    <span className="font-medium">{formData.company || 'Not provided'}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-600">Industry:</span>
                    <span className="font-medium">{formData.industry || 'Not provided'}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-600">Company Size:</span>
                    <span className="font-medium">{formData.size || 'Not provided'}</span>
                  </div>
                  <div className="border-b pb-2">
                    <span className="text-gray-600 block mb-1">Bottlenecks:</span>
                    <span className="font-medium">{formData.bottlenecks || 'Not provided'}</span>
                  </div>
                  <div className="border-b pb-2">
                    <span className="text-gray-600 block mb-1">Goals:</span>
                    <span className="font-medium">{formData.goals || 'Not provided'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Timeline:</span>
                    <span className="font-medium">{formData.timeline || 'Not provided'}</span>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  After submission, you'll receive a confirmation email and our team will review your inquiry within 24 hours.
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <button
          onClick={handleBack}
          disabled={currentStep === 1}
          className={`px-6 py-2 rounded-lg ${currentStep === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
        >
          Back
        </button>
        
        <button
          onClick={handleNext}
          disabled={loading}
          className="px-6 py-2 bg-tre1-orange text-white rounded-lg hover:bg-orange-600 transition disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center">
              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
              Processing...
            </span>
          ) : currentStep === steps.length ? (
            'Submit Inquiry'
          ) : (
            'Next Step'
          )}
        </button>
      </div>
      
      {/* Progress indicator */}
      <div className="mt-6">
        <div className="flex justify-between text-sm text-gray-500 mb-1">
          <span>Step {currentStep} of {steps.length}</span>
          <span>{Math.round((currentStep / steps.length) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-tre1-teal h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  )
}