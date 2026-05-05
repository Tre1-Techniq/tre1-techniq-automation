// components/MultiStepAuditForm.tsx
'use client'

import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react'
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
  ChevronDownIcon,
} from '@heroicons/react/24/outline'

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

type IndustryOption =
  | 'Agency'
  | 'E-commerce'
  | 'SaaS'
  | 'Professional Services'
  | 'Consulting'
  | 'Healthcare'
  | 'Finance'
  | 'Education'
  | 'Other'

const industryOptions: IndustryOption[] = [
  'Agency',
  'E-commerce',
  'SaaS',
  'Professional Services',
  'Consulting',
  'Healthcare',
  'Finance',
  'Education',
  'Other',
]

const steps = [
  {
    id: 1,
    title: 'Company Information',
    description: 'Tell us about your business',
    icon: BuildingOfficeIcon,
    fields: [
      { name: 'companyName', label: 'Company Name', type: 'text', required: true },
      {
        name: 'industry',
        label: 'Industry',
        type: 'select',
        options: [
          'Agency',
          'E-commerce',
          'SaaS',
          'Professional Services',
          'Consulting',
          'Healthcare',
          'Finance',
          'Education',
          'Other',
        ],
        required: true,
      },
      {
        name: 'companySize',
        label: 'Company Size',
        type: 'select',
        options: [
          '1-5 employees',
          '6-20 employees',
          '21-50 employees',
          '51-200 employees',
          '200+ employees',
        ],
        required: true,
      },
      { name: 'zipcode', label: 'Zip Code', type: 'text', required: false },
    ],
  },
  {
    id: 2,
    title: 'Pain Points',
    description: 'What challenges are you facing?',
    icon: ChartBarIcon,
    fields: [
      {
        name: 'primaryPain',
        label: 'Primary Pain Point',
        type: 'textarea',
        placeholder: "What's the biggest workflow challenge you're facing?",
      },
      {
        name: 'timeWasters',
        label: 'Biggest Time Wasters',
        type: 'multiselect',
        options: [
          'Manual data entry',
          'Email overload',
          'Scheduling conflicts',
          'Document management',
          'Client communication',
          'Reporting',
          'Team coordination',
        ],
        required: true,
      },
      {
        name: 'automationGoals',
        label: 'Automation Goals',
        type: 'textarea',
        placeholder: 'What would you like to automate first?',
      },
    ],
  },
  {
    id: 3,
    title: 'Current Tools',
    description: 'What software are you using?',
    icon: DocumentTextIcon,
    fields: [
      {
        name: 'currentTools',
        label: 'Current Software/Tools',
        type: 'multiselect',
        options: [
          'Google Workspace',
          'Microsoft 365',
          'Slack',
          'Zoom',
          'Calendly',
          'QuickBooks',
          'PowerPoint',
          'Zapier',
          'Adobe Creative Cloud',
          'Docusign',
          'ADP',
          'Stripe',
        ],
        required: true,
      },
      {
        name: 'integrationNeeds',
        label: 'Integration Needs',
        type: 'textarea',
        placeholder: 'What systems need to talk to each other?',
      },
      {
        name: 'budget',
        label: 'Monthly Automation Budget',
        type: 'select',
        options: ['$500-$1,000', '$1,000-$2,500', '$2,500-$5,000', '$5,000+', 'Not sure'],
        required: true,
      },
    ],
  },
  {
    id: 4,
    title: 'Contact Details',
    description: 'How can we reach you?',
    icon: UserGroupIcon,
    fields: [
      { name: 'first_name', label: 'First Name', type: 'text', required: true },
      { name: 'last_name', label: 'Last Name', type: 'text', required: false },
      { name: 'contactEmail', label: 'Email Address', type: 'email', required: true },
      { name: 'contactPhone', label: 'Phone Number', type: 'tel' },
      {
        name: 'preferredContact',
        label: 'Preferred Contact Method',
        type: 'select',
        options: ['Email', 'Phone', 'Either'],
        required: true,
      },
    ],
  },
  {
    id: 5,
    title: 'Review & Submit',
    description: 'Confirm your information',
    icon: CheckCircleIcon,
    fields: [],
  },
]

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
    hints: [
      'Select every specific tool currently in the stack.',
      'If you use a CRM, add the actual CRM name below.',
    ],
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

const MAX_DESCRIPTION_LENGTH = 250
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

function uniqueValues(values: string[]) {
  return values.reduce<string[]>((acc, value) => {
    const normalized = normalizePillValue(value)

    if (!normalized) return acc

    const exists = acc.some((item) => item.toLowerCase() === normalized.toLowerCase())

    return exists ? acc : [...acc, normalized]
  }, [])
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
      <label className="mb-2 block text-sm font-medium text-gray-700">
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

function addCustomValue(
  value: string,
  setValues: Dispatch<SetStateAction<string[]>>,
  clearInput: () => void
) {
  const normalized = normalizePillValue(value)

  if (!normalized) return

  setValues((current) => {
    const exists = current.some((item) => item.toLowerCase() === normalized.toLowerCase())

    return exists ? current : [...current, normalized]
  })

  clearInput()
}

function removeCustomValue(value: string, setValues: Dispatch<SetStateAction<string[]>>) {
  setValues((current) => current.filter((item) => item.toLowerCase() !== value.toLowerCase()))
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

  const [usesCrm, setUsesCrm] = useState<'yes' | 'no' | ''>('')
  const [crmPlatformInput, setCrmPlatformInput] = useState('')
  const [crmPlatforms, setCrmPlatforms] = useState<string[]>([])

  const [usesProjectManagement, setUsesProjectManagement] = useState<'yes' | 'no' | ''>('')
  const [projectManagementInput, setProjectManagementInput] = useState('')
  const [projectManagementPlatforms, setProjectManagementPlatforms] = useState<string[]>([])

  const [usesEcommercePlatform, setUsesEcommercePlatform] = useState<'yes' | 'no' | ''>('')
  const [ecommercePlatformInput, setEcommercePlatformInput] = useState('')
  const [ecommercePlatforms, setEcommercePlatforms] = useState<string[]>([])

  const [usesSocialChannels, setUsesSocialChannels] = useState<'yes' | 'no' | ''>('')
  const [socialChannelInput, setSocialChannelInput] = useState('')
  const [socialChannels, setSocialChannels] = useState<string[]>([])

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState('')

  const router = useRouter()
  const formShellRef = useRef<HTMLDivElement>(null)
  const previousStepRef = useRef(currentStep)

  const getSelectedPills = (name: PillFieldName) => {
    return Array.isArray(formData[name]) ? (formData[name] as string[]) : []
  }

  const selectedCurrentTools = getSelectedPills('currentTools')
  const selectedCurrentToolsWithoutNone = selectedCurrentTools.filter(
    (tool) => tool.toLowerCase() !== 'none'
  )

  const enrichedCurrentToolsPreview = uniqueValues([
    ...selectedCurrentToolsWithoutNone,
    ...(usesCrm === 'yes' ? crmPlatforms : []),
    ...(usesProjectManagement === 'yes' ? projectManagementPlatforms : []),
    ...(usesEcommercePlatform === 'yes' ? ecommercePlatforms : []),
    ...(usesSocialChannels === 'yes' ? socialChannels : []),
  ])

  const handleInputChange = (name: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    setFieldErrors((prev) => {
      if (!prev[name as ValidationField]) return prev

      const next = { ...prev }
      delete next[name as ValidationField]
      return next
    })
  }

  const setFieldError = (field: ValidationField, message: string) => {
    setFieldErrors((prev) => ({ ...prev, [field]: message }))
  }

  const clearFieldError = (field: ValidationField) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev

      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  const validateStep1 = () => {
    const nextErrors: ValidationErrors = {}
    const selectedIndustry = String(formData.industry || '').trim()

    if (!String(formData.companyName || '').trim()) {
      nextErrors.companyName = 'Company name is required.'
    }

    if (!industrySelection) {
      nextErrors.industry = 'Industry is required.'
    }

    if (industrySelection === 'Other') {
      const industryValue = selectedIndustry || industryOtherText.trim()

      if (!industryValue) {
        nextErrors.industry = 'Add a short industry description.'
      }

      if (industryValue.length > 50) {
        nextErrors.industry = 'Keep this to 50 characters or fewer.'
      }
    }

    if (!String(formData.companySize || '').trim()) {
      nextErrors.companySize = 'Company size is required.'
    }

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

    setFieldErrors((prev) => {
      const next = { ...prev }

      ;(['companyName', 'industry', 'companySize', 'zipcode'] as ValidationField[]).forEach(
        (field) => delete next[field]
      )

      return { ...next, ...nextErrors }
    })

    return Object.keys(nextErrors).length === 0
  }

  const validateStep2 = () => {
    const nextErrors: ValidationErrors = {}
    const storedPrimaryPain = String(formData.primaryPain || '').trim()

    if (!primaryPainSelection) {
      nextErrors.primaryPain = 'Primary pain point is required.'
    }

    if (primaryPainSelection === 'Other') {
      const primaryPainValue = storedPrimaryPain || primaryPainOtherText.trim()

      if (!primaryPainValue) {
        nextErrors.primaryPain = 'Add a short description.'
      }

      if (primaryPainValue.length > 80) {
        nextErrors.primaryPain = 'Keep this to 80 characters or fewer.'
      }
    }

    if (getSelectedPills('timeWasters').length === 0) {
      nextErrors.timeWasters = 'Select at least one time waster.'
    }

    if (String(formData.automationGoals || '').length > MAX_DESCRIPTION_LENGTH) {
      nextErrors.automationGoals = `Keep this to ${MAX_DESCRIPTION_LENGTH} characters or fewer.`
    }

    if (primaryPainSelection === 'Other' && !storedPrimaryPain && primaryPainOtherText.trim()) {
      handleInputChange('primaryPain', primaryPainOtherText.trim().slice(0, 80))
    }

    setFieldErrors((prev) => {
      const next = { ...prev }

      ;(['primaryPain', 'timeWasters', 'automationGoals'] as ValidationField[]).forEach(
        (field) => delete next[field]
      )

      return { ...next, ...nextErrors }
    })

    return Object.keys(nextErrors).length === 0
  }

  const validateStep3 = () => {
    const nextErrors: ValidationErrors = {}

    const hasSpecificToolSignal =
      selectedCurrentToolsWithoutNone.length > 0 || (usesCrm === 'yes' && crmPlatforms.length > 0)

    if (!hasSpecificToolSignal) {
      nextErrors.currentTools = 'Select at least one tool or add your CRM system.'
    }

    if (usesCrm === 'yes' && crmPlatforms.length === 0) {
      nextErrors.currentTools = 'Add the CRM system you use, or choose No.'
    }

    if (!String(formData.budget || '').trim()) {
      nextErrors.budget = 'Budget is required.'
    }

    if (String(formData.integrationNeeds || '').length > MAX_INTEGRATION_NEEDS_LENGTH) {
      nextErrors.integrationNeeds = `Keep this to ${MAX_INTEGRATION_NEEDS_LENGTH} characters or fewer.`
    }

    setFieldErrors((prev) => {
      const next = { ...prev }

      ;(['currentTools', 'budget', 'integrationNeeds'] as ValidationField[]).forEach(
        (field) => delete next[field]
      )

      return { ...next, ...nextErrors }
    })

    return Object.keys(nextErrors).length === 0
  }

  const validateStep4 = () => {
    const nextErrors: ValidationErrors = {}

    if (!String(formData.first_name || '').trim()) {
      nextErrors.first_name = 'First name is required.'
    }

    if (!String(formData.contactEmail || '').trim()) {
      nextErrors.contactEmail = 'Email is required.'
    } else if (!emailPattern.test(String(formData.contactEmail).trim())) {
      nextErrors.contactEmail = 'Enter a valid email.'
    }

    if (!String(formData.preferredContact || '').trim()) {
      nextErrors.preferredContact = 'Preferred contact is required.'
    }

    const phoneDigits = digitsOnly(String(formData.contactPhone || ''))

    if (phoneDigits.length > 0 && !isValidPhone(phoneDigits)) {
      nextErrors.contactPhone = 'Enter a 10-digit phone number.'
    }

    setFieldErrors((prev) => {
      const next = { ...prev }

      ;(['first_name', 'contactEmail', 'preferredContact', 'contactPhone'] as ValidationField[]).forEach(
        (field) => delete next[field]
      )

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
    setPrimaryPainOtherText(value.slice(0, 80))
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

  const handlePillToggle = (name: PillFieldName, value: string) => {
    const currentValues = getSelectedPills(name)
    const normalizedValue = normalizePillValue(value)

    if (name === 'currentTools' && normalizedValue.toLowerCase() === 'none') {
      const hasNone = currentValues.some((item) => item.toLowerCase() === 'none')
      setSelectedPills(name, hasNone ? [] : ['None'])
      setSubmitError('')
      clearFieldError(name)
      return
    }

    const withoutNone =
      name === 'currentTools'
        ? currentValues.filter((item) => item.toLowerCase() !== 'none')
        : currentValues

    const exists = withoutNone.some(
      (item) => item.toLowerCase() === normalizedValue.toLowerCase()
    )

    const nextValues = exists
      ? withoutNone.filter((item) => item.toLowerCase() !== normalizedValue.toLowerCase())
      : [...withoutNone, normalizedValue]

    setSelectedPills(name, nextValues)
    setSubmitError('')
    clearFieldError(name)
  }

  const handleCustomValueChange = (name: PillFieldName, value: string) => {
    setCustomValues((prev) => ({
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

    const duplicateExists =
      currentValues.some((item) => item.toLowerCase() === value.toLowerCase()) ||
      optionPool.some((option) => option.toLowerCase() === value.toLowerCase())

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
    if (currentStep === 1 && !validateStep1()) return
    if (currentStep === 2 && !validateStep2()) return
    if (currentStep === 3 && !validateStep3()) return
    if (currentStep === 4 && !validateStep4()) return

    if (currentStep < steps.length) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  useEffect(() => {
  const stepChanged = currentStep !== previousStepRef.current

    if (stepChanged) {
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          formShellRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          })
        })
      })
    }

    previousStepRef.current = currentStep
  }, [currentStep])

    const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const handleSubmit = async () => {
    if (!validateAll()) return

    setIsSubmitting(true)
    setSubmitError('')

    const enrichedCurrentTools = enrichedCurrentToolsPreview

    try {
      const response = await fetch('/api/audit-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          currentTools: enrichedCurrentTools,
          toolDetails: {
            usesCrm,
            crmPlatforms,
            usesProjectManagement,
            projectManagementPlatforms,
            usesEcommercePlatform,
            ecommercePlatforms,
            usesSocialChannels,
            socialChannels,
          },
          submittedAt: new Date().toISOString(),
          source: 'multi-step-audit-form',
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit. Please try again.')
      }

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

  const currentStepData = steps.find((step) => step.id === currentStep)
  const activeGuidance = stepGuidance[currentStep] || stepGuidance[1]

  const stepVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  }

  const renderReviewStep = () => {
    const sections = [
      {
        title: 'Company Information',
        data: [
          { label: 'Company Name', value: formData.companyName },
          { label: 'Industry', value: formData.industry },
          { label: 'Company Size', value: formData.companySize },
          { label: 'Zip / Region', value: formData.zipcode },
        ],
      },
      {
        title: 'Pain Points',
        data: [
          { label: 'Primary Pain Point', value: formData.primaryPain },
          {
            label: 'Time Wasters',
            value: Array.isArray(formData.timeWasters)
              ? formData.timeWasters.join(', ')
              : '',
          },
          { label: 'Automation Goals', value: formData.automationGoals },
        ],
      },
      {
        title: 'Current Tools',
        data: [
          {
            label: 'Current Tools',
            value: enrichedCurrentToolsPreview.length > 0
              ? enrichedCurrentToolsPreview.join(', ')
              : '',
          },
          {
            label: 'CRM System',
            value:
              usesCrm === 'yes'
                ? crmPlatforms.join(', ')
                : usesCrm === 'no'
                  ? 'No'
                  : '',
          },
          { label: 'Integration Needs', value: formData.integrationNeeds },
          { label: 'Budget', value: formData.budget },
        ],
      },
      {
        title: 'Contact Details',
        data: [
          { label: 'First Name', value: formData.first_name },
          { label: 'Last Name', value: formData.last_name },
          { label: 'Email', value: formData.contactEmail },
          {
            label: 'Phone',
            value: formData.contactPhone ? formatUsPhone(formData.contactPhone) : '',
          },
          { label: 'Preferred Contact', value: formData.preferredContact },
        ],
      },
    ]

    return (
      <div className="space-y-8">
        <div className="rounded-xl bg-gradient-to-r from-tre1-teal/10 to-teal-600/10 p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Ready to Submit Your Audit Request
          </h3>
          <p className="text-gray-700">
            Review your information below. Once submitted, our team will analyze your workflow and prepare a custom automation strategy within 48 hours.
          </p>
        </div>

        {sections.map((section) => (
          <div key={section.title} className="overflow-hidden rounded-xl border border-gray-200">
            <div className="border-b bg-gray-50 px-6 py-4">
              <h4 className="font-medium text-gray-900">{section.title}</h4>
            </div>

            <div className="divide-y">
              {section.data.map((item) => (
                <div key={item.label} className="flex justify-between px-6 py-4 hover:bg-gray-50">
                  <span className="text-gray-600">{item.label}</span>
                  <span className="max-w-md text-right font-medium text-gray-900">
                    {item.value || <span className="text-gray-400 italic">Not provided</span>}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-6">
          <div className="flex items-start space-x-3">
            <ClockIcon className="mt-0.5 h-6 w-6 flex-shrink-0 text-yellow-600" />
            <div>
              <h4 className="font-medium text-yellow-800">What Happens Next?</h4>
              <ul className="mt-2 space-y-2 text-sm text-yellow-700">
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
      <div className="mb-8">
        <div className="relative flex justify-between">
          <div className="absolute left-[10px] right-[10px] top-5 z-0 h-1 overflow-hidden rounded-full bg-gray-200">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-tre1-teal to-teal-600"
              initial={{ width: '0%' }}
              animate={{
                width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
              }}
              transition={{ duration: 0.5 }}
            />
          </div>

          {steps.map((step) => (
            <div key={step.id} className="relative z-10 flex flex-col items-center">
              <motion.div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                  currentStep >= step.id
                    ? 'scale-110 border-transparent bg-gradient-to-r from-tre1-teal to-teal-600 text-white'
                    : 'border-gray-300 bg-white text-gray-400'
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <step.icon className="h-5 w-5" />
              </motion.div>

              <div className="mt-3 text-center">
                <p
                  className={`text-sm font-medium ${
                    currentStep >= step.id ? 'text-tre1-teal' : 'text-gray-500'
                  }`}
                >
                  Step {step.id}
                </p>

                <p className="mt-1 hidden text-xs text-gray-500 md:block">{step.title}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <aside className="order-1 lg:sticky lg:top-24">
          <div className="h-full rounded-2xl bg-white p-6 shadow-xl md:p-8">
            <div className="space-y-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-tre1-teal">
                  Step {currentStep} of {steps.length}
                </p>

                <h3 className="mt-2 text-2xl font-bold text-gray-900">
                  {activeGuidance.title}
                </h3>

                <p className="mt-2 text-sm text-gray-600">{currentStepData?.description}</p>
              </div>

              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-sm font-semibold text-gray-900">Why this step matters</p>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  {activeGuidance.why}
                </p>
              </div>

              <div className="rounded-xl border border-gray-200 p-4">
                <p className="text-sm font-semibold text-gray-900">Quick hints</p>

                <ul className="mt-3 space-y-2 text-sm leading-6 text-gray-600">
                  {activeGuidance.hints.map((hint) => (
                    <li key={hint} className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-tre1-teal" />
                      <span>{hint}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex justify-center pt-2 text-gray-400 md:hidden">
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
          <div className="rounded-2xl bg-white p-6 shadow-xl md:p-8">
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
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">
                    {currentStepData?.title}
                  </h2>
                  <p className="mt-2 text-gray-600">{currentStepData?.description}</p>
                </div>

                <div className="space-y-6">
                  {currentStep === 1 && (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          Company Name *
                        </label>
                        <input
                          type="text"
                          value={formData.companyName || ''}
                          onChange={(e) => handleInputChange('companyName', e.target.value)}
                          className="w-full rounded-lg border border-gray-300 px-4 py-3 transition focus:border-transparent focus:ring-2 focus:ring-tre1-teal"
                          placeholder="Enter your company name"
                          required
                        />
                        {fieldErrors.companyName && (
                          <p className="mt-2 text-sm text-red-600">
                            {fieldErrors.companyName}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
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
                                  ? industryOtherText.trim() || formData.industry || 'Other'
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
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 transition focus:border-transparent focus:ring-2 focus:ring-tre1-teal"
                                placeholder="Add a short industry description"
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

                          {fieldErrors.industry && (
                            <p className="text-sm text-red-600">{fieldErrors.industry}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          Company Size *
                        </label>
                        <select
                          value={formData.companySize || ''}
                          onChange={(e) => handleInputChange('companySize', e.target.value)}
                          className="w-full rounded-lg border border-gray-300 px-4 py-3 transition focus:border-transparent focus:ring-2 focus:ring-tre1-teal"
                          required
                        >
                          <option value="">Select size</option>
                          {steps[0].fields[2].options?.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                        {fieldErrors.companySize && (
                          <p className="mt-2 text-sm text-red-600">
                            {fieldErrors.companySize}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          Zip / Region
                        </label>
                        <input
                          type="text"
                          value={formData.zipcode || ''}
                          onChange={(e) => handleInputChange('zipcode', e.target.value)}
                          className="w-full rounded-lg border border-gray-300 px-4 py-3 transition focus:border-transparent focus:ring-2 focus:ring-tre1-teal"
                          placeholder="Optional"
                        />
                        {fieldErrors.zipcode && (
                          <p className="mt-2 text-sm text-red-600">{fieldErrors.zipcode}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {currentStep === 2 && (
                    <div className="space-y-6">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
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
                                ? primaryPainOtherText.trim() || formData.primaryPain || 'Other'
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
                              className="w-full rounded-lg border border-gray-300 px-4 py-3 transition focus:border-transparent focus:ring-2 focus:ring-tre1-teal"
                              placeholder="Add a short description"
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

                        {fieldErrors.primaryPain && (
                          <p className="mt-2 text-sm text-red-600">
                            {fieldErrors.primaryPain}
                          </p>
                        )}
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
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          Automation Goals
                        </label>
                        <textarea
                          value={formData.automationGoals || ''}
                          onChange={(e) => handleInputChange('automationGoals', e.target.value)}
                          maxLength={MAX_DESCRIPTION_LENGTH}
                          className="min-h-[120px] w-full rounded-lg border border-gray-300 px-4 py-3 transition focus:border-transparent focus:ring-2 focus:ring-tre1-teal"
                          placeholder="What would you like to automate first? What outcomes are you hoping to achieve?"
                        />
                        {fieldErrors.automationGoals && (
                          <p className="mt-2 text-sm text-red-600">
                            {fieldErrors.automationGoals}
                          </p>
                        )}
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

                      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                        <p className="text-sm font-semibold text-gray-900">
                          Do you use a CRM system?
                        </p>

                        <div className="mt-3 flex gap-3">
                          {(['yes', 'no'] as const).map((value) => (
                            <button
                              key={value}
                              type="button"
                              onClick={() => {
                                setUsesCrm(value)

                                if (value === 'no') {
                                  setCrmPlatformInput('')
                                  setCrmPlatforms([])
                                }

                                clearFieldError('currentTools')
                              }}
                              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                                usesCrm === value
                                  ? 'bg-tre1-teal text-white'
                                  : 'border border-gray-200 bg-white text-gray-700'
                              }`}
                            >
                              {value === 'yes' ? 'Yes' : 'No'}
                            </button>
                          ))}
                        </div>

                        {usesCrm === 'yes' && (
                          <div className="mt-4">
                            <label className="text-sm font-medium text-gray-700">
                              Which CRM do you use?
                            </label>

                            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                              <input
                                type="text"
                                value={crmPlatformInput}
                                onChange={(e) => setCrmPlatformInput(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault()
                                    addCustomValue(crmPlatformInput, setCrmPlatforms, () =>
                                      setCrmPlatformInput('')
                                    )
                                    clearFieldError('currentTools')
                                  }
                                }}
                                maxLength={30}
                                placeholder="HubSpot, Salesforce, Zoho, Pipedrive..."
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-tre1-teal"
                              />

                              <button
                                type="button"
                                onClick={() => {
                                  addCustomValue(crmPlatformInput, setCrmPlatforms, () =>
                                    setCrmPlatformInput('')
                                  )
                                  clearFieldError('currentTools')
                                }}
                                className="rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 sm:w-28"
                              >
                                Add
                              </button>
                            </div>

                            {crmPlatforms.length > 0 && (
                              <div className="mt-3 flex flex-wrap gap-2">
                                {crmPlatforms.map((platform) => (
                                  <span
                                    key={platform}
                                    className="inline-flex items-center gap-2 rounded-full border border-tre1-teal bg-tre1-teal/10 px-4 py-2 text-sm font-medium text-tre1-teal"
                                  >
                                    {platform}
                                    <button
                                      type="button"
                                      onClick={() =>
                                        removeCustomValue(platform, setCrmPlatforms)
                                      }
                                      className="text-tre1-teal/80 hover:text-tre1-teal"
                                      aria-label={`Remove ${platform}`}
                                    >
                                      ×
                                    </button>
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                        <p className="text-sm font-semibold text-gray-900">
                          Do you use project management software?
                        </p>

                        <div className="mt-3 flex gap-3">
                          {(['yes', 'no'] as const).map((value) => (
                            <button
                              key={value}
                              type="button"
                              onClick={() => {
                                setUsesProjectManagement(value)

                                if (value === 'no') {
                                  setProjectManagementInput('')
                                  setProjectManagementPlatforms([])
                                }

                                clearFieldError('currentTools')
                              }}
                              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                                usesProjectManagement === value
                                  ? 'bg-tre1-teal text-white'
                                  : 'border border-gray-200 bg-white text-gray-700'
                              }`}
                            >
                              {value === 'yes' ? 'Yes' : 'No'}
                            </button>
                          ))}
                        </div>

                        {usesProjectManagement === 'yes' && (
                          <div className="mt-4">
                            <label className="text-sm font-medium text-gray-700">
                              Which project management tool do you use?
                            </label>

                            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                              <input
                                type="text"
                                value={projectManagementInput}
                                onChange={(e) => setProjectManagementInput(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault()
                                    addCustomValue(
                                      projectManagementInput,
                                      setProjectManagementPlatforms,
                                      () => setProjectManagementInput('')
                                    )
                                    clearFieldError('currentTools')
                                  }
                                }}
                                maxLength={30}
                                placeholder="Asana, Trello, ClickUp, Monday, Jira..."
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-tre1-teal"
                              />

                              <button
                                type="button"
                                onClick={() => {
                                  addCustomValue(
                                    projectManagementInput,
                                    setProjectManagementPlatforms,
                                    () => setProjectManagementInput('')
                                  )
                                  clearFieldError('currentTools')
                                }}
                                className="rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 sm:w-28"
                              >
                                Add
                              </button>
                            </div>

                            {projectManagementPlatforms.length > 0 && (
                              <div className="mt-3 flex flex-wrap gap-2">
                                {projectManagementPlatforms.map((platform) => (
                                  <span
                                    key={platform}
                                    className="inline-flex items-center gap-2 rounded-full border border-tre1-teal bg-tre1-teal/10 px-4 py-2 text-sm font-medium text-tre1-teal"
                                  >
                                    {platform}
                                    <button
                                      type="button"
                                      onClick={() =>
                                        removeCustomValue(platform, setProjectManagementPlatforms)
                                      }
                                      className="text-tre1-teal/80 hover:text-tre1-teal"
                                      aria-label={`Remove ${platform}`}
                                    >
                                      ×
                                    </button>
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                        <p className="text-sm font-semibold text-gray-900">
                          Do you use an eCommerce platform?
                        </p>

                        <div className="mt-3 flex gap-3">
                          {(['yes', 'no'] as const).map((value) => (
                            <button
                              key={value}
                              type="button"
                              onClick={() => {
                                setUsesEcommercePlatform(value)

                                if (value === 'no') {
                                  setEcommercePlatformInput('')
                                  setEcommercePlatforms([])
                                }

                                clearFieldError('currentTools')
                              }}
                              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                                usesEcommercePlatform === value
                                  ? 'bg-tre1-teal text-white'
                                  : 'border border-gray-200 bg-white text-gray-700'
                              }`}
                            >
                              {value === 'yes' ? 'Yes' : 'No'}
                            </button>
                          ))}
                        </div>

                        {usesEcommercePlatform === 'yes' && (
                          <div className="mt-4">
                            <label className="text-sm font-medium text-gray-700">
                              Which eCommerce platform do you use?
                            </label>

                            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                              <input
                                type="text"
                                value={ecommercePlatformInput}
                                onChange={(e) => setEcommercePlatformInput(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault()
                                    addCustomValue(
                                      ecommercePlatformInput,
                                      setEcommercePlatforms,
                                      () => setEcommercePlatformInput('')
                                    )
                                    clearFieldError('currentTools')
                                  }
                                }}
                                maxLength={30}
                                placeholder="Shopify, WooCommerce, BigCommerce, Wix..."
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-tre1-teal"
                              />

                              <button
                                type="button"
                                onClick={() => {
                                  addCustomValue(
                                    ecommercePlatformInput,
                                    setEcommercePlatforms,
                                    () => setEcommercePlatformInput('')
                                  )
                                  clearFieldError('currentTools')
                                }}
                                className="rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 sm:w-28"
                              >
                                Add
                              </button>
                            </div>

                            {ecommercePlatforms.length > 0 && (
                              <div className="mt-3 flex flex-wrap gap-2">
                                {ecommercePlatforms.map((platform) => (
                                  <span
                                    key={platform}
                                    className="inline-flex items-center gap-2 rounded-full border border-tre1-teal bg-tre1-teal/10 px-4 py-2 text-sm font-medium text-tre1-teal"
                                  >
                                    {platform}
                                    <button
                                      type="button"
                                      onClick={() =>
                                        removeCustomValue(platform, setEcommercePlatforms)
                                      }
                                      className="text-tre1-teal/80 hover:text-tre1-teal"
                                      aria-label={`Remove ${platform}`}
                                    >
                                      ×
                                    </button>
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                        <p className="text-sm font-semibold text-gray-900">
                          Do you sell through social or marketplace channels?
                        </p>

                        <div className="mt-3 flex gap-3">
                          {(['yes', 'no'] as const).map((value) => (
                            <button
                              key={value}
                              type="button"
                              onClick={() => {
                                setUsesSocialChannels(value)

                                if (value === 'no') {
                                  setSocialChannelInput('')
                                  setSocialChannels([])
                                }

                                clearFieldError('currentTools')
                              }}
                              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                                usesSocialChannels === value
                                  ? 'bg-tre1-teal text-white'
                                  : 'border border-gray-200 bg-white text-gray-700'
                              }`}
                            >
                              {value === 'yes' ? 'Yes' : 'No'}
                            </button>
                          ))}
                        </div>

                        {usesSocialChannels === 'yes' && (
                          <div className="mt-4">
                            <label className="text-sm font-medium text-gray-700">
                              Which channels do you use?
                            </label>

                            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                              <input
                                type="text"
                                value={socialChannelInput}
                                onChange={(e) => setSocialChannelInput(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault()
                                    addCustomValue(
                                      socialChannelInput,
                                      setSocialChannels,
                                      () => setSocialChannelInput('')
                                    )
                                    clearFieldError('currentTools')
                                  }
                                }}
                                maxLength={30}
                                placeholder="Instagram Shop, TikTok Shop, Amazon, Etsy..."
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-tre1-teal"
                              />

                              <button
                                type="button"
                                onClick={() => {
                                  addCustomValue(
                                    socialChannelInput,
                                    setSocialChannels,
                                    () => setSocialChannelInput('')
                                  )
                                  clearFieldError('currentTools')
                                }}
                                className="rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 sm:w-28"
                              >
                                Add
                              </button>
                            </div>

                            {socialChannels.length > 0 && (
                              <div className="mt-3 flex flex-wrap gap-2">
                                {socialChannels.map((channel) => (
                                  <span
                                    key={channel}
                                    className="inline-flex items-center gap-2 rounded-full border border-tre1-teal bg-tre1-teal/10 px-4 py-2 text-sm font-medium text-tre1-teal"
                                  >
                                    {channel}
                                    <button
                                      type="button"
                                      onClick={() =>
                                        removeCustomValue(channel, setSocialChannels)
                                      }
                                      className="text-tre1-teal/80 hover:text-tre1-teal"
                                      aria-label={`Remove ${channel}`}
                                    >
                                      ×
                                    </button>
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          Integration Needs
                        </label>
                        <textarea
                          value={formData.integrationNeeds || ''}
                          onChange={(e) =>
                            handleInputChange('integrationNeeds', e.target.value)
                          }
                          maxLength={MAX_INTEGRATION_NEEDS_LENGTH}
                          className="min-h-[120px] w-full rounded-lg border border-gray-300 px-4 py-3 transition focus:border-transparent focus:ring-2 focus:ring-tre1-teal"
                          placeholder="What systems need to talk to each other? Are there specific integrations you need?"
                        />
                        {fieldErrors.integrationNeeds && (
                          <p className="mt-2 text-sm text-red-600">
                            {fieldErrors.integrationNeeds}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          Monthly Automation Budget *
                        </label>
                        <select
                          value={formData.budget || ''}
                          onChange={(e) => handleInputChange('budget', e.target.value)}
                          className="w-full rounded-lg border border-gray-300 px-4 py-3 transition focus:border-transparent focus:ring-2 focus:ring-tre1-teal"
                          required
                        >
                          <option value="">Select budget range</option>
                          {steps[2].fields[2].options?.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                        {fieldErrors.budget && (
                          <p className="mt-2 text-sm text-red-600">{fieldErrors.budget}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {currentStep === 4 && (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          First Name *
                        </label>
                        <input
                          type="text"
                          value={formData.first_name || ''}
                          onChange={(e) => handleInputChange('first_name', e.target.value)}
                          className="w-full rounded-lg border border-gray-300 px-4 py-3 transition focus:border-transparent focus:ring-2 focus:ring-tre1-teal"
                          placeholder="First Name"
                          required
                        />
                        {fieldErrors.first_name && (
                          <p className="mt-2 text-sm text-red-600">
                            {fieldErrors.first_name}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          Last Name
                        </label>
                        <input
                          type="text"
                          value={formData.last_name || ''}
                          onChange={(e) => handleInputChange('last_name', e.target.value)}
                          className="w-full rounded-lg border border-gray-300 px-4 py-3 transition focus:border-transparent focus:ring-2 focus:ring-tre1-teal"
                          placeholder="Last Name"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          value={formData.contactEmail || ''}
                          onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                          className="w-full rounded-lg border border-gray-300 px-4 py-3 transition focus:border-transparent focus:ring-2 focus:ring-tre1-teal"
                          placeholder="you@company.com"
                          required
                        />
                        {fieldErrors.contactEmail && (
                          <p className="mt-2 text-sm text-red-600">
                            {fieldErrors.contactEmail}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={formatUsPhone(formData.contactPhone || '')}
                          onChange={(e) =>
                            handleInputChange(
                              'contactPhone',
                              digitsOnly(e.target.value).slice(0, 10)
                            )
                          }
                          inputMode="numeric"
                          autoComplete="tel-national"
                          className="w-full rounded-lg border border-gray-300 px-4 py-3 transition focus:border-transparent focus:ring-2 focus:ring-tre1-teal"
                          placeholder="(123) 456-7890"
                        />
                        {fieldErrors.contactPhone && (
                          <p className="mt-2 text-sm text-red-600">
                            {fieldErrors.contactPhone}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          Preferred Contact Method *
                        </label>
                        <select
                          value={formData.preferredContact || ''}
                          onChange={(e) =>
                            handleInputChange('preferredContact', e.target.value)
                          }
                          className="w-full rounded-lg border border-gray-300 px-4 py-3 transition focus:border-transparent focus:ring-2 focus:ring-tre1-teal"
                        >
                          <option value="">Select preferred contact method</option>
                          <option value="email">Email</option>
                          <option value="phone">Phone</option>
                          <option value="either">Either</option>
                        </select>
                        {fieldErrors.preferredContact && (
                          <p className="mt-2 text-sm text-red-600">
                            {fieldErrors.preferredContact}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {currentStep === 5 && renderReviewStep()}
                </div>

                <div className="flex justify-between border-t pt-6">
                  <motion.button
                    type="button"
                    onClick={handleBack}
                    className={`flex items-center space-x-2 rounded-lg px-6 py-3 transition ${
                      currentStep === 1
                        ? 'cursor-not-allowed opacity-50'
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
                      className="flex items-center space-x-2 rounded-lg bg-gradient-to-r from-tre1-teal to-teal-600 px-6 py-3 font-semibold text-white transition hover:opacity-90"
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
                      className="flex items-center space-x-2 rounded-lg bg-gradient-to-r from-tre1-orange to-orange-500 px-8 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                      whileHover={!isSubmitting ? { scale: 1.05 } : {}}
                      whileTap={!isSubmitting ? { scale: 0.95 } : {}}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
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

                {submitError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg border border-red-200 bg-red-50 p-4"
                  >
                    <p className="text-red-700">{submitError}</p>
                  </motion.div>
                )}

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