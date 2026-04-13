// components/MultiStepAuditForm.tsx - COMPLETE VERSION
'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
  BuildingOfficeIcon,
  ChartBarIcon,
  ClockIcon,
  UserGroupIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'

const steps = [
  {
    id: 1,
    title: 'Company Information',
    description: 'Tell us about your business',
    icon: BuildingOfficeIcon,
    fields: [
      { name: 'companyName', label: 'Company Name', type: 'text', required: true },
      { name: 'industry', label: 'Industry', type: 'select', options: ['Real Estate', 'Legal', 'Medical/Dental', 'HVAC', 'Plumbing', 'Auto Repair', 'Consulting', 'Other'], required: true },
      { name: 'companySize', label: 'Company Size', type: 'select', options: ['1-5 employees', '6-20 employees', '21-50 employees', '51-200 employees', '200+ employees'], required: true },
      { name: 'zipcode', label: 'Zip Code', type: 'text', required: true },
    ]
  },
  {
    id: 2,
    title: 'Pain Points',
    description: 'What challenges are you facing?',
    icon: ChartBarIcon,
    fields: [
      { name: 'primaryPain', label: 'Primary Pain Point', type: 'textarea', placeholder: 'What\'s the biggest workflow challenge you\'re facing?' },
      { name: 'timeWasters', label: 'Biggest Time Wasters', type: 'multiselect', options: ['Manual data entry', 'Email overload', 'Scheduling conflicts', 'Document management', 'Client communication', 'Reporting', 'Team coordination'], required: true },
      { name: 'automationGoals', label: 'Automation Goals', type: 'textarea', placeholder: 'What would you like to automate first?' },
    ]
  },
  {
    id: 3,
    title: 'Current Tools',
    description: 'What software are you using?',
    icon: DocumentTextIcon,
    fields: [
      { name: 'currentTools', label: 'Current Software/Tools', type: 'multiselect', options: ['Google Workspace', 'Microsoft 365', 'Slack', 'Zoom', 'Calendly', 'CRM (Salesforce, HubSpot)', 'QuickBooks', 'Other accounting software', 'Project management (Asana, Trello)', 'Custom solutions'], required: true },
      { name: 'integrationNeeds', label: 'Integration Needs', type: 'textarea', placeholder: 'What systems need to talk to each other?' },
      { name: 'budget', label: 'Monthly Automation Budget', type: 'select', options: ['$500-$1,000', '$1,000-$2,500', '$2,500-$5,000', '$5,000+', 'Not sure'], required: true },
    ]
  },
  {
    id: 4,
    title: 'Contact Details',
    description: 'How can we reach you?',
    icon: UserGroupIcon,
    fields: [
      { name: 'firstName', label: 'First Name', type: 'text', required: true },
      { name: 'lastName', label: 'Last Name', type: 'text', required: false },
      { name: 'contactEmail', label: 'Email Address', type: 'email', required: true },
      { name: 'contactPhone', label: 'Phone Number', type: 'tel' },
      { name: 'preferredContact', label: 'Preferred Contact Method', type: 'select', options: ['Email', 'Phone', 'Video Call'], required: true },
    ]
  },
  {
    id: 5,
    title: 'Review & Submit',
    description: 'Confirm your information',
    icon: CheckCircleIcon,
    fields: []
  }
]

export default function MultiStepAuditForm() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const router = useRouter()

  const handleInputChange = (name: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setSubmitError('')
    
    try {
      // Submit to your API
      const response = await fetch('/api/audit-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          submittedAt: new Date().toISOString(),
          source: 'multi-step-audit-form'
        }),
      })

      if (!response.ok) {
        throw new Error('Submission failed')
      }

      // Redirect to thank you page
      router.push('/thank-you')
      
    } catch (error) {
      setSubmitError('Failed to submit. Please try again.')
      console.error('Submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const currentStepData = steps.find(step => step.id === currentStep)

  // Animation variants
  const stepVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 }
  }

  // Review step content
  const renderReviewStep = () => {
    const sections = [
      {
        title: 'Company Information',
        data: [
          { label: 'Company Name', value: formData.companyName },
          { label: 'Industry', value: formData.industry },
          { label: 'Company Size', value: formData.companySize },
          { label: 'Zip Code', value: formData.zipcode },
        ]
      },
      {
        title: 'Pain Points',
        data: [
          { label: 'Primary Pain Point', value: formData.primaryPain },
          { label: 'Time Wasters', value: Array.isArray(formData.timeWasters) ? formData.timeWasters.join(', ') : '' },
          { label: 'Automation Goals', value: formData.automationGoals },
        ]
      },
      {
        title: 'Current Tools',
        data: [
          { label: 'Current Tools', value: Array.isArray(formData.currentTools) ? formData.currentTools.join(', ') : '' },
          { label: 'Integration Needs', value: formData.integrationNeeds },
          { label: 'Budget', value: formData.budget },
        ]
      },
      {
        title: 'Contact Details',
        data: [
          { label: 'First Name', value: formData.first_name },
          { label: 'Last Name', value: formData.last_name },
          { label: 'Email', value: formData.contactEmail },
          { label: 'Phone', value: formData.contactPhone },
          { label: 'Preferred Contact', value: formData.preferredContact },
        ]
      }
    ]

    return (
      <div className="space-y-8">
        <div className="bg-gradient-to-r from-tre1-teal/10 to-teal-600/10 p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ready to Submit Your Audit Request</h3>
          <p className="text-gray-700">
            Review your information below. Once submitted, our team will analyze your workflow and prepare a custom automation strategy within 48 hours.
          </p>
        </div>

        {sections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b">
              <h4 className="font-medium text-gray-900">{section.title}</h4>
            </div>
            <div className="divide-y">
              {section.data.map((item, itemIndex) => (
                <div key={itemIndex} className="px-6 py-4 flex justify-between hover:bg-gray-50">
                  <span className="text-gray-600">{item.label}</span>
                  <span className="font-medium text-gray-900 text-right max-w-md">
                    {item.value || <span className="text-gray-400 italic">Not provided</span>}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <ClockIcon className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-800">What Happens Next?</h4>
              <ul className="mt-2 space-y-2 text-yellow-700 text-sm">
                <li>• Our automation experts review your submission</li>
                <li>• We analyze your workflow pain points</li>
                <li>• Prepare a custom automation strategy</li>
                <li>• Schedule a 30-minute consultation call</li>
                <li>• Deliver actionable recommendations within 48 hours</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-12">
        <div className="flex justify-between relative">
          {/* Progress line */}
          <div className="absolute top-4 left-0 right-0 h-1 bg-gray-200 -z-10">
            <motion.div 
              className="h-full bg-gradient-to-r from-tre1-teal to-teal-600"
              initial={{ width: '0%' }}
              animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          
          {/* Step indicators */}
          {steps.map((step) => (
            <div key={step.id} className="flex flex-col items-center relative">
              <motion.div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  currentStep >= step.id 
                    ? 'bg-gradient-to-r from-tre1-teal to-teal-600 border-transparent text-white scale-110' 
                    : 'bg-white border-gray-300 text-gray-400'
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <step.icon className="h-5 w-5" />
              </motion.div>
              <div className="mt-3 text-center">
                <p className={`text-sm font-medium ${currentStep >= step.id ? 'text-tre1-teal' : 'text-gray-500'}`}>
                  Step {step.id}
                </p>
                <p className="text-xs text-gray-500 mt-1 hidden md:block">
                  {step.title}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            variants={stepVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            {/* Step Header */}
            <div className="text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                {currentStepData?.title}
              </h2>
              <p className="text-gray-600 mt-2">
                {currentStepData?.description}
              </p>
            </div>

            {/* Form Fields */}
            <div className="space-y-6">
              {currentStep === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      value={formData.companyName || ''}
                      onChange={(e) => handleInputChange('companyName', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tre1-teal focus:border-transparent transition"
                      placeholder="Enter your company name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Industry *
                    </label>
                    <select
                      value={formData.industry || ''}
                      onChange={(e) => handleInputChange('industry', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tre1-teal focus:border-transparent transition"
                      required
                    >
                      <option value="">Select industry</option>
                      {steps[0].fields[1].options?.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Size *
                    </label>
                    <select
                      value={formData.companySize || ''}
                      onChange={(e) => handleInputChange('companySize', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tre1-teal focus:border-transparent transition"
                      required
                    >
                      <option value="">Select size</option>
                      {steps[0].fields[2].options?.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Zip Code *
                    </label>
                    <input
                      type="text"
                      value={formData.zipcode || ''}
                      onChange={(e) => handleInputChange('zipcode', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tre1-teal focus:border-transparent transition"
                      required
                    />
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Primary Pain Point
                    </label>
                    <textarea
                      value={formData.primaryPain || ''}
                      onChange={(e) => handleInputChange('primaryPain', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tre1-teal focus:border-transparent transition min-h-[120px]"
                      placeholder="Describe the biggest workflow challenge you're facing..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Biggest Time Wasters *
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {steps[1].fields[1].options?.map(option => (
                        <label key={option} className="flex items-center space-x-3 p-3 border border-gray-300 rounded-lg hover:border-tre1-teal hover:bg-tre1-teal/5 transition cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.timeWasters?.includes(option) || false}
                            onChange={(e) => {
                              const current = formData.timeWasters || []
                              const newValue = e.target.checked
                                ? [...current, option]
                                : current.filter((item: string) => item !== option)
                              handleInputChange('timeWasters', newValue)
                            }}
                            className="h-4 w-4 text-tre1-teal focus:ring-tre1-teal"
                          />
                          <span className="text-gray-700">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Automation Goals
                    </label>
                    <textarea
                      value={formData.automationGoals || ''}
                      onChange={(e) => handleInputChange('automationGoals', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tre1-teal focus:border-transparent transition min-h-[120px]"
                      placeholder="What would you like to automate first? What outcomes are you hoping to achieve?"
                    />
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Software/Tools *
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {steps[2].fields[0].options?.map(option => (
                        <label key={option} className="flex items-center space-x-3 p-3 border border-gray-300 rounded-lg hover:border-tre1-teal hover:bg-tre1-teal/5 transition cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.currentTools?.includes(option) || false}
                            onChange={(e) => {const current = formData.currentTools || []
                              const newValue = e.target.checked
                                ? [...current, option]
                                : current.filter((item: string) => item !== option)
                              handleInputChange('currentTools', newValue)
                            }}
                            className="h-4 w-4 text-tre1-teal focus:ring-tre1-teal"
                          />
                          <span className="text-gray-700">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Integration Needs
                    </label>
                    <textarea
                      value={formData.integrationNeeds || ''}
                      onChange={(e) => handleInputChange('integrationNeeds', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tre1-teal focus:border-transparent transition min-h-[120px]"
                      placeholder="What systems need to talk to each other? Are there specific integrations you need?"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Monthly Automation Budget *
                    </label>
                    <select
                      value={formData.budget || ''}
                      onChange={(e) => handleInputChange('budget', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tre1-teal focus:border-transparent transition"
                      required
                    >
                      <option value="">Select budget range</option>
                      {steps[2].fields[2].options?.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={formData.first_name || ''}
                      onChange={(e) => handleInputChange('first_name', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tre1-teal focus:border-transparent transition"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={formData.last_name || ''}
                      onChange={(e) => handleInputChange('last_name', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tre1-teal focus:border-transparent transition"
                      placeholder="Enter your full name"
                      //required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={formData.contactEmail || ''}
                      onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tre1-teal focus:border-transparent transition"
                      placeholder="you@company.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.contactPhone || ''}
                      onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tre1-teal focus:border-transparent transition"
                      placeholder="(123) 456-7890"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Contact Method *
                    </label>
                    <select
                      value={formData.preferredContact || ''}
                      onChange={(e) => handleInputChange('preferredContact', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tre1-teal focus:border-transparent transition"
                      required
                    >
                      <option value="">Select method</option>
                      {steps[3].fields[3].options?.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {currentStep === 5 && renderReviewStep()}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 border-t">
              <motion.button
                type="button"
                onClick={handleBack}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition ${
                  currentStep === 1
                    ? 'opacity-50 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                disabled={currentStep === 1}
                whileHover={currentStep > 1 ? { scale: 1.05 } : {}}
                whileTap={currentStep > 1 ? { scale: 0.95 } : {}}
              >
                <ArrowLeftIcon className="h-5 w-5" />
                <span>Back</span>
              </motion.button>

              {currentStep < steps.length ? (
                <motion.button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-tre1-teal to-teal-600 text-white font-semibold rounded-lg hover:opacity-90 transition"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>Continue</span>
                  <ArrowRightIcon className="h-5 w-5" />
                </motion.button>
              ) : (
                <motion.button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-tre1-orange to-orange-500 text-white font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={!isSubmitting ? { scale: 1.05 } : {}}
                  whileTap={!isSubmitting ? { scale: 0.95 } : {}}
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="h-5 w-5" />
                      <span>Submit Audit Request</span>
                    </>
                  )}
                </motion.button>
              )}
            </div>

            {/* Error Message */}
            {submitError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-50 border border-red-200 rounded-lg"
              >
                <p className="text-red-700">{submitError}</p>
              </motion.div>
            )}

            {/* Step Indicator */}
            <div className="text-center text-sm text-gray-500">
              Step {currentStep} of {steps.length}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Form Completion Stats */}
      <div className="mt-8 text-center">
        <div className="inline-flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-full">
          <div className="h-2 w-24 bg-gray-300 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-tre1-teal to-teal-600"
              initial={{ width: '0%' }}
              animate={{ width: `${(currentStep / steps.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <span className="text-sm text-gray-600">
            {Math.round((currentStep / steps.length) * 100)}% Complete
          </span>
        </div>
      </div>
    </div>
  )
}