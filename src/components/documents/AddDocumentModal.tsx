import { useState, useEffect } from 'react'
import {
  Upload,
  FileText,
  X,
  Clock,
  MapPin,
  Users,
  Info,
  Check,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  PenTool,
  Calendar,
  Type,
  CheckSquare,
  User,
  Building2,
  GripVertical,
  Trash2,
  Plus,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Dropdown from '../ui/Dropdown'
import Checkbox from '../ui/Checkbox'
import FormFieldBuilder, { FormField } from './FormFieldBuilder'
import { useToast } from '../ui/Toast'
import { documentTypes, locations, roles } from '../../data/mockData'
import { DocumentCreationType } from './DocumentTypeSelector'

// ── Default write-up questions ───────────────────────────────────────
const DEFAULT_MANAGER_FIELDS: FormField[] = [
  {
    id: 'mgr-reason',
    type: 'single-select',
    label: 'Reason for write-up',
    required: true,
    options: [
      'Attendance / Tardiness',
      'Policy violation',
      'Performance issue',
      'Insubordination',
      'Safety violation',
      'Other',
    ],
  },
  {
    id: 'mgr-incident-date',
    type: 'open-text',
    label: 'Date of incident',
    required: true,
  },
  {
    id: 'mgr-description',
    type: 'open-text',
    label: 'Describe the incident or behavior',
    required: true,
  },
  {
    id: 'mgr-previous-warnings',
    type: 'single-select',
    label: 'Have there been previous verbal or written warnings for this issue?',
    required: true,
    options: ['Yes', 'No'],
  },
  {
    id: 'mgr-corrective-action',
    type: 'open-text',
    label: 'What corrective action is expected from the employee?',
    required: true,
  },
  {
    id: 'mgr-severity',
    type: 'single-select',
    label: 'Severity level',
    required: true,
    options: ['Verbal Warning', 'Written Warning', 'Final Warning', 'Suspension', 'Termination'],
  },
  {
    id: 'mgr-followup',
    type: 'open-text',
    label: 'Follow-up date or review period',
    required: false,
  },
]

const DEFAULT_WORKER_FIELDS: FormField[] = [
  {
    id: 'wkr-agree',
    type: 'single-select',
    label: 'Do you agree with the description of the incident above?',
    required: true,
    options: ['Yes', 'No'],
  },
  {
    id: 'wkr-response',
    type: 'open-text',
    label: 'Employee comments or response',
    required: false,
  },
  {
    id: 'wkr-improvement',
    type: 'open-text',
    label: 'What steps will you take to correct this issue?',
    required: true,
  },
  {
    id: 'wkr-context',
    type: 'open-text',
    label: 'Is there any additional context you would like management to know?',
    required: false,
  },
]

// ── PDF mapping field types ──────────────────────────────────────────
interface MappedField {
  id: string
  type: 'signature' | 'date' | 'text' | 'checkbox' | 'initials'
  label: string
  signer: 'team-member' | 'company'
  x: number
  y: number
}

const MAPPING_FIELD_OPTIONS = [
  { type: 'signature' as const, label: 'Signature', icon: PenTool },
  { type: 'initials' as const, label: 'Initials', icon: PenTool },
  { type: 'date' as const, label: 'Date Signed', icon: Calendar },
  { type: 'text' as const, label: 'Text Field', icon: Type },
  { type: 'checkbox' as const, label: 'Checkbox', icon: CheckSquare },
]

// ── Signer entry model ───────────────────────────────────────────────
interface SignerEntry {
  id: string
  type: 'team-member' | 'company'
  personId: string // 'employee' for team-member, selected admin id for company
}

const COMPANY_SIGNER_OPTIONS = [
  { id: 'cs-1', name: 'Sarah Johnson (HR Manager)' },
  { id: 'cs-2', name: 'Michael Chen (Operations Director)' },
  { id: 'cs-3', name: 'Emily Rodriguez (General Manager)' },
  { id: 'cs-4', name: 'David Kim (District Manager)' },
  { id: 'cs-5', name: 'Amanda Foster (VP of People)' },
  { id: 'cs-6', name: 'James Wilson (Regional Manager)' },
  { id: 'cs-7', name: 'Lisa Park (Store Manager)' },
]

interface AddDocumentModalProps {
  isOpen: boolean
  onClose: () => void
  documentType: DocumentCreationType | null
  onSaveWriteUp?: (writeUp: WriteUpTemplateData) => void
}

export interface WriteUpTemplateData {
  title: string
  type: string
  description: string
  managerFields: FormField[]
  workerFields: FormField[]
  allowDecline: boolean
  escalationDays: number
  permissions: {
    locations: string[]
    roles: string[]
  }
  status: 'draft' | 'active'
}

// ── Step definitions ─────────────────────────────────────────────────
const STEPS: Record<DocumentCreationType, { id: string; label: string }[]> = {
  'pdf-signing': [
    { id: 'basics', label: 'Basics' },
    { id: 'configure', label: 'Configure' },
    { id: 'review', label: 'Review' },
  ],
  'write-up': [
    { id: 'setup', label: 'Setup' },
    { id: 'review', label: 'Review' },
  ],
  'collect-uploads': [
    { id: 'setup', label: 'Setup' },
    { id: 'review', label: 'Review' },
  ],
  duplicate: [{ id: 'select', label: 'Duplicate Document' }],
}

// ── Default pre-fills ────────────────────────────────────────────────
const PREFILLS: Record<string, { name: string; category: string }> = {
  'write-up': { name: 'Employee Write-Up', category: 'written-warning' },
  'collect-uploads': { name: 'Food Handler Certificate', category: 'food-safety' },
}

// ── Category options per type ────────────────────────────────────────
const CATEGORY_OPTIONS: Record<string, { id: string; label: string }[]> = {
  'pdf-signing': documentTypes.map((type) => ({ id: type, label: type })),
  'write-up': [
    { id: 'verbal-warning', label: 'Verbal Warning' },
    { id: 'written-warning', label: 'Written Warning' },
    { id: 'final-warning', label: 'Final Warning' },
    { id: 'performance-improvement', label: 'Performance Improvement Plan' },
    { id: 'recognition', label: 'Recognition' },
    { id: 'coaching', label: 'Coaching' },
    { id: 'other', label: 'Other' },
  ],
  'collect-uploads': [
    { id: 'food-safety', label: 'Food Safety' },
    { id: 'alcohol', label: 'Alcohol/Beverage Service' },
    { id: 'drivers-license', label: "Driver's License" },
    { id: 'work-permit', label: 'Work Permit / Visa' },
    { id: 'professional', label: 'Professional License' },
    { id: 'health', label: 'Health Certificate' },
    { id: 'other', label: 'Other' },
  ],
}

const PLACEHOLDER_MAP: Record<string, { name: string; description: string }> = {
  'pdf-signing': {
    name: 'e.g., Employee Handbook, NDA Agreement',
    description: 'What is this document used for? (optional)',
  },
  'write-up': {
    name: 'e.g., Verbal Warning, Performance Improvement Plan',
    description: 'What is this write-up used for?',
  },
  'collect-uploads': {
    name: "e.g., Food Handler Certificate, Driver's License",
    description: 'Instructions for team members when uploading (optional)',
  },
}

export default function AddDocumentModal({
  isOpen,
  onClose,
  documentType,
  onSaveWriteUp,
}: AddDocumentModalProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [documentName, setDocumentName] = useState('')
  const [docType, setDocType] = useState('')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [description, setDescription] = useState('')
  const [managerFields, setManagerFields] = useState<FormField[]>([])
  const [workerFields, setWorkerFields] = useState<FormField[]>([])

  // Write-up specific state
  const [allowDecline, setAllowDecline] = useState(true)
  const [escalationDays, setEscalationDays] = useState(7)

  // Shared settings state
  const [selectedLocations, setSelectedLocations] = useState<string[]>([])
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [permissionsExpanded, setPermissionsExpanded] = useState(false)

  // Certification-specific state
  const [expirationRequired, setExpirationRequired] = useState(true)
  const [reminderDays, setReminderDays] = useState<number[]>([30, 14, 7, 1])
  const [autoAssignEnabled, setAutoAssignEnabled] = useState(false)
  const [autoAssignTrigger, setAutoAssignTrigger] = useState<'hire' | 'job_change' | 'manual'>(
    'hire'
  )
  const [autoAssignJobTitles, setAutoAssignJobTitles] = useState<string[]>([])
  const [requireVerification, setRequireVerification] = useState(true)

  // PDF signing specific state
  const [signerEntries, setSignerEntries] = useState<SignerEntry[]>([
    { id: 'se-default', type: 'team-member', personId: 'employee' },
  ])
  const [mappedFields, setMappedFields] = useState<MappedField[]>([])
  const [activeSigner, setActiveSigner] = useState<'team-member' | 'company'>('team-member')
  const [draggedFieldId, setDraggedFieldId] = useState<string | null>(null)

  // Derived signer booleans
  const teamMemberSigns = signerEntries.some((e) => e.type === 'team-member')
  const companySigns = signerEntries.some((e) => e.type === 'company')

  const { addToast } = useToast()

  // Pre-populate fields with defaults when modal opens
  useEffect(() => {
    if (!isOpen || !documentType) return

    // Pre-fill name + category for write-ups and certifications
    const prefill = PREFILLS[documentType]
    if (prefill) {
      if (!documentName) setDocumentName(prefill.name)
      if (!docType) setDocType(prefill.category)
    }

    if (documentType === 'write-up') {
      setManagerFields(DEFAULT_MANAGER_FIELDS.map((f) => ({ ...f })))
      setWorkerFields(DEFAULT_WORKER_FIELDS.map((f) => ({ ...f })))
    }
  }, [isOpen, documentType])

  const steps = documentType ? STEPS[documentType] : []
  const totalSteps = steps.length
  const isLastStep = currentStep === totalSteps - 1
  const isFirstStep = currentStep === 0

  // Dynamic modal size — full for PDF configure step
  const getModalSize = (): 'sm' | 'md' | 'lg' | 'xl' | 'full' => {
    const stepId = steps[currentStep]?.id
    if (documentType === 'pdf-signing' && stepId === 'configure') return 'full'
    return 'xl'
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      setUploadedFile(files[0])
      if (!documentName) {
        setDocumentName(files[0].name.replace(/\.[^/.]+$/, ''))
      }
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      setUploadedFile(files[0])
      if (!documentName) {
        setDocumentName(files[0].name.replace(/\.[^/.]+$/, ''))
      }
    }
  }

  const handleClose = () => {
    setCurrentStep(0)
    setDocumentName('')
    setDocType('')
    setUploadedFile(null)
    setDescription('')
    setManagerFields([])
    setWorkerFields([])
    setAllowDecline(true)
    setEscalationDays(7)
    setSelectedLocations([])
    setSelectedRoles([])
    setPermissionsExpanded(false)
    setExpirationRequired(true)
    setReminderDays([30, 14, 7, 1])
    setAutoAssignEnabled(false)
    setAutoAssignTrigger('hire')
    setAutoAssignJobTitles([])
    setRequireVerification(true)
    setSignerEntries([{ id: 'se-default', type: 'team-member', personId: 'employee' }])
    setMappedFields([])
    setActiveSigner('team-member')
    setDraggedFieldId(null)
    onClose()
  }

  const handleNext = () => {
    if (isLastStep) {
      handleSubmit()
    } else {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handleBack = () => {
    if (isFirstStep) return
    setCurrentStep((prev) => prev - 1)
  }

  const handleSubmit = () => {
    if (documentType === 'pdf-signing') {
      // Save template directly — mapping is already done in step 2
      addToast(`"${documentName}" template created successfully`, 'success')
      handleClose()
      return
    }

    if (documentType === 'write-up') {
      const writeUpData: WriteUpTemplateData = {
        title: documentName,
        type: docType,
        description,
        managerFields,
        workerFields,
        allowDecline,
        escalationDays,
        permissions: {
          locations: selectedLocations,
          roles: selectedRoles,
        },
        status: 'active',
      }
      onSaveWriteUp?.(writeUpData)
      addToast('Write-up template created successfully', 'success')
      handleClose()
      return
    }

    addToast(`"${documentName}" template created successfully`, 'success')
    handleClose()
  }

  const handleSaveAsDraft = () => {
    if (documentType === 'write-up') {
      const writeUpData: WriteUpTemplateData = {
        title: documentName,
        type: docType,
        description,
        managerFields,
        workerFields,
        allowDecline,
        escalationDays,
        permissions: {
          locations: selectedLocations,
          roles: selectedRoles,
        },
        status: 'draft',
      }
      onSaveWriteUp?.(writeUpData)
    }
    addToast('Saved as draft', 'success')
    handleClose()
  }

  const isCurrentStepValid = (): boolean => {
    if (!documentType) return false

    if (documentType === 'duplicate') {
      return !!docType && !!documentName
    }

    const stepId = steps[currentStep]?.id
    switch (stepId) {
      case 'basics': // PDF only
        return !!uploadedFile && !!documentName && signerEntries.length > 0
      case 'setup': // Write-up & Cert combined step
        return !!documentName && !!docType
      case 'configure': // PDF mapping
        return true
      case 'review':
        return true
      default:
        return false
    }
  }

  const toggleLocation = (locationId: string) => {
    setSelectedLocations((prev) =>
      prev.includes(locationId) ? prev.filter((id) => id !== locationId) : [...prev, locationId]
    )
  }

  const toggleRole = (roleId: string) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId]
    )
  }

  const toggleReminderDay = (day: number) => {
    setReminderDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort((a, b) => b - a)
    )
  }

  const toggleJobTitle = (title: string) => {
    setAutoAssignJobTitles((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    )
  }

  const jobTitleOptions = [
    'Server',
    'Cook',
    'Bartender',
    'Host',
    'Busser',
    'Dishwasher',
    'Manager',
    'Shift Lead',
    'Prep Cook',
    'Delivery Driver',
  ]

  // ── PDF mapping helpers ────────────────────────────────────────────
  const handleAddMappedField = (type: MappedField['type'], label: string) => {
    const newField: MappedField = {
      id: `mf-${Date.now()}`,
      type,
      label,
      signer: activeSigner,
      x: 80 + Math.random() * 200,
      y: 80 + Math.random() * 250,
    }
    setMappedFields([...mappedFields, newField])
  }

  const handleRemoveMappedField = (fieldId: string) => {
    setMappedFields(mappedFields.filter((f) => f.id !== fieldId))
  }

  const handleDocumentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (draggedFieldId) {
      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      setMappedFields(mappedFields.map((f) => (f.id === draggedFieldId ? { ...f, x, y } : f)))
      setDraggedFieldId(null)
    }
  }

  // ──────── STEP ROUTING ────────
  const renderStepContent = () => {
    if (!documentType) return null

    if (documentType === 'duplicate') return renderDuplicateStep()

    const stepId = steps[currentStep]?.id
    switch (stepId) {
      case 'basics':
        return renderBasicsStep()
      case 'configure':
        return renderConfigureStep()
      case 'setup':
        return documentType === 'write-up' ? renderSetupWriteUp() : renderSetupCertification()
      case 'review':
        return renderReviewStep()
      default:
        return null
    }
  }

  // ══════════════════════════════════════════════════════════════════════
  // STEP 1 — BASICS (shared structure for all types)
  // ══════════════════════════════════════════════════════════════════════
  const renderBasicsStep = () => {
    if (!documentType || documentType === 'duplicate') return null
    const placeholders = PLACEHOLDER_MAP[documentType]
    const categoryOptions = CATEGORY_OPTIONS[documentType]

    return (
      <div className="space-y-6">
        {/* PDF upload area — only for pdf-signing */}
        {documentType === 'pdf-signing' && (
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-2">
              Upload PDF
            </label>
            <div
              onDragOver={(e) => {
                e.preventDefault()
                setIsDragging(true)
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`
                relative border-2 border-dashed rounded-container p-8 transition-colors
                ${
                  isDragging
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-300 hover:border-gray-400'
                }
                ${uploadedFile ? 'bg-gray-50' : ''}
              `}
            >
              {uploadedFile ? (
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-text-primary">{uploadedFile.name}</p>
                    <p className="text-xs text-text-secondary">
                      {(uploadedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <button
                    onClick={() => setUploadedFile(null)}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-text-primary mb-1">
                    Drag and drop your PDF here, or{' '}
                    <label className="text-primary-500 hover:underline cursor-pointer">
                      browse
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf"
                        onChange={handleFileSelect}
                      />
                    </label>
                  </p>
                  <p className="text-xs text-text-secondary">Supports PDF files (Max 10MB)</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Template name — shared */}
        <div>
          <label className="block text-sm font-semibold text-text-primary mb-2">
            Template name
          </label>
          <input
            type="text"
            value={documentName}
            onChange={(e) => setDocumentName(e.target.value)}
            placeholder={placeholders.name}
            className="w-full h-10 px-3 rounded-element border border-border bg-white text-sm text-text-primary placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* Category — shared */}
        <div>
          <label className="block text-sm font-semibold text-text-primary mb-2">Category</label>
          <Dropdown
            options={categoryOptions}
            value={docType}
            onChange={setDocType}
            placeholder="Select category"
          />
        </div>

        {/* Description — shared */}
        <div>
          <label className="block text-sm font-semibold text-text-primary mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={placeholders.description}
            className="w-full h-16 px-3 py-2 rounded-element border border-border bg-white text-sm text-text-primary placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Signers & signing order — PDF only */}
        {documentType === 'pdf-signing' && (
          <div className="border-t border-border-light pt-6">
            <label className="block text-sm font-semibold text-text-primary mb-1">
              Who should sign or complete this document?
            </label>
            <p className="text-xs text-text-secondary mb-4">
              Select signer types and set the signing order. Signers will complete the document in the order shown.
            </p>

            {/* Toggle signer types */}
            <div className="flex gap-3 mb-4">
              <button
                type="button"
                onClick={() => {
                  if (teamMemberSigns) {
                    // Remove team-member entries
                    setSignerEntries((prev) => prev.filter((e) => e.type !== 'team-member'))
                  } else {
                    // Add team-member entry at start
                    setSignerEntries((prev) => [
                      { id: `se-tm-${Date.now()}`, type: 'team-member', personId: 'employee' },
                      ...prev,
                    ])
                  }
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-element border-2 transition-all ${
                  teamMemberSigns
                    ? 'border-blue-400 bg-blue-50'
                    : 'border-border-light bg-white hover:border-gray-300'
                }`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                  teamMemberSigns ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  <User className="w-3.5 h-3.5" />
                </div>
                <div className="text-left">
                  <p className={`text-sm font-medium ${teamMemberSigns ? 'text-blue-700' : 'text-text-primary'}`}>
                    Team member
                  </p>
                </div>
                {teamMemberSigns && <Check className="w-4 h-4 text-blue-500 ml-1" />}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (companySigns) {
                    // Remove all company entries
                    setSignerEntries((prev) => prev.filter((e) => e.type !== 'company'))
                  } else {
                    // Add first company entry at end
                    setSignerEntries((prev) => [
                      ...prev,
                      { id: `se-co-${Date.now()}`, type: 'company', personId: '' },
                    ])
                  }
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-element border-2 transition-all ${
                  companySigns
                    ? 'border-purple-400 bg-purple-50'
                    : 'border-border-light bg-white hover:border-gray-300'
                }`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                  companySigns ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  <Building2 className="w-3.5 h-3.5" />
                </div>
                <div className="text-left">
                  <p className={`text-sm font-medium ${companySigns ? 'text-purple-700' : 'text-text-primary'}`}>
                    Company
                  </p>
                </div>
                {companySigns && <Check className="w-4 h-4 text-purple-500 ml-1" />}
              </button>
            </div>

            {signerEntries.length === 0 && (
              <p className="text-xs text-red-500 flex items-center gap-1 mb-4">
                <Info className="w-3 h-3" />
                Select at least one signer type
              </p>
            )}

            {/* Signing order list */}
            {signerEntries.length > 0 && (
              <div className="border border-border-light rounded-container overflow-hidden">
                <div className="px-4 py-2.5 bg-gray-50 border-b border-border-light">
                  <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Signing order
                  </p>
                </div>
                <div className="divide-y divide-border-light">
                  {signerEntries.map((entry, idx) => {
                    const isTeamMember = entry.type === 'team-member'
                    const companySignerIndex = isTeamMember
                      ? -1
                      : signerEntries.filter((e, i) => e.type === 'company' && i <= idx).length
                    const companySignerCount = signerEntries.filter((e) => e.type === 'company').length

                    return (
                      <div key={entry.id} className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {/* Order badge */}
                          <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold flex items-center justify-center flex-shrink-0">
                            {idx + 1}
                          </span>

                          {/* Icon */}
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            isTeamMember ? 'bg-blue-100' : 'bg-purple-100'
                          }`}>
                            {isTeamMember ? (
                              <User className="w-4 h-4 text-blue-600" />
                            ) : (
                              <Building2 className="w-4 h-4 text-purple-600" />
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            {isTeamMember ? (
                              <div>
                                <p className="text-sm font-medium text-text-primary">Team member signer</p>
                                <p className="text-xs text-text-secondary">Employee receives and signs</p>
                              </div>
                            ) : (
                              <div>
                                <p className="text-sm font-medium text-text-primary mb-1.5">
                                  Company signer #{companySignerIndex}
                                </p>
                                <select
                                  value={entry.personId}
                                  onChange={(e) => {
                                    setSignerEntries((prev) =>
                                      prev.map((se) =>
                                        se.id === entry.id ? { ...se, personId: e.target.value } : se
                                      )
                                    )
                                  }}
                                  className="w-full h-9 px-3 rounded-element border border-border bg-white text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                >
                                  <option value="">Select a person…</option>
                                  {COMPANY_SIGNER_OPTIONS.map((opt) => (
                                    <option key={opt.id} value={opt.id}>
                                      {opt.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            )}
                          </div>

                          {/* Reorder + remove actions */}
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {signerEntries.length > 1 && (
                              <>
                                <button
                                  type="button"
                                  disabled={idx === 0}
                                  onClick={() => {
                                    setSignerEntries((prev) => {
                                      const arr = [...prev]
                                      ;[arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]]
                                      return arr
                                    })
                                  }}
                                  className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                  title="Move up"
                                >
                                  <ArrowUp className="w-3.5 h-3.5 text-gray-500" />
                                </button>
                                <button
                                  type="button"
                                  disabled={idx === signerEntries.length - 1}
                                  onClick={() => {
                                    setSignerEntries((prev) => {
                                      const arr = [...prev]
                                      ;[arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]]
                                      return arr
                                    })
                                  }}
                                  className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                  title="Move down"
                                >
                                  <ArrowDown className="w-3.5 h-3.5 text-gray-500" />
                                </button>
                              </>
                            )}
                            {/* Remove — only for company signers when there are >1 */}
                            {!isTeamMember && companySignerCount > 1 && (
                              <button
                                type="button"
                                onClick={() =>
                                  setSignerEntries((prev) => prev.filter((e) => e.id !== entry.id))
                                }
                                className="w-7 h-7 flex items-center justify-center rounded hover:bg-red-50 transition-colors ml-1"
                                title="Remove signer"
                              >
                                <X className="w-3.5 h-3.5 text-red-400" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Add another company signer */}
                {companySigns && (
                  <div className="px-4 py-3 border-t border-border-light">
                    <button
                      type="button"
                      onClick={() =>
                        setSignerEntries((prev) => [
                          ...prev,
                          { id: `se-co-${Date.now()}`, type: 'company', personId: '' },
                        ])
                      }
                      className="flex items-center gap-2 text-sm font-medium text-primary-500 hover:text-primary-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add another company signer
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Info callout */}
            {companySigns && (
              <div className="flex items-start gap-2.5 p-3 bg-blue-50 border border-blue-200 rounded-element mt-4">
                <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-800">
                  If this document is assigned and there are no eligible company signers within the
                  selected roles, super admins will be notified by default to complete or sign.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  // ══════════════════════════════════════════════════════════════════════
  // COMBINED SETUP — Write-Up (basics + configure merged)
  // ══════════════════════════════════════════════════════════════════════
  const renderSetupWriteUp = () => {
    const placeholders = PLACEHOLDER_MAP['write-up']
    const categoryOptions = CATEGORY_OPTIONS['write-up']

    return (
      <div className="space-y-6">
        {/* Basics section */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-2">Template name</label>
            <input
              type="text"
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              placeholder={placeholders.name}
              className="w-full h-10 px-3 rounded-element border border-border bg-white text-sm text-text-primary placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-2">Category</label>
            <Dropdown
              options={categoryOptions}
              value={docType}
              onChange={setDocType}
              placeholder="Select category"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-text-primary mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={placeholders.description}
            className="w-full h-16 px-3 py-2 rounded-element border border-border bg-white text-sm text-text-primary placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Form Fields */}
        <div className="border-t border-border-light pt-6">
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-2">
              Manager section
            </label>
            <p className="text-xs text-text-secondary mb-3">
              Questions for the manager to complete before sending to the worker.
            </p>
            <FormFieldBuilder
              fields={managerFields}
              onChange={setManagerFields}
              sectionLabel="Manager section"
            />
          </div>
          <div className="mt-6">
            <label className="block text-sm font-semibold text-text-primary mb-2">
              Worker section
            </label>
            <p className="text-xs text-text-secondary mb-3">
              Questions for the worker to respond to after receiving the write-up.
            </p>
            <FormFieldBuilder
              fields={workerFields}
              onChange={setWorkerFields}
              sectionLabel="Worker section"
            />
          </div>
        </div>

        {/* Non-acknowledgement Handling */}
        <div className="border-t border-border-light pt-6">
          <label className="block text-sm font-semibold text-text-primary mb-3">
            Non-acknowledgement handling
          </label>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-element">
              <div className="flex items-center gap-3">
                <Checkbox checked={allowDecline} onChange={setAllowDecline} />
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    Allow employee to decline signing
                  </p>
                  <p className="text-xs text-text-secondary">
                    Employee can refuse with a reason (still valid for records)
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-text-primary mb-1.5">
                  Escalation after
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={escalationDays}
                    onChange={(e) => setEscalationDays(parseInt(e.target.value) || 7)}
                    className="w-20 h-10 px-3 rounded-element border border-border bg-white text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <span className="text-sm text-text-secondary">days without response</span>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-element">
              <Info className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-800">
                After {escalationDays} days without acknowledgement, the write-up will be marked as
                "Refused to Sign" and HR will be notified.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ══════════════════════════════════════════════════════════════════════
  // COMBINED SETUP — Certification (basics + configure merged)
  // ══════════════════════════════════════════════════════════════════════
  const renderSetupCertification = () => {
    const placeholders = PLACEHOLDER_MAP['collect-uploads']
    const categoryOptions = CATEGORY_OPTIONS['collect-uploads']

    return (
      <div className="space-y-6">
        {/* Basics section */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-2">Template name</label>
            <input
              type="text"
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              placeholder={placeholders.name}
              className="w-full h-10 px-3 rounded-element border border-border bg-white text-sm text-text-primary placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-2">Category</label>
            <Dropdown
              options={categoryOptions}
              value={docType}
              onChange={setDocType}
              placeholder="Select category"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-text-primary mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={placeholders.description}
            className="w-full h-16 px-3 py-2 rounded-element border border-border bg-white text-sm text-text-primary placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Expiration Tracking */}
        <div className="border-t border-border-light pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <label className="text-sm font-semibold text-text-primary">Expiration tracking</label>
              <p className="text-xs text-text-secondary mt-0.5">
                Require employees to enter an expiration date when uploading
              </p>
            </div>
            <button
              type="button"
              onClick={() => setExpirationRequired(!expirationRequired)}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                expirationRequired ? 'bg-primary-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  expirationRequired ? 'right-1' : 'left-1'
                }`}
              />
            </button>
          </div>

          {expirationRequired && (
            <div className="flex items-start gap-2.5 p-3 bg-blue-50 border border-blue-200 rounded-element">
              <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-blue-800 space-y-1">
                <p>
                  When assignees upload their document, the <strong>expiration date will be captured
                  automatically via OCR</strong>. If OCR cannot detect the date, the assignee will be
                  asked to enter it manually.
                </p>
                <p>
                  You'll be notified when certifications are approaching expiry so you can request
                  updated documents.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-element">
          <div className="flex items-center gap-3">
            <Checkbox checked={requireVerification} onChange={setRequireVerification} />
            <div>
              <p className="text-sm font-medium text-text-primary">Require manager verification</p>
              <p className="text-xs text-text-secondary">Manager must approve uploaded documents</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ══════════════════════════════════════════════════════════════════════
  // PDF STEP 2 — CONFIGURE (PDF mapping only now)
  // ══════════════════════════════════════════════════════════════════════
  const renderConfigureStep = () => {
    if (!documentType || documentType !== 'pdf-signing') return null
    return renderConfigurePdf()
  }

  // ── PDF Mapping Widget (embedded in modal) ─────────────────────────
  const renderConfigurePdf = () => {
    const availableSigners: { id: 'team-member' | 'company'; label: string; icon: typeof User }[] =
      []
    if (teamMemberSigns)
      availableSigners.push({ id: 'team-member', label: 'Team Member', icon: User })
    if (companySigns)
      availableSigners.push({ id: 'company', label: 'Company', icon: Building2 })

    // Ensure activeSigner is valid
    if (availableSigners.length > 0 && !availableSigners.find((s) => s.id === activeSigner)) {
      setActiveSigner(availableSigners[0].id)
    }

    const teamMemberFieldCount = mappedFields.filter((f) => f.signer === 'team-member').length
    const companyFieldCount = mappedFields.filter((f) => f.signer === 'company').length

    return (
      <div className="flex gap-0 -mx-6 -mb-1" style={{ height: '60vh' }}>
        {/* Left Sidebar — field tools */}
        <div className="w-64 flex-shrink-0 border-r border-border-light flex flex-col bg-gray-50 overflow-y-auto ml-6 rounded-l-lg">
          {/* Signer selector */}
          <div className="p-4 border-b border-border-light">
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
              Adding fields for
            </label>
            <div className="space-y-1.5">
              {availableSigners.map((signer) => {
                const Icon = signer.icon
                const isActive = activeSigner === signer.id
                const count =
                  signer.id === 'team-member' ? teamMemberFieldCount : companyFieldCount
                return (
                  <button
                    key={signer.id}
                    onClick={() => setActiveSigner(signer.id)}
                    className={`w-full flex items-center gap-2.5 p-2.5 rounded-element border transition-colors ${
                      isActive
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-border-light bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center ${
                        signer.id === 'team-member'
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-purple-100 text-purple-600'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary">{signer.label}</p>
                    </div>
                    {count > 0 && (
                      <span className="text-xs text-text-secondary bg-gray-200 px-1.5 py-0.5 rounded">
                        {count}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Signature fields */}
          <div className="p-4 border-b border-border-light">
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
              Signature fields
            </label>
            <div className="space-y-1.5">
              {MAPPING_FIELD_OPTIONS.filter((o) => o.type === 'signature' || o.type === 'initials').map(
                (option) => {
                  const Icon = option.icon
                  return (
                    <button
                      key={option.type}
                      onClick={() => handleAddMappedField(option.type, option.label)}
                      className="w-full flex items-center gap-2.5 p-2.5 rounded-element border border-border-light bg-white hover:bg-gray-50 hover:border-gray-300 transition-colors cursor-pointer"
                    >
                      <div
                        className={`w-7 h-7 rounded flex items-center justify-center ${
                          activeSigner === 'team-member'
                            ? 'bg-blue-50 text-blue-600'
                            : 'bg-purple-50 text-purple-600'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-sm font-medium text-text-primary">{option.label}</span>
                    </button>
                  )
                }
              )}
            </div>
          </div>

          {/* Auto-fill fields */}
          <div className="p-4 border-b border-border-light">
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
              Auto-fill fields
            </label>
            <div className="space-y-1.5">
              {MAPPING_FIELD_OPTIONS.filter(
                (o) => o.type !== 'signature' && o.type !== 'initials'
              ).map((option) => {
                const Icon = option.icon
                return (
                  <button
                    key={option.type}
                    onClick={() => handleAddMappedField(option.type, option.label)}
                    className="w-full flex items-center gap-2.5 p-2.5 rounded-element border border-border-light bg-white hover:bg-gray-50 hover:border-gray-300 transition-colors cursor-pointer"
                  >
                    <div
                      className={`w-7 h-7 rounded flex items-center justify-center ${
                        activeSigner === 'team-member'
                          ? 'bg-blue-50 text-blue-600'
                          : 'bg-purple-50 text-purple-600'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-sm font-medium text-text-primary">{option.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Added fields list */}
          {mappedFields.length > 0 && (
            <div className="p-4 flex-1 overflow-auto">
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                Placed fields ({mappedFields.length})
              </label>
              <div className="space-y-1.5">
                {mappedFields.map((field) => {
                  const FieldIcon =
                    MAPPING_FIELD_OPTIONS.find((o) => o.type === field.type)?.icon || Type
                  return (
                    <div
                      key={field.id}
                      className="flex items-center justify-between p-2 bg-white rounded border border-border-light"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-5 h-5 rounded flex items-center justify-center ${
                            field.signer === 'team-member'
                              ? 'bg-blue-100 text-blue-600'
                              : 'bg-purple-100 text-purple-600'
                          }`}
                        >
                          <FieldIcon className="w-3 h-3" />
                        </div>
                        <span className="text-xs font-medium text-text-primary">{field.label}</span>
                      </div>
                      <button
                        onClick={() => handleRemoveMappedField(field.id)}
                        className="w-5 h-5 flex items-center justify-center rounded hover:bg-gray-100 transition-colors"
                      >
                        <Trash2 className="w-3 h-3 text-gray-400" />
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Main Content — document preview */}
        <div className="flex-1 bg-gray-200 overflow-auto p-6 mr-6 rounded-r-lg">
          <div className="max-w-2xl mx-auto">
            <div
              className="relative bg-white shadow-lg rounded-lg overflow-hidden cursor-crosshair"
              style={{ minHeight: '600px', aspectRatio: '8.5/11' }}
              onClick={handleDocumentClick}
            >
              {/* Simulated PDF content */}
              <div className="absolute inset-0 p-10">
                <div className="space-y-5">
                  <div className="text-center border-b border-gray-200 pb-5">
                    <h1 className="text-xl font-bold text-gray-800">{documentName}</h1>
                    <p className="text-xs text-gray-400 mt-1">{uploadedFile?.name}</p>
                  </div>
                  <div className="space-y-2.5">
                    <div className="h-3.5 bg-gray-100 rounded w-full" />
                    <div className="h-3.5 bg-gray-100 rounded w-11/12" />
                    <div className="h-3.5 bg-gray-100 rounded w-full" />
                    <div className="h-3.5 bg-gray-100 rounded w-9/12" />
                  </div>
                  <div className="space-y-2.5 pt-3">
                    <div className="h-3.5 bg-gray-100 rounded w-full" />
                    <div className="h-3.5 bg-gray-100 rounded w-10/12" />
                    <div className="h-3.5 bg-gray-100 rounded w-full" />
                    <div className="h-3.5 bg-gray-100 rounded w-8/12" />
                  </div>
                  <div className="space-y-2.5 pt-3">
                    <div className="h-3.5 bg-gray-100 rounded w-full" />
                    <div className="h-3.5 bg-gray-100 rounded w-full" />
                    <div className="h-3.5 bg-gray-100 rounded w-7/12" />
                  </div>
                  {/* Signature area hint */}
                  <div className="pt-10 mt-10 border-t border-dashed border-gray-300">
                    <p className="text-xs text-gray-400 text-center mb-6">
                      Click on the document to place fields, or add them from the sidebar
                    </p>
                    <div className="flex justify-between">
                      <div className="text-center">
                        <div className="w-40 border-b border-gray-300 mb-1.5" />
                        <p className="text-[10px] text-gray-400">Signature</p>
                      </div>
                      <div className="text-center">
                        <div className="w-40 border-b border-gray-300 mb-1.5" />
                        <p className="text-[10px] text-gray-400">Date</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Placed fields */}
              {mappedFields.map((field) => {
                const FieldIcon =
                  MAPPING_FIELD_OPTIONS.find((o) => o.type === field.type)?.icon || Type
                return (
                  <div
                    key={field.id}
                    draggable
                    onDragStart={() => setDraggedFieldId(field.id)}
                    onDragEnd={() => setDraggedFieldId(null)}
                    className={`absolute cursor-move group ${
                      draggedFieldId === field.id ? 'opacity-50' : ''
                    }`}
                    style={{ left: field.x, top: field.y }}
                  >
                    <div
                      className={`flex items-center gap-1 px-2 py-1 rounded border-2 shadow-sm text-xs font-medium ${
                        field.signer === 'team-member'
                          ? 'bg-blue-50 border-blue-400 text-blue-700'
                          : 'bg-purple-50 border-purple-400 text-purple-700'
                      }`}
                    >
                      <GripVertical className="w-3 h-3 opacity-50" />
                      <FieldIcon className="w-3 h-3" />
                      <span>{field.label}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRemoveMappedField(field.id)
                        }}
                        className="ml-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ══════════════════════════════════════════════════════════════════════
  // STEP 3 — REVIEW (shared structure for all types)
  // ══════════════════════════════════════════════════════════════════════
  const renderReviewStep = () => {
    if (!documentType || documentType === 'duplicate') return null

    return (
      <div className="space-y-6">
        {/* Summary Card */}
        <div className="bg-gray-50 rounded-container border border-border-light p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-3">Summary</h3>
          <div className="space-y-2">
            {documentType === 'pdf-signing' && uploadedFile && (
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">File</span>
                <span className="text-text-primary font-medium">{uploadedFile.name}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Template name</span>
              <span className="text-text-primary font-medium">{documentName}</span>
            </div>
            {docType && (
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Category</span>
                <span className="text-text-primary font-medium">
                  {CATEGORY_OPTIONS[documentType]?.find((o) => o.id === docType)?.label || docType}
                </span>
              </div>
            )}
            {description && (
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Description</span>
                <span className="text-text-primary font-medium truncate max-w-[60%] text-right">
                  {description}
                </span>
              </div>
            )}

            {/* PDF-specific summary */}
            {documentType === 'pdf-signing' && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Signing order</span>
                  <span className="text-text-primary font-medium">
                    {signerEntries
                      .map((e) => {
                        if (e.type === 'team-member') return 'Team Member'
                        const person = COMPANY_SIGNER_OPTIONS.find((o) => o.id === e.personId)
                        return person ? person.name.split('(')[0].trim() : 'Company Signer'
                      })
                      .join(' → ')}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Total signers</span>
                  <span className="text-text-primary font-medium">{signerEntries.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Mapped fields</span>
                  <span className="text-text-primary font-medium">{mappedFields.length}</span>
                </div>
              </>
            )}

            {/* Write-up-specific summary */}
            {documentType === 'write-up' && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Manager questions</span>
                  <span className="text-text-primary font-medium">{managerFields.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Worker questions</span>
                  <span className="text-text-primary font-medium">{workerFields.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Escalation</span>
                  <span className="text-text-primary font-medium">{escalationDays} days</span>
                </div>
              </>
            )}

            {/* Certification-specific summary */}
            {documentType === 'collect-uploads' && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Expiration tracking</span>
                  <span className="text-text-primary font-medium">
                    {expirationRequired ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                {expirationRequired && (
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Expiration capture</span>
                    <span className="text-text-primary font-medium">Via OCR + manual fallback</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Manager verification</span>
                  <span className="text-text-primary font-medium">
                    {requireVerification ? 'Required' : 'Not required'}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Permissions — shared, collapsible */}
        <div className="border border-border-light rounded-container overflow-hidden">
          <button
            type="button"
            onClick={() => setPermissionsExpanded(!permissionsExpanded)}
            className="flex items-center justify-between w-full p-4 text-left hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                <Users className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary">Permissions</p>
                <p className="text-xs text-text-secondary">
                  {selectedLocations.length === 0 && selectedRoles.length === 0
                    ? 'All locations and roles can use this template'
                    : `${selectedLocations.length} location(s), ${selectedRoles.length} role(s) selected`}
                </p>
              </div>
            </div>
            {permissionsExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {permissionsExpanded && (
            <div className="border-t border-border-light p-4 space-y-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-text-primary mb-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  Locations
                </label>
                <div className="flex flex-wrap gap-2">
                  {locations.map((location) => (
                    <button
                      key={location.id}
                      type="button"
                      onClick={() => toggleLocation(location.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        selectedLocations.includes(location.id)
                          ? 'bg-primary-500 text-white'
                          : 'bg-gray-100 text-text-primary hover:bg-gray-200'
                      }`}
                    >
                      {location.name}
                    </button>
                  ))}
                </div>
                {selectedLocations.length === 0 && (
                  <p className="text-xs text-text-secondary mt-1.5">
                    No locations selected = available at all locations
                  </p>
                )}
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-text-primary mb-2">
                  <Users className="w-4 h-4 text-gray-500" />
                  Roles that can use this template
                </label>
                <div className="flex flex-wrap gap-2">
                  {roles.map((role) => (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => toggleRole(role.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        selectedRoles.includes(role.id)
                          ? 'bg-primary-500 text-white'
                          : 'bg-gray-100 text-text-primary hover:bg-gray-200'
                      }`}
                    >
                      {role.name}
                    </button>
                  ))}
                </div>
                {selectedRoles.length === 0 && (
                  <p className="text-xs text-text-secondary mt-1.5">
                    No roles selected = available to all managers
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Auto-assign — signing & certification */}
        {(documentType === 'pdf-signing' || documentType === 'collect-uploads') && (
          <div className="border border-border-light rounded-container p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary">Auto-assign rules</p>
                <p className="text-xs text-text-secondary">
                  {autoAssignEnabled
                    ? `Automatically assign on ${
                        autoAssignTrigger === 'hire' ? 'new hire' : 'job change'
                      }`
                    : 'Manually assign when needed'}
                </p>
              </div>
            </div>
            <div className="space-y-4 pl-11">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-text-primary">
                  Enable auto-assign
                </label>
                <button
                  type="button"
                  onClick={() => setAutoAssignEnabled(!autoAssignEnabled)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    autoAssignEnabled ? 'bg-primary-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      autoAssignEnabled ? 'right-1' : 'left-1'
                    }`}
                  />
                </button>
              </div>
              {autoAssignEnabled && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Assign when
                    </label>
                    <div className="flex gap-2">
                      {[
                        { id: 'hire', label: 'Employee is hired' },
                        { id: 'job_change', label: 'Job title changes' },
                      ].map((trigger) => (
                        <button
                          key={trigger.id}
                          type="button"
                          onClick={() =>
                            setAutoAssignTrigger(trigger.id as 'hire' | 'job_change')
                          }
                          className={`flex-1 px-3 py-2 rounded-element border text-sm font-medium transition-all ${
                            autoAssignTrigger === trigger.id
                              ? 'border-primary-500 bg-primary-50 text-primary-700'
                              : 'border-border-light hover:border-gray-300 text-text-primary'
                          }`}
                        >
                          {trigger.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      For employees with job title
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {jobTitleOptions.map((title) => (
                        <button
                          key={title}
                          type="button"
                          onClick={() => toggleJobTitle(title)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                            autoAssignJobTitles.includes(title)
                              ? 'bg-primary-500 text-white'
                              : 'bg-gray-100 text-text-primary hover:bg-gray-200'
                          }`}
                        >
                          {title}
                        </button>
                      ))}
                    </div>
                    {autoAssignJobTitles.length === 0 && (
                      <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                        <Info className="w-3 h-3" />
                        Select at least one job title, or leave empty to apply to all
                      </p>
                    )}
                  </div>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-element">
                    <p className="text-xs text-blue-800">
                      <strong>Rule preview:</strong> When{' '}
                      {autoAssignTrigger === 'hire'
                        ? 'a new employee is hired'
                        : "an employee's job title changes"}
                      {autoAssignJobTitles.length > 0
                        ? ` as ${autoAssignJobTitles.join(' or ')}`
                        : ''}
                      , automatically assign this document.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  // ──────── DUPLICATE STEP ────────
  const renderDuplicateStep = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-text-primary mb-2">
          Select document to duplicate
        </label>
        <Dropdown
          options={[
            { id: '1', label: 'PIPL_consent_form.pdf' },
            { id: '2', label: 'Contract.pdf' },
            { id: '3', label: 'VFS_consent_form.pdf' },
            { id: '4', label: 'Food_Safety_Certificate.pdf' },
            { id: '5', label: 'Employee_Handbook_2024.pdf' },
          ]}
          value={docType}
          onChange={setDocType}
          placeholder="Select a document"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-text-primary mb-2">
          New document name
        </label>
        <input
          type="text"
          value={documentName}
          onChange={(e) => setDocumentName(e.target.value)}
          placeholder="Enter new document name"
          className="w-full h-10 px-3 rounded-element border border-border bg-white text-sm text-text-primary placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>
      <div className="bg-blue-50 border border-blue-200 rounded-element p-4">
        <p className="text-sm text-blue-800">
          This will create a copy of the selected document with all its settings. You can modify it
          after creation.
        </p>
      </div>
    </div>
  )

  // ──────── FOOTER ────────
  const getSubmitLabel = () => {
    if (documentType === 'duplicate') return 'Duplicate'
    return 'Create Template'
  }

  const renderFooter = () => {
    return (
      <div className="flex items-center justify-between w-full">
        <div>
          {isFirstStep ? (
            <Button variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
          ) : (
            <Button
              variant="ghost"
              leftIcon={<ArrowLeft className="w-4 h-4" />}
              onClick={handleBack}
            >
              Back
            </Button>
          )}
        </div>
        <div className="flex items-center gap-3">
          {documentType === 'write-up' && isLastStep && (
            <Button
              variant="outline"
              onClick={handleSaveAsDraft}
              disabled={!documentName || !docType}
            >
              Save as Draft
            </Button>
          )}
          <Button
            onClick={handleNext}
            disabled={!isCurrentStepValid()}
            rightIcon={!isLastStep ? <ArrowRight className="w-4 h-4" /> : undefined}
          >
            {isLastStep ? getSubmitLabel() : 'Next'}
          </Button>
        </div>
      </div>
    )
  }

  // ──────── MODAL TITLE ────────
  const typeLabels: Record<DocumentCreationType, string> = {
    'pdf-signing': 'Upload PDF for Signing',
    'write-up': 'Create Write-Up',
    'collect-uploads': 'Collect Uploads',
    duplicate: 'Duplicate Document',
  }

  const modalTitle = documentType ? typeLabels[documentType] : 'Add Document Template'

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={modalTitle}
      size={getModalSize()}
      footer={renderFooter()}
    >
      <div className="space-y-6">
        {/* Step Indicator */}
        {totalSteps > 1 && (
          <div className="pb-4 border-b border-border-light">
            <div className="flex items-center gap-1">
              {steps.map((step, index) => {
                const isActive = index === currentStep
                const isCompleted = index < currentStep

                return (
                  <div key={step.id} className="flex items-center flex-1">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div
                        className={`
                          w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold transition-all
                          ${
                            isCompleted
                              ? 'bg-green-500 text-white'
                              : isActive
                              ? 'bg-primary-500 text-white'
                              : 'bg-gray-200 text-gray-500'
                          }
                        `}
                      >
                        {isCompleted ? <Check className="w-3.5 h-3.5" /> : index + 1}
                      </div>
                      <span
                        className={`text-xs font-medium truncate ${
                          isActive
                            ? 'text-text-primary'
                            : isCompleted
                            ? 'text-green-600'
                            : 'text-text-secondary'
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                    {index < totalSteps - 1 && (
                      <div
                        className={`h-px flex-shrink-0 w-6 mx-1 ${
                          index < currentStep ? 'bg-green-400' : 'bg-gray-200'
                        }`}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Step Content */}
        {renderStepContent()}
      </div>
    </Modal>
  )
}
