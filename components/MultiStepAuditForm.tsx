// components/MultiStepAuditForm.tsx - COMPLETE VERSION
'use client'
import { useEffect, useRef, useState } from 'react'
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
  ArrowLeftIcon,
  ChevronDownIcon
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

type PillFieldName = 'timeWasters' | 'currentTools'
type PainPointOption =
  | 'Getting leads'
  | 'Following up with leads'
  | 'Manual repetitive work'
  | 'Managing internal workflows'
  | 'Lack of reporting / visibility'
  | 'System integration issues'
  | 'Other'

const painPointOptions: PainPointOption[] = [
  'Getting leads',
  'Following up with leads',
  'Manual repetitive work',
  'Managing internal workflows',
  'Lack of reporting / visibility',
  'System integration issues',
  'Other',
]

const isPillChoice = (value: string) =>
  painPointOptions.some((option) => option.toLowerCase() === value.toLowerCase())

type IndustryOption =
  | 'Agency'
  | 'E-commerce'
  | 'SaaS'
  | 'Local Business'
  | 'Consulting'
  | 'Healthcare'
  | 'Finance'
  | 'Education'
  | 'Other'

const industryOptions: IndustryOption[] = [
  'Agency',
  'E-commerce',
  'SaaS',
  'Local Business',
  'Consulting',
  'Healthcare',
  'Finance',
  'Education',
  'Other',
]

const isIndustryOption = (value: string) =>
  industryOptions.some((option) => option.toLowerCase() === value.toLowerCase())

const pillOptions: Record<PillFieldName, string[]> = {
  timeWasters: steps[1].fields[1].options as string[],
  currentTools: [...(steps[2].fields[0].options as string[]), 'None'],
}

const stepGuidance: Record<
  number,
  {
    title: string
    why: string
    hints: string[]
    note?: string
  }
> = {
  1: {
    title: 'Step 1: Company basics',
    why: 'This anchors the audit to your business so the recommendations match your size and setup.',
    hints: ['Use the closest fit for industry.', 'If you are not sure, pick Other and add a short note.'],
    note: 'We only use this to shape the audit. No public sharing.',
  },
  2: {
    title: 'Step 2: Pain points',
    why: 'We need one clear priority so the audit can focus on the biggest bottleneck first.',
    hints: ['Pick the one issue that hurts most today.', 'Add time wasters that happen every week.'],
    note: 'Short and specific beats long and broad.',
  },
  3: {
    title: 'Step 3: Current tools',
    why: 'Tool context helps us spot integration gaps and where automation can fit cleanly.',
    hints: ['Select every tool currently in the stack.', 'Choose None only if nothing fits yet.'],
    note: 'This stays private and helps avoid generic recommendations.',
  },
  4: {
    title: 'Step 4: Contact details',
    why: 'We use this to send the audit follow-up and confirm the right person is reached.',
    hints: ['Use the best direct email.', 'Phone is optional but helpful for fast follow-up.'],
    note: 'Your contact details are handled securely.',
  },
  5: {
    title: 'Step 5: Review and submit',
    why: 'A final pass prevents mistakes before the request is sent.',
    hints: ['Check the selected values and custom notes.', 'Use Back to fix anything before submitting.'],
    note: 'Review carefully — this is the final step.',
  },
}

const MAX_CUSTOM_PILL_LENGTH = 30
const MAX_DESCRIPTION_LENGTH = 200
const MAX_INTEGRATION_NEEDS_LENGTH = 120

type ValidationField =
  | 'companyName'
  | 'industry'
  | 'companySize'
  | 'zipcode'
  | 'primaryPain'
  | 'timeWasters'
  | 'currentTools'
  | 'budget'
  | 'first_name'
  | 'contactEmail'
  | 'preferredContact'
  | 'contactPhone'
  | 'automationGoals'
  | 'integrationNeeds'

type ValidationErrors = Partial<Record<ValidationField, string>>

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function digitsOnly(value: string) {
  return value.replace(/\D/g, '')
}

function formatUsPhone(value: string) {
  const digits = digitsOnly(value).slice(0, 10)
  if (!digits) return ''
  if (digits.length < 4) return digits
  if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
}

function isValidPhone(value: string) {
  const digits = digitsOnly(value)
  return digits.length === 0 || digits.length === 10
}

function normalizePillValue(value: string) {
  return value.trim().replace(/\s+/g, ' ')
}

function PillMultiSelectField({
  label,
  required,
  name,
  values,
  customValue,
  error,
  onToggle,
  onCustomValueChange,
  onAddCustom,
  onRemoveValue,
}: {
  label: string
  required?: boolean
  name: PillFieldName
  values: string[]
  customValue: string
  error?: string
  onToggle: (name: PillFieldName, value: string) => void
  onCustomValueChange: (name: PillFieldName, value: string) => void
  onAddCustom: (name: PillFieldName) => void
  onRemoveValue: (name: PillFieldName, value: string) => void
}) {
  const predefinedOptions = pillOptions[name]
  const selectedCustomValues = values.filter(
    (value) => !predefinedOptions.some((option) => option.toLowerCase() === value.toLowerCase())
  )

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required ? '*' : ''}
      </label>

      <div className="flex flex-wrap gap-2">
        {predefinedOptions.map((option) => {
          const active = values.some((value) => value.toLowerCase() === option.toLowerCase())
          return (
            <button
              key={option}
              type="button"
              onClick={() => onToggle(name, option)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                active
                  ? 'border-tre1-teal bg-tre1-teal text-white'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-tre1-teal hover:text-tre1-teal'
              }`}
            >
              {option}
            </button>
          )
        })}
      </div>

      {selectedCustomValues.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {selectedCustomValues.map((value) => (
            <span
              key={value}
              className="inline-flex items-center gap-2 rounded-full border border-tre1-teal bg-tre1-teal/10 px-4 py-2 text-sm font-medium text-tre1-teal"
            >
              {value}
              <button
                type="button"
                onClick={() => onRemoveValue(name, value)}
                className="text-tre1-teal/80 hover:text-tre1-teal"
                aria-label={`Remove ${value}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          value={customValue}
          onChange={(e) => onCustomValueChange(name, e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              onAddCustom(name)
            }
          }}
          maxLength={30}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-tre1-teal"
          placeholder="Add a custom entry"
        />
        <button
          type="button"
          onClick={() => onAddCustom(name)}
          className="rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 sm:w-28"
        >
          Add
        </button>
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  )
}

export default function MultiStepAuditForm() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [fieldErrors, setFieldErrors] = useState<ValidationErrors>({})
  const [industrySelection, setIndustrySelection] = useState<IndustryOption | ''>('')
  const [industryOtherText, setIndustryOtherText] = useState('')
  const [primaryPainSelection, setPrimaryPainSelection] = useState<PainPointOption | ''>('')
  const [primaryPainOtherText, setPrimaryPainOtherText] = useState('')
  const [customValues, setCustomValues] = useState<Record<PillFieldName, string>>({
    timeWasters: '',
    currentTools: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const router = useRouter()
  const formShellRef = useRef<HTMLDivElement>(null)
  const previousStepRef = useRef(currentStep)

  const handleInputChange = (name: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setFieldErrors(prev => {
      if (!prev[name as ValidationField]) return prev
      const next = { ...prev }
      delete next[name as ValidationField]
      return next
    })
  }

  const setFieldError = (field: ValidationField, message: string) => {
    setFieldErrors(prev => ({ ...prev, [field]: message }))
  }

  const clearFieldError = (field: ValidationField) => {
    setFieldErrors(prev => {
      if (!prev[field]) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  const clearErrors = (...fields: ValidationField[]) => {
    setFieldErrors(prev => {
      const next = { ...prev }
      fields.forEach((field) => delete next[field])
      return next
    })
  }

  const validateStep1 = () => {
    const nextErrors: ValidationErrors = {}
    const selectedIndustry = String(formData.industry || '').trim()

    if (!String(formData.companyName || '').trim()) nextErrors.companyName = 'Company name is required.'
    if (!industrySelection) nextErrors.industry = 'Industry is required.'
    if (industrySelection === 'Other') {
      const industryValue = selectedIndustry || industryOtherText.trim()
      if (!industryValue) nextErrors.industry = 'Add a short industry description.'
      if (industryValue.length > 50) nextErrors.industry = 'Keep this to 50 characters or fewer.'
    }
    if (!String(formData.companySize || '').trim()) nextErrors.companySize = 'Company size is required.'
    const zipcode = String(formData.zipcode || '').trim()
    if (zipcode) {
      const basicZipPattern = /^[A-Za-z0-9][A-Za-z0-9\s-]{1,9}$/
      if (!basicZipPattern.test(zipcode)) {
        nextErrors.zipcode = 'Enter a valid zip or region.'
      }
    }

    if (industrySelection === 'Other' && !selectedIndustry && industryOtherText.trim()) {
      handleInputChange('industry', industryOtherText.trim().slice(0, 50))
    }

    setFieldErrors(prev => {
      const next = { ...prev }
      ;(['companyName', 'industry', 'companySize', 'zipcode'] as ValidationField[]).forEach((field) => delete next[field])
      return { ...next, ...nextErrors }
    })
    return Object.keys(nextErrors).length === 0
  }

  const validateStep2 = () => {
    const nextErrors: ValidationErrors = {}
    const storedPrimaryPain = String(formData.primaryPain || '').trim()

    if (!primaryPainSelection) nextErrors.primaryPain = 'Primary pain point is required.'
    if (primaryPainSelection === 'Other') {
      const primaryPainValue = storedPrimaryPain || primaryPainOtherText.trim()
      if (!primaryPainValue) nextErrors.primaryPain = 'Add a short description.'
      if (primaryPainValue.length > 80) nextErrors.primaryPain = 'Keep this to 80 characters or fewer.'
    }
    if (getSelectedPills('timeWasters').length === 0) nextErrors.timeWasters = 'Select at least one time waster.'
    if (String(formData.automationGoals || '').length > MAX_DESCRIPTION_LENGTH) {
      nextErrors.automationGoals = `Keep this to ${MAX_DESCRIPTION_LENGTH} characters or fewer.`
    }

    if (primaryPainSelection === 'Other' && !storedPrimaryPain && primaryPainOtherText.trim()) {
      handleInputChange('primaryPain', primaryPainOtherText.trim().slice(0, 80))
    }

    setFieldErrors(prev => {
      const next = { ...prev }
      ;(['primaryPain', 'timeWasters', 'automationGoals'] as ValidationField[]).forEach((field) => delete next[field])
      return { ...next, ...nextErrors }
    })
    return Object.keys(nextErrors).length === 0
  }

  const validateStep3 = () => {
    const nextErrors: ValidationErrors = {}

    if (getSelectedPills('currentTools').length === 0) nextErrors.currentTools = 'Select at least one tool or None.'
    if (!String(formData.budget || '').trim()) nextErrors.budget = 'Budget is required.'
    if (String(formData.integrationNeeds || '').length > MAX_INTEGRATION_NEEDS_LENGTH) {
      nextErrors.integrationNeeds = `Keep this to ${MAX_INTEGRATION_NEEDS_LENGTH} characters or fewer.`
    }

    setFieldErrors(prev => {
      const next = { ...prev }
      ;(['currentTools', 'budget', 'integrationNeeds'] as ValidationField[]).forEach((field) => delete next[field])
      return { ...next, ...nextErrors }
    })
    return Object.keys(nextErrors).length === 0
  }

  const validateStep4 = () => {
    const nextErrors: ValidationErrors = {}

    if (!String(formData.first_name || '').trim()) nextErrors.first_name = 'First name is required.'
    if (!String(formData.contactEmail || '').trim()) {
      nextErrors.contactEmail = 'Email is required.'
    } else if (!emailPattern.test(String(formData.contactEmail).trim())) {
      nextErrors.contactEmail = 'Enter a valid email.'
    }
    if (!String(formData.preferredContact || '').trim()) nextErrors.preferredContact = 'Preferred contact is required.'

    const phoneDigits = digitsOnly(String(formData.contactPhone || ''))
    if (phoneDigits.length > 0 && !isValidPhone(phoneDigits)) {
      nextErrors.contactPhone = 'Enter a 10-digit phone number.'
    }

    setFieldErrors(prev => {
      const next = { ...prev }
      ;(['first_name', 'contactEmail', 'preferredContact', 'contactPhone'] as ValidationField[]).forEach((field) => delete next[field])
      return { ...next, ...nextErrors }
    })
    return Object.keys(nextErrors).length === 0
  }

  const validateAll = () => {
    const valid1 = validateStep1()
    const valid2 = validateStep2()
    const valid3 = validateStep3()
    const valid4 = validateStep4()
    return valid1 && valid2 && valid3 && valid4
  }

  const getSelectedPills = (name: PillFieldName) => {
    return Array.isArray(formData[name]) ? (formData[name] as string[]) : []
  }

  const validateIndustry = () => {
    if (!industrySelection) {
      setSubmitError('Please select an industry.')
      return false
    }

    if (industrySelection === 'Other') {
      const text = industryOtherText.trim()

      if (!text) {
        setSubmitError('Please add a short description for Other industry.')
        return false
      }

      if (text.length > 50) {
        setSubmitError('Other industry must be 50 characters or fewer.')
        return false
      }
    }

    return true
  }

  const handleIndustrySelect = (value: IndustryOption) => {
    setIndustrySelection(value)
    setSubmitError('')
    clearFieldError('industry')

    if (value === 'Other') {
      handleInputChange('industry', '')
      return
    }

    setIndustryOtherText('')
    handleInputChange('industry', value)
  }

  const handleIndustryOtherChange = (value: string) => {
    setIndustryOtherText(value.slice(0, 50))
    setSubmitError('')
    clearFieldError('industry')
  }

  const handleApplyIndustryOther = () => {
    const normalized = industryOtherText.trim().slice(0, 50)

    if (!normalized) {
      setSubmitError('Please add a short description for Other industry.')
      return
    }

    handleInputChange('industry', normalized)
    setIndustryOtherText('')
    setSubmitError('')
    clearFieldError('industry')
  }

  const handleRemoveIndustry = () => {
    setIndustrySelection('')
    setIndustryOtherText('')
    handleInputChange('industry', '')
    setSubmitError('')
    clearFieldError('industry')
  }

  const validatePrimaryPain = () => {
    if (!primaryPainSelection) {
      setSubmitError('Please select one primary problem.')
      return false
    }

    if (primaryPainSelection === 'Other') {
      const text = primaryPainOtherText.trim()

      if (!text) {
        setSubmitError('Please add a short description for Other.')
        return false
      }

      if (text.length > 80) {
        setSubmitError('Other details must be 80 characters or fewer.')
        return false
      }
    }

    return true
  }

  const handlePrimaryPainSelect = (value: PainPointOption) => {
    setPrimaryPainSelection(value)
    setSubmitError('')
    clearFieldError('primaryPain')

    if (value === 'Other') {
      handleInputChange('primaryPain', '')
      return
    }

    setPrimaryPainOtherText('')
    handleInputChange('primaryPain', value)
  }

  const handlePrimaryPainOtherChange = (value: string) => {
    const normalized = value.slice(0, 80)
    setPrimaryPainOtherText(normalized)
    setSubmitError('')
    clearFieldError('primaryPain')
  }

  const handleApplyPrimaryPainOther = () => {
    const normalized = primaryPainOtherText.trim().slice(0, 80)

    if (!normalized) {
      setSubmitError('Please add a short description for Other.')
      return
    }

    handleInputChange('primaryPain', normalized)
    setPrimaryPainOtherText('')
    setSubmitError('')
    clearFieldError('primaryPain')
  }

  const handleRemovePrimaryPain = () => {
    setPrimaryPainSelection('')
    setPrimaryPainOtherText('')
    handleInputChange('primaryPain', '')
    setSubmitError('')
    clearFieldError('primaryPain')
  }

  const setSelectedPills = (name: PillFieldName, values: string[]) => {
    handleInputChange(name, values)
  }

  const validatePillField = (name: PillFieldName) => {
    if (getSelectedPills(name).length === 0) {
      const label = name === 'timeWasters' ? 'time wasters' : 'current tools'
      setSubmitError(`Please select at least one ${label}.`)
      setFieldError(name, `Select at least one ${label}.`)
      return false
    }

    clearFieldError(name)
    return true
  }

  const handlePillToggle = (name: PillFieldName, value: string) => {
    const currentValues = getSelectedPills(name)
    const normalizedValue = normalizePillValue(value)

    if (name === 'currentTools' && normalizedValue.toLowerCase() === 'none') {
      setSelectedPills(name, currentValues.some((item) => item.toLowerCase() === 'none') ? [] : ['None'])
      setSubmitError('')
      return
    }

    const withoutNone = name === 'currentTools'
      ? currentValues.filter((item) => item.toLowerCase() !== 'none')
      : currentValues

    const exists = withoutNone.some(
      (item) => item.toLowerCase() === normalizedValue.toLowerCase()
    )

    const nextValues = exists
      ? withoutNone.filter(
          (item) => item.toLowerCase() !== normalizedValue.toLowerCase()
        )
      : [...withoutNone, normalizedValue]

    setSelectedPills(name, nextValues)
    setSubmitError('')
    clearFieldError(name)
  }

  const handleCustomValueChange = (name: PillFieldName, value: string) => {
    setCustomValues(prev => ({
      ...prev,
      [name]: value,
    }))
    clearFieldError(name)
  }

  const handleAddCustomPill = (name: PillFieldName) => {
    const rawValue = customValues[name]
    const value = normalizePillValue(rawValue)

    if (!value) return

    const optionPool = pillOptions[name]
    const currentValues = getSelectedPills(name)

    if (value.length > 30) {
      setSubmitError('Custom entries must be 30 characters or fewer.')
      setFieldError(name, 'Custom entries must be 30 characters or fewer.')
      return
    }

    const duplicateExists = currentValues.some(
      (item) => item.toLowerCase() === value.toLowerCase()
    ) || optionPool.some((option) => option.toLowerCase() === value.toLowerCase())

    if (duplicateExists) {
      setSubmitError('That entry is already selected.')
      setFieldError(name, 'That entry is already selected.')
      return
    }

    const customCount = currentValues.filter(
      (item) => !optionPool.some((option) => option.toLowerCase() === item.toLowerCase())
    ).length

    if (customCount >= 3) {
      setSubmitError('You can add up to 3 custom entries.')
      setFieldError(name, 'You can add up to 3 custom entries.')
      return
    }

    const nextValues =
      name === 'currentTools' && currentValues.some((item) => item.toLowerCase() === 'none')
        ? [value]
        : [...currentValues, value]

    setSelectedPills(name, nextValues)
    handleCustomValueChange(name, '')
    setSubmitError('')
    clearFieldError(name)
  }

  const handleRemovePill = (name: PillFieldName, value: string) => {
    const currentValues = getSelectedPills(name)
    setSelectedPills(
      name,
      currentValues.filter((item) => item.toLowerCase() !== value.toLowerCase())
    )
    setSubmitError('')
    clearFieldError(name)
  }

  const handleNext = () => {
    if (currentStep === 1 && !validateStep1()) {
      return
    }

    if (currentStep === 2 && !validateStep2()) {
      return
    }

    if (currentStep === 3 && !validateStep3()) {
      return
    }

    if (currentStep === 4 && !validateStep4()) {
      return
    }

    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1)
    }
  }

  useEffect(() => {
    const isMobile = window.matchMedia('(max-width: 767px)').matches
    const isAdvancing = currentStep > previousStepRef.current

    if (isMobile && isAdvancing) {
      formShellRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }

    previousStepRef.current = currentStep
  }, [currentStep])

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleSubmit = async () => {
    const step1Valid = validateStep1()
    const step2Valid = validateStep2()
    const step3Valid = validateStep3()
    const step4Valid = validateStep4()

    if (!(step1Valid && step2Valid && step3Valid && step4Valid)) {
      if (!step1Valid) setCurrentStep(1)
      else if (!step2Valid) setCurrentStep(2)
      else if (!step3Valid) setCurrentStep(3)
      else if (!step4Valid) setCurrentStep(4)
      return
    }

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

      const result = await response.json()

      if (!response.ok) {
        throw new Error(
          result.error || 'Failed to submit. Please try again.'
        )
      }

      // Redirect to thank you page
      router.push('/thank-you')
      
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Failed to submit. Please try again.'
      )
      console.error('Submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const currentStepData = steps.find(step => step.id === currentStep)
  const activeGuidance = stepGuidance[currentStep] || stepGuidance[1]

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
    <div className="w-full" ref={formShellRef}>
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="relative flex justify-between">
          {/* Progress line */}
          <div className="absolute left-[10px] right-[10px] top-5 h-1 rounded-full bg-gray-200 z-0 overflow-hidden">
            <motion.div 
              className="h-full rounded-full bg-gradient-to-r from-tre1-teal to-teal-600"
              initial={{ width: '0%' }}
              animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          
          {/* Step indicators */}
          {steps.map((step) => (
            <div key={step.id} className="relative z-10 flex flex-col items-center">
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

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-8 items-start">
        <aside className="order-1 lg:sticky lg:top-24">
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 h-full">
            <div className="space-y-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-tre1-teal">
                  Step {currentStep} of {steps.length}
                </p>
                <h3 className="mt-2 text-2xl font-bold text-gray-900">
                  {activeGuidance.title}
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  {currentStepData?.description}
                </p>
              </div>

              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-sm font-semibold text-gray-900">Why this step matters</p>
                <p className="mt-2 text-sm leading-6 text-gray-600">{activeGuidance.why}</p>
              </div>

              <div className="rounded-xl border border-gray-200 p-4">
                <p className="text-sm font-semibold text-gray-900">Quick hints</p>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-gray-600">
                  {activeGuidance.hints.map((hint) => (
                    <li key={hint} className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-tre1-teal flex-shrink-0" />
                      <span>{hint}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="md:hidden flex justify-center pt-2 text-gray-400">
                <ChevronDownIcon className="h-5 w-5 animate-bounce" aria-hidden="true" />
              </div>

              {activeGuidance.note && (
                <div className="rounded-xl bg-tre1-light p-4 text-sm leading-6 text-gray-700">
                  {activeGuidance.note}
                </div>
              )}
            </div>
          </div>
        </aside>

        <section className="order-2 min-w-0">
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
                    {fieldErrors.companyName && <p className="mt-2 text-sm text-red-600">{fieldErrors.companyName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Industry *
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {industryOptions.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => handleIndustrySelect(option)}
                          className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                            industrySelection === option
                              ? 'border-tre1-teal bg-tre1-teal text-white'
                              : 'border-gray-300 bg-white text-gray-700 hover:border-tre1-teal hover:text-tre1-teal'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>

                    <div className="mt-3 space-y-3">
                      {industrySelection && (
                        <div>
                          <span className="inline-flex items-center rounded-full border border-tre1-teal bg-tre1-teal/10 px-4 py-2 text-sm font-medium text-tre1-teal">
                            {industrySelection === 'Other'
                              ? (industryOtherText.trim() || formData.industry || 'Other')
                              : industrySelection}
                            <button
                              type="button"
                              onClick={handleRemoveIndustry}
                              className="ml-2 text-tre1-teal/80 hover:text-tre1-teal"
                              aria-label="Remove industry selection"
                            >
                              ×
                            </button>
                          </span>
                        </div>
                      )}

                      {industrySelection === 'Other' && (
                        <div className="flex flex-col gap-2 sm:flex-row">
                          <input
                            type="text"
                            value={industryOtherText}
                            onChange={(e) => handleIndustryOtherChange(e.target.value)}
                            maxLength={50}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tre1-teal focus:border-transparent transition"
                            placeholder="Add a short industry description (50 characters max)"
                          />
                          <button
                            type="button"
                            onClick={handleApplyIndustryOther}
                            className="rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 sm:w-28"
                          >
                            Apply
                          </button>
                        </div>
                      )}

                      {fieldErrors.industry && <p className="text-sm text-red-600">{fieldErrors.industry}</p>}
                    </div>
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
                    {fieldErrors.companySize && <p className="mt-2 text-sm text-red-600">{fieldErrors.companySize}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Zip / Region
                    </label>
                    <input
                      type="text"
                      value={formData.zipcode || ''}
                      onChange={(e) => handleInputChange('zipcode', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tre1-teal focus:border-transparent transition"
                      placeholder="Optional"
                    />
                    {fieldErrors.zipcode && <p className="mt-2 text-sm text-red-600">{fieldErrors.zipcode}</p>}
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Primary Pain Point *
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {painPointOptions.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => handlePrimaryPainSelect(option)}
                          className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                            primaryPainSelection === option
                              ? 'border-tre1-teal bg-tre1-teal text-white'
                              : 'border-gray-300 bg-white text-gray-700 hover:border-tre1-teal hover:text-tre1-teal'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>

                    {primaryPainSelection && (
                      <div className="mt-3">
                        <span className="inline-flex items-center rounded-full border border-tre1-teal bg-tre1-teal/10 px-4 py-2 text-sm font-medium text-tre1-teal">
                          {primaryPainSelection === 'Other'
                            ? (primaryPainOtherText.trim() || formData.primaryPain || 'Other')
                            : primaryPainSelection}
                          <button
                            type="button"
                            onClick={handleRemovePrimaryPain}
                            className="ml-2 text-tre1-teal/80 hover:text-tre1-teal"
                            aria-label="Remove primary pain selection"
                          >
                            ×
                          </button>
                        </span>
                      </div>
                    )}

                    {primaryPainSelection === 'Other' && (
                      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                        <input
                          type="text"
                          value={primaryPainOtherText}
                          onChange={(e) => handlePrimaryPainOtherChange(e.target.value)}
                          maxLength={80}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tre1-teal focus:border-transparent transition"
                          placeholder="Add a short description (80 characters max)"
                        />
                        <button
                          type="button"
                          onClick={handleApplyPrimaryPainOther}
                          className="rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 sm:w-28"
                          >
                          Apply
                        </button>
                      </div>
                    )}
                    {fieldErrors.primaryPain && <p className="mt-2 text-sm text-red-600">{fieldErrors.primaryPain}</p>}
                  </div>
                  <PillMultiSelectField
                    label="Biggest Time Wasters"
                    required
                    name="timeWasters"
                    values={getSelectedPills('timeWasters')}
                    customValue={customValues.timeWasters}
                    error={fieldErrors.timeWasters}
                    onToggle={handlePillToggle}
                    onCustomValueChange={handleCustomValueChange}
                    onAddCustom={handleAddCustomPill}
                    onRemoveValue={handleRemovePill}
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Automation Goals
                    </label>
                    <textarea
                      value={formData.automationGoals || ''}
                      onChange={(e) => handleInputChange('automationGoals', e.target.value)}
                      maxLength={MAX_DESCRIPTION_LENGTH}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tre1-teal focus:border-transparent transition min-h-[120px]"
                      placeholder="What would you like to automate first? What outcomes are you hoping to achieve?"
                    />
                    {fieldErrors.automationGoals && <p className="mt-2 text-sm text-red-600">{fieldErrors.automationGoals}</p>}
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6">
                  <PillMultiSelectField
                    label="Current Software/Tools"
                    required
                    name="currentTools"
                    values={getSelectedPills('currentTools')}
                    customValue={customValues.currentTools}
                    error={fieldErrors.currentTools}
                    onToggle={handlePillToggle}
                    onCustomValueChange={handleCustomValueChange}
                    onAddCustom={handleAddCustomPill}
                    onRemoveValue={handleRemovePill}
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Integration Needs
                    </label>
                    <textarea
                      value={formData.integrationNeeds || ''}
                      onChange={(e) => handleInputChange('integrationNeeds', e.target.value)}
                      maxLength={MAX_INTEGRATION_NEEDS_LENGTH}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tre1-teal focus:border-transparent transition min-h-[120px]"
                      placeholder="What systems need to talk to each other? Are there specific integrations you need?"
                    />
                    {fieldErrors.integrationNeeds && <p className="mt-2 text-sm text-red-600">{fieldErrors.integrationNeeds}</p>}
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
                    {fieldErrors.budget && <p className="mt-2 text-sm text-red-600">{fieldErrors.budget}</p>}
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
                      placeholder="First Name"
                      required
                    />
                    {fieldErrors.first_name && <p className="mt-2 text-sm text-red-600">{fieldErrors.first_name}</p>}
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
                      placeholder="Last Name"
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
                    {fieldErrors.contactEmail && <p className="mt-2 text-sm text-red-600">{fieldErrors.contactEmail}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formatUsPhone(formData.contactPhone || '')}
                      onChange={(e) => handleInputChange('contactPhone', digitsOnly(e.target.value).slice(0, 10))}
                      inputMode="numeric"
                      autoComplete="tel-national"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tre1-teal focus:border-transparent transition"
                      placeholder="(123) 456-7890"
                    />
                    {fieldErrors.contactPhone && <p className="mt-2 text-sm text-red-600">{fieldErrors.contactPhone}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Contact Method *
                    </label>
                    <select
                    value={formData.preferredContact || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, preferredContact: e.target.value })
                    }
                    className="w-full p-3 border rounded-lg"
                  >
                    <option value="">Select preferred contact method</option>
                    <option value="email">Email</option>
                    <option value="phone">Phone</option>
                    <option value="either">Either</option>
                  </select>
                  {fieldErrors.preferredContact && <p className="mt-2 text-sm text-red-600">{fieldErrors.preferredContact}</p>}
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
        </section>
      </div>
    </div>
  )
}
