// components/InquiryForm.tsx
'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { resend } from '../../../resend'

const steps = [
  { id: 1, title: 'Company Info', fields: ['name', 'email', 'company', 'industry', 'size'] },
  { id: 2, title: 'Pain Points', fields: ['bottlenecks', 'goals', 'timeline'] },
  { id: 3, title: 'Review', fields: [] }
]

export default function InquiryForm() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({})
  
  // Animation variants
  const stepVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 }
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
              <input className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-tre1-teal transition" placeholder="Company Name" />
              {/* More fields */}
            </div>
          )}
          {/* Other steps */}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <button onClick={() => setCurrentStep(s => s - 1)} disabled={currentStep === 1}>
          Back
        </button>
        <button onClick={() => setCurrentStep(s => s + 1)} className="bg-tre1-orange text-white px-6 py-2 rounded-lg">
          {currentStep === steps.length ? 'Submit' : 'Next'}
        </button>
      </div>
    </div>
  )
}