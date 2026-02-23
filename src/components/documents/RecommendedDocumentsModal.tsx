import { useState, useMemo } from 'react'
import {
  MapPin,
  Briefcase,
  Building2,
  AlertCircle,
  CheckCircle2,
  Search,
  FileSignature,
  Upload,
  ClipboardList,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Check,
  Info,
} from 'lucide-react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import { DocumentTemplate, TemplateCategory, TrackingMode } from '../../data/mockData'

// ─── Types ───────────────────────────────────────────────────────────

type RecommendationReason = 'state' | 'job-title' | 'industry' | 'gap'

interface RecommendedDocument {
  id: string
  name: string
  category: TemplateCategory
  type: string
  trackingMode: TrackingMode
  description: string
  completedBy: string // "Employee" | "Manager" | "Both"
  reason: RecommendationReason
  reasonLabel: string
  tags: string[]
  /** If true, this document is already in the user's template list */
  alreadyAdded?: boolean
}

interface RecommendedDocumentsModalProps {
  isOpen: boolean
  onClose: () => void
  existingTemplates: DocumentTemplate[]
  onAddTemplates: (templates: DocumentTemplate[]) => void
}

// ─── Recommended Documents Database ──────────────────────────────────
// Based on real HR/compliance requirements for restaurant/food service industry

const RECOMMENDED_DOCUMENTS: RecommendedDocument[] = [
  // ── State / Location Based ──
  {
    id: 'rec-w4',
    name: 'W-4 Employee Withholding Certificate',
    category: 'signing',
    type: 'Payroll',
    trackingMode: 'progress',
    description: 'Federal tax withholding form required for all employees. Must be completed before first paycheck.',
    completedBy: 'Employee',
    reason: 'state',
    reasonLabel: 'Required in all states',
    tags: ['Federal', 'Tax', 'Payroll'],
  },
  {
    id: 'rec-i9',
    name: 'I-9 Employment Eligibility Verification',
    category: 'signing',
    type: 'Onboarding',
    trackingMode: 'progress',
    description: 'Verifies identity and employment authorization. Must be completed within 3 business days of hire.',
    completedBy: 'Both',
    reason: 'state',
    reasonLabel: 'Required in all states',
    tags: ['Federal', 'Compliance', 'Onboarding'],
  },
  {
    id: 'rec-deposit',
    name: 'Direct Deposit Authorization',
    category: 'signing',
    type: 'Payroll',
    trackingMode: 'progress',
    description: 'Authorizes electronic deposit of wages to the employee\'s bank account.',
    completedBy: 'Employee',
    reason: 'state',
    reasonLabel: 'Required in all states',
    tags: ['Payroll', 'Banking'],
  },
  {
    id: 'rec-wage-notice',
    name: 'Wage Theft Prevention Notice',
    category: 'signing',
    type: 'Payroll',
    trackingMode: 'progress',
    description: 'Written notice to employees about their rate of pay, overtime rate, pay day, and employer information. Required in CA, NY, and other states.',
    completedBy: 'Both',
    reason: 'state',
    reasonLabel: 'Required in CA, NY, TX, MN & more',
    tags: ['State', 'Compliance', 'Payroll'],
  },
  {
    id: 'rec-meal-break',
    name: 'Meal & Rest Break Policy Acknowledgment',
    category: 'signing',
    type: 'Company Policy',
    trackingMode: 'progress',
    description: 'Policy governing meal and rest break entitlements. Especially critical in states like California with strict requirements.',
    completedBy: 'Employee',
    reason: 'state',
    reasonLabel: 'Required in CA, WA, OR, CO & more',
    tags: ['State', 'Policy', 'Labor Law'],
  },
  {
    id: 'rec-workers-comp',
    name: 'Workers\' Compensation Notice',
    category: 'signing',
    type: 'Compliance',
    trackingMode: 'progress',
    description: 'Informs employees of their rights under workers\' compensation insurance and how to report workplace injuries.',
    completedBy: 'Employee',
    reason: 'state',
    reasonLabel: 'Required in all states',
    tags: ['Compliance', 'Safety', 'Insurance'],
  },

  // ── Job Title Based ──
  {
    id: 'rec-tip-pool',
    name: 'Tip Pooling & Tip Credit Notice',
    category: 'signing',
    type: 'Payroll',
    trackingMode: 'progress',
    description: 'Disclosure of tip pooling arrangements and tip credit taken by the employer. Required for all tipped employees.',
    completedBy: 'Employee',
    reason: 'job-title',
    reasonLabel: 'For Servers, Bartenders & tipped roles',
    tags: ['Payroll', 'Tips', 'Compliance'],
  },
  {
    id: 'rec-alcohol-policy',
    name: 'Responsible Alcohol Service Policy',
    category: 'signing',
    type: 'Company Policy',
    trackingMode: 'progress',
    description: 'Guidelines for responsible service of alcohol, including ID checking procedures and refusal protocols.',
    completedBy: 'Employee',
    reason: 'job-title',
    reasonLabel: 'For Bartenders & Servers',
    tags: ['Policy', 'Alcohol', 'Compliance'],
  },
  {
    id: 'rec-cash-handling',
    name: 'Cash Handling & POS Policy',
    category: 'signing',
    type: 'Operations',
    trackingMode: 'progress',
    description: 'Procedures for handling cash, processing transactions, and operating POS systems. Includes shortage accountability.',
    completedBy: 'Employee',
    reason: 'job-title',
    reasonLabel: 'For Cashiers, Servers & Bartenders',
    tags: ['Operations', 'Policy', 'Finance'],
  },
  {
    id: 'rec-manager-agreement',
    name: 'Manager Confidentiality Agreement',
    category: 'signing',
    type: 'Onboarding',
    trackingMode: 'progress',
    description: 'Confidentiality and non-disclosure agreement for managers with access to sensitive business and personnel information.',
    completedBy: 'Employee',
    reason: 'job-title',
    reasonLabel: 'For Managers & Shift Leads',
    tags: ['Management', 'Confidentiality', 'Onboarding'],
  },
  {
    id: 'rec-knife-safety',
    name: 'Knife & Kitchen Equipment Safety Acknowledgment',
    category: 'signing',
    type: 'Safety',
    trackingMode: 'progress',
    description: 'Safety training acknowledgment for kitchen equipment, knife handling, and burn prevention procedures.',
    completedBy: 'Employee',
    reason: 'job-title',
    reasonLabel: 'For Cooks, Prep Cooks & Kitchen Staff',
    tags: ['Safety', 'Kitchen', 'Training'],
  },

  // ── Industry / SOC Code Based ──
  {
    id: 'rec-harassment',
    name: 'Anti-Harassment & Discrimination Policy',
    category: 'signing',
    type: 'Company Policy',
    trackingMode: 'progress',
    description: 'Policy prohibiting harassment and discrimination. Includes reporting procedures. Required for food service industry (SOC 35-xxxx).',
    completedBy: 'Employee',
    reason: 'industry',
    reasonLabel: 'Food Service (SOC 35-1012, 35-2014)',
    tags: ['Policy', 'HR', 'Compliance'],
  },
  {
    id: 'rec-osha',
    name: 'OSHA Workplace Safety Acknowledgment',
    category: 'signing',
    type: 'Safety',
    trackingMode: 'progress',
    description: 'Acknowledgment of OSHA workplace safety standards including hazard communication, PPE, and emergency procedures.',
    completedBy: 'Employee',
    reason: 'industry',
    reasonLabel: 'Food Service (SOC 35-2014, 35-2021)',
    tags: ['Safety', 'OSHA', 'Compliance'],
  },
  {
    id: 'rec-food-allergen',
    name: 'Food Allergen Awareness Training',
    category: 'custom-form',
    type: 'Safety',
    trackingMode: 'progress',
    description: 'Training on major food allergens, cross-contamination prevention, and guest allergen inquiry protocols.',
    completedBy: 'Employee',
    reason: 'industry',
    reasonLabel: 'Food Service (SOC 35-2014, 35-3031)',
    tags: ['Safety', 'Food', 'Training'],
  },
  {
    id: 'rec-hygiene',
    name: 'Personal Hygiene & Grooming Standards',
    category: 'signing',
    type: 'Company Policy',
    trackingMode: 'progress',
    description: 'Standards for personal hygiene, handwashing, glove use, and grooming requirements in food handling environments.',
    completedBy: 'Employee',
    reason: 'industry',
    reasonLabel: 'Food Service (SOC 35-2014, 35-3031)',
    tags: ['Policy', 'Hygiene', 'Food Safety'],
  },

  // ── Gap Analysis / Missing Documents ──
  {
    id: 'rec-emergency-contact',
    name: 'Emergency Contact Form',
    category: 'custom-form',
    type: 'Onboarding',
    trackingMode: 'progress',
    description: 'Collects emergency contact information including name, relationship, and phone number for workplace emergencies.',
    completedBy: 'Employee',
    reason: 'gap',
    reasonLabel: 'Commonly missing from your templates',
    tags: ['HR', 'Safety', 'Onboarding'],
  },
  {
    id: 'rec-at-will',
    name: 'At-Will Employment Agreement',
    category: 'signing',
    type: 'Onboarding',
    trackingMode: 'progress',
    description: 'Establishes the at-will nature of employment, clarifying that either party may terminate the relationship at any time.',
    completedBy: 'Both',
    reason: 'gap',
    reasonLabel: 'Commonly missing from your templates',
    tags: ['Legal', 'Onboarding', 'Compliance'],
  },
  {
    id: 'rec-uniform',
    name: 'Uniform & Appearance Policy',
    category: 'signing',
    type: 'Company Policy',
    trackingMode: 'progress',
    description: 'Guidelines for dress code, uniform maintenance, name badges, and personal appearance standards.',
    completedBy: 'Employee',
    reason: 'gap',
    reasonLabel: 'Commonly missing from your templates',
    tags: ['Policy', 'Uniform', 'Appearance'],
  },
  {
    id: 'rec-bgcheck',
    name: 'Background Check Authorization',
    category: 'signing',
    type: 'Onboarding',
    trackingMode: 'progress',
    description: 'Employee authorization for criminal background check and reference verification as part of the hiring process.',
    completedBy: 'Employee',
    reason: 'gap',
    reasonLabel: 'Commonly missing from your templates',
    tags: ['HR', 'Onboarding', 'Legal'],
  },
  {
    id: 'rec-nda',
    name: 'Non-Disclosure Agreement (NDA)',
    category: 'signing',
    type: 'Onboarding',
    trackingMode: 'progress',
    description: 'Protects proprietary business information including recipes, procedures, customer data, and trade secrets.',
    completedBy: 'Employee',
    reason: 'gap',
    reasonLabel: 'Commonly missing from your templates',
    tags: ['Legal', 'Confidentiality', 'Onboarding'],
  },
]

// ─── Reason metadata ─────────────────────────────────────────────────

const REASON_CONFIG: Record<RecommendationReason, { label: string; icon: React.ReactNode; color: string; description: string }> = {
  state: {
    label: 'Based on your locations',
    icon: <MapPin className="w-4 h-4" />,
    color: 'text-blue-600 bg-blue-50 border-blue-100',
    description: 'Required or recommended based on the states where you operate',
  },
  'job-title': {
    label: 'Based on job titles',
    icon: <Briefcase className="w-4 h-4" />,
    color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    description: 'Recommended for specific roles in your team',
  },
  industry: {
    label: 'Based on your industry',
    icon: <Building2 className="w-4 h-4" />,
    color: 'text-purple-600 bg-purple-50 border-purple-100',
    description: 'Common in the food service industry (SOC 35-xxxx)',
  },
  gap: {
    label: 'Documents you may be missing',
    icon: <AlertCircle className="w-4 h-4" />,
    color: 'text-amber-600 bg-amber-50 border-amber-100',
    description: 'Commonly used documents not yet in your template library',
  },
}

const CATEGORY_ICON: Record<TemplateCategory, React.ReactNode> = {
  signing: <FileSignature className="w-4 h-4" />,
  certification: <Upload className="w-4 h-4" />,
  'custom-form': <ClipboardList className="w-4 h-4" />,
  'write-up': <ClipboardList className="w-4 h-4" />,
}

// ─── Component ───────────────────────────────────────────────────────

export default function RecommendedDocumentsModal({
  isOpen,
  onClose,
  existingTemplates,
  onAddTemplates,
}: RecommendedDocumentsModalProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedSections, setExpandedSections] = useState<Set<RecommendationReason>>(
    new Set(['state', 'job-title', 'industry', 'gap'])
  )
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set())

  // Match existing templates by name (case-insensitive)
  const existingNames = useMemo(
    () => new Set(existingTemplates.map((t) => t.name.toLowerCase())),
    [existingTemplates]
  )

  // Annotate recommendations with "already added" flag
  const annotatedDocs = useMemo(() => {
    return RECOMMENDED_DOCUMENTS.map((doc) => ({
      ...doc,
      alreadyAdded: existingNames.has(doc.name.toLowerCase()) || addedIds.has(doc.id),
    }))
  }, [existingNames, addedIds])

  // Filter by search
  const filteredDocs = useMemo(() => {
    if (!searchQuery) return annotatedDocs
    const q = searchQuery.toLowerCase()
    return annotatedDocs.filter(
      (doc) =>
        doc.name.toLowerCase().includes(q) ||
        doc.description.toLowerCase().includes(q) ||
        doc.tags.some((t) => t.toLowerCase().includes(q)) ||
        doc.reasonLabel.toLowerCase().includes(q)
    )
  }, [annotatedDocs, searchQuery])

  // Group by reason
  const groupedDocs = useMemo(() => {
    const groups: Record<RecommendationReason, typeof filteredDocs> = {
      state: [],
      'job-title': [],
      industry: [],
      gap: [],
    }
    filteredDocs.forEach((doc) => {
      groups[doc.reason].push(doc)
    })
    return groups
  }, [filteredDocs])

  const toggleSection = (reason: RecommendationReason) => {
    setExpandedSections((prev) => {
      const next = new Set(prev)
      if (next.has(reason)) next.delete(reason)
      else next.add(reason)
      return next
    })
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = (reason: RecommendationReason) => {
    const docs = groupedDocs[reason].filter((d) => !d.alreadyAdded)
    const allSelected = docs.every((d) => selectedIds.has(d.id))
    setSelectedIds((prev) => {
      const next = new Set(prev)
      docs.forEach((d) => {
        if (allSelected) next.delete(d.id)
        else next.add(d.id)
      })
      return next
    })
  }

  const handleAdd = () => {
    const now = new Date()
    const dateStr = now.toISOString().split('T')[0]
    const formattedDate = now.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })

    const newTemplates: DocumentTemplate[] = []
    selectedIds.forEach((id) => {
      const doc = RECOMMENDED_DOCUMENTS.find((d) => d.id === id)
      if (!doc) return
      newTemplates.push({
        id: `rec-${Date.now()}-${id}`,
        name: doc.name,
        category: doc.category,
        type: doc.type,
        trackingMode: doc.trackingMode,
        stats: { total: 0, completed: 0, attention: 0 },
        createdAt: dateStr,
        createdAtFormatted: formattedDate,
      })
    })

    if (newTemplates.length > 0) {
      onAddTemplates(newTemplates)
      setAddedIds((prev) => {
        const next = new Set(prev)
        selectedIds.forEach((id) => next.add(id))
        return next
      })
      setSelectedIds(new Set())
    }
  }

  const selectedCount = selectedIds.size
  const availableCount = annotatedDocs.filter((d) => !d.alreadyAdded).length

  const handleClose = () => {
    setSelectedIds(new Set())
    setSearchQuery('')
    setAddedIds(new Set())
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="" size="xl">
      <div className="flex flex-col" style={{ maxHeight: '80vh' }}>
        {/* Header */}
        <div className="pb-4 border-b border-border-light mb-0 flex-shrink-0">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-text-primary">
                Recommended Documents
              </h2>
              <p className="text-sm text-text-secondary">
                Based on your locations, roles, industry, and current templates
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-placeholder" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search recommended documents..."
              className="w-full h-10 pl-10 pr-4 rounded-element border border-border bg-white text-sm text-text-primary placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 py-4 -mx-1 px-1" style={{ maxHeight: '50vh' }}>
          {(['state', 'job-title', 'industry', 'gap'] as RecommendationReason[]).map((reason) => {
            const docs = groupedDocs[reason]
            if (docs.length === 0) return null
            const config = REASON_CONFIG[reason]
            const isExpanded = expandedSections.has(reason)
            const selectableDocs = docs.filter((d) => !d.alreadyAdded)
            const allSelected = selectableDocs.length > 0 && selectableDocs.every((d) => selectedIds.has(d.id))
            const someSelected = selectableDocs.some((d) => selectedIds.has(d.id))

            return (
              <div key={reason} className="mb-4">
                {/* Section Header */}
                <button
                  onClick={() => toggleSection(reason)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${config.color}`}>
                      {config.icon}
                    </div>
                    <div className="text-left">
                      <span className="text-sm font-semibold text-text-primary">{config.label}</span>
                      <span className="text-xs text-text-secondary ml-2">
                        {docs.length} document{docs.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectableDocs.length > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleSelectAll(reason)
                        }}
                        className={`text-xs font-medium px-2 py-1 rounded transition-colors ${
                          allSelected
                            ? 'text-primary-600 bg-primary-50 hover:bg-primary-100'
                            : 'text-text-secondary hover:text-text-primary hover:bg-gray-100'
                        }`}
                      >
                        {allSelected ? 'Deselect all' : 'Select all'}
                      </button>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-text-secondary" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-text-secondary" />
                    )}
                  </div>
                </button>

                {/* Section description */}
                {isExpanded && (
                  <div className="flex items-start gap-2 px-3 py-1.5 mb-2">
                    <Info className="w-3.5 h-3.5 text-text-placeholder mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-text-secondary">{config.description}</p>
                  </div>
                )}

                {/* Document Cards */}
                {isExpanded && (
                  <div className="space-y-2 px-1">
                    {docs.map((doc) => {
                      const isSelected = selectedIds.has(doc.id)
                      const isAdded = doc.alreadyAdded

                      return (
                        <button
                          key={doc.id}
                          onClick={() => !isAdded && toggleSelect(doc.id)}
                          disabled={isAdded}
                          className={`w-full text-left p-4 rounded-lg border transition-all ${
                            isAdded
                              ? 'bg-gray-50 border-border-light opacity-60 cursor-default'
                              : isSelected
                              ? 'bg-primary-50 border-primary-300 ring-1 ring-primary-200'
                              : 'bg-white border-border-light hover:border-primary-300 hover:shadow-sm cursor-pointer'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            {/* Selection indicator */}
                            <div className="mt-0.5 flex-shrink-0">
                              {isAdded ? (
                                <div className="w-5 h-5 rounded bg-green-100 flex items-center justify-center">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                                </div>
                              ) : isSelected ? (
                                <div className="w-5 h-5 rounded bg-primary-500 flex items-center justify-center">
                                  <Check className="w-3 h-3 text-white" />
                                </div>
                              ) : (
                                <div className="w-5 h-5 rounded border-2 border-gray-300" />
                              )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-semibold text-text-primary">
                                  {doc.name}
                                </span>
                                {isAdded && (
                                  <span className="text-[10px] font-medium text-green-700 bg-green-50 px-1.5 py-0.5 rounded-full border border-green-200">
                                    Already added
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-text-secondary leading-relaxed mb-2">
                                {doc.description}
                              </p>
                              <div className="flex items-center gap-3 flex-wrap">
                                <span className="inline-flex items-center gap-1 text-[11px] text-text-secondary bg-gray-100 px-2 py-0.5 rounded-full">
                                  {CATEGORY_ICON[doc.category]}
                                  {doc.category === 'signing'
                                    ? 'PDF Signing'
                                    : doc.category === 'custom-form'
                                    ? 'Custom Form'
                                    : doc.category === 'certification'
                                    ? 'Certification'
                                    : 'Write-up'}
                                </span>
                                <span className="text-[11px] text-text-secondary">
                                  Completed by: <strong>{doc.completedBy}</strong>
                                </span>
                                <span className="text-[11px] text-text-placeholder">
                                  {doc.reasonLabel}
                                </span>
                              </div>
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}

          {filteredDocs.length === 0 && (
            <div className="text-center py-12">
              <Search className="w-8 h-8 text-text-placeholder mx-auto mb-3" />
              <p className="text-sm text-text-secondary">No recommendations match your search</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-border-light flex items-center justify-between flex-shrink-0">
          <div className="text-sm text-text-secondary">
            {selectedCount > 0 ? (
              <span>
                <strong className="text-text-primary">{selectedCount}</strong> document{selectedCount !== 1 ? 's' : ''} selected
              </span>
            ) : (
              <span>{availableCount} document{availableCount !== 1 ? 's' : ''} available to add</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleClose}>
              {addedIds.size > 0 ? 'Done' : 'Cancel'}
            </Button>
            <Button
              variant="primary"
              onClick={handleAdd}
              disabled={selectedCount === 0}
            >
              Add {selectedCount > 0 ? `${selectedCount} ` : ''}Template{selectedCount !== 1 ? 's' : ''}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

