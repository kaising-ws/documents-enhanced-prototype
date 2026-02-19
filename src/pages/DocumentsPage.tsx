import { useMemo, useState } from 'react'
import { Plus, AlertTriangle, Eye, FileCheck } from 'lucide-react'
import SearchBox from '../components/ui/SearchBox'
import Button from '../components/ui/Button'
import DocumentsTable from '../components/documents/DocumentsTable'
import DocumentTypeSelector, { DocumentCreationType } from '../components/documents/DocumentTypeSelector'
import AddDocumentModal from '../components/documents/AddDocumentModal'
import AssignDocumentModal from '../components/documents/AssignDocumentModal'
import { useToast } from '../components/ui/Toast'
import { documentTemplates, documentDetails, DocumentTemplate, TemplateCategory } from '../data/mockData'

interface DocumentsPageProps {
  onOpenDocument: (documentId: string) => void
  /** When set, lock the page to a single category (hides category tabs). */
  lockedCategory?: TemplateCategory
}

/** Category tabs — "All" plus one per category (excluding write-ups, which have their own page) */
const CATEGORY_TABS: { id: TemplateCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'signing', label: 'Signing' },
  { id: 'certification', label: 'Certifications' },
  { id: 'custom-form', label: 'Custom Forms' },
]

export default function DocumentsPage({ onOpenDocument, lockedCategory }: DocumentsPageProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<TemplateCategory | 'all'>('all')
  const [isTypeSelectorOpen, setIsTypeSelectorOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedDocType, setSelectedDocType] = useState<DocumentCreationType | null>(null)
  const [isAssignDocModalOpen, setIsAssignDocModalOpen] = useState(false)
  const [assignDocumentTemplate, setAssignDocumentTemplate] = useState<DocumentTemplate | null>(null)

  const { addToast } = useToast()

  const handleAssign = (doc: DocumentTemplate) => {
    setAssignDocumentTemplate(doc)
    setIsAssignDocModalOpen(true)
  }

  const handleAddClick = () => {
    setIsTypeSelectorOpen(true)
  }

  const handleTypeSelect = (type: DocumentCreationType) => {
    setSelectedDocType(type)
    setIsTypeSelectorOpen(false)
    setIsAddModalOpen(true)
  }

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false)
    setSelectedDocType(null)
  }

  // The effective category: either locked from props, or user-selected from tabs
  const effectiveCategory = lockedCategory ?? activeCategory

  // Base templates (when locked to a category, only show that category's templates)
  const baseTemplates = lockedCategory
    ? documentTemplates.filter((t) => t.category === lockedCategory)
    : documentTemplates

  // Count templates per category (for tab badges) — exclude write-ups since they have their own page
  const categoryCounts = useMemo(() => {
    const nonWriteUp = documentTemplates.filter((t) => t.category !== 'write-up')
    const counts: Record<string, number> = { all: nonWriteUp.length }
    for (const cat of ['signing', 'certification', 'custom-form'] as TemplateCategory[]) {
      counts[cat] = nonWriteUp.filter((t) => t.category === cat).length
    }
    return counts
  }, [])

  // Filter documents — search matches name AND type
  const filteredDocuments = baseTemplates.filter((doc) => {
    const q = searchQuery.toLowerCase()
    const matchesSearch = !q || doc.name.toLowerCase().includes(q) || doc.type.toLowerCase().includes(q)
    const matchesCategory = lockedCategory || effectiveCategory === 'all' || doc.category === effectiveCategory
    // When not locked, exclude write-ups from the Documents page (they have their own page)
    const notWriteUp = lockedCategory ? true : doc.category !== 'write-up'
    return matchesSearch && matchesCategory && notWriteUp
  })

  // ── Analytics ──
  const analytics = useMemo(() => {
    const scopedTemplates = lockedCategory
      ? documentTemplates.filter((t) => t.category === lockedCategory)
      : documentTemplates.filter((t) => t.category !== 'write-up')
    const totalAttention = scopedTemplates.reduce((sum, t) => sum + t.stats.attention, 0)
    const totalAssigned = scopedTemplates.reduce((sum, t) => sum + t.stats.total, 0)

    let pendingYourReview = 0
    const scopedIds = new Set(scopedTemplates.map((t) => t.id))
    Object.entries(documentDetails).forEach(([id, detail]) => {
      if (scopedIds.has(id)) {
        detail.recipients.forEach((r) => {
          if (r.status === 'pending_verification') pendingYourReview++
        })
      }
    })

    const templatesWithIssues = scopedTemplates.filter((t) => t.stats.attention > 0).length

    return { totalAttention, totalAssigned, pendingYourReview, templatesWithIssues, templateCount: scopedTemplates.length }
  }, [lockedCategory])

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      {/* ─── Analytics Banner ─── */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-container border border-border-light p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-text-primary">{analytics.totalAttention}</p>
            <p className="text-xs text-text-secondary">
              assignees need attention across {analytics.templatesWithIssues} template{analytics.templatesWithIssues !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-container border border-border-light p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
            <Eye className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-text-primary">{analytics.pendingYourReview}</p>
            <p className="text-xs text-text-secondary">
              submissions pending your review
            </p>
          </div>
        </div>
        <div className="bg-white rounded-container border border-border-light p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
            <FileCheck className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-text-primary">{analytics.totalAssigned}</p>
            <p className="text-xs text-text-secondary">
              total assigned across {analytics.templateCount} template{analytics.templateCount !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* ─── Toolbar ─── */}
      <div className="flex items-center justify-between mb-1">
        <SearchBox
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by name or type..."
          className="w-72"
        />

        <Button
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={handleAddClick}
        >
          Add Template
        </Button>
      </div>

      {/* ─── Category Tabs (hidden when page is locked to a category) ─── */}
      {!lockedCategory && (
        <div className="flex items-center gap-1 border-b border-border-light mb-4">
          {CATEGORY_TABS.map((tab) => {
            const isActive = activeCategory === tab.id
            const count = categoryCounts[tab.id] ?? 0
            return (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                className={`relative px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? 'text-text-primary'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {tab.label}
                <span className={`ml-1.5 text-xs tabular-nums ${isActive ? 'text-text-secondary' : 'text-text-secondary/60'}`}>
                  {count}
                </span>
                {/* Active indicator bar */}
                {isActive && (
                  <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-primary-500 rounded-full" />
                )}
              </button>
            )
          })}
        </div>
      )}

      {/* ─── Content ─── */}
      <DocumentsTable
        documents={filteredDocuments}
        onAssign={handleAssign}
        onOpenDocument={onOpenDocument}
      />

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 px-4">
        <span className="text-sm text-text-secondary">
          Showing {filteredDocuments.length} of {baseTemplates.length} template{baseTemplates.length !== 1 ? 's' : ''}
        </span>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button variant="outline" size="sm">
            Next
          </Button>
        </div>
      </div>

      {/* Document Type Selector Modal */}
      <DocumentTypeSelector
        isOpen={isTypeSelectorOpen}
        onClose={() => setIsTypeSelectorOpen(false)}
        onSelect={handleTypeSelect}
        excludeTypes={['write-up']}
      />

      {/* Add Document Modal */}
      <AddDocumentModal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        documentType={selectedDocType}
      />

      {/* Assign Document Modal */}
      <AssignDocumentModal
        isOpen={isAssignDocModalOpen}
        onClose={() => {
          setIsAssignDocModalOpen(false)
          setAssignDocumentTemplate(null)
        }}
        document={assignDocumentTemplate}
        onAssign={(assignment) => {
          console.log('Document assigned:', assignment)
          setIsAssignDocModalOpen(false)
          setAssignDocumentTemplate(null)
          addToast(`Document assigned to ${assignment.recipientIds.length} recipient(s)`, 'success')
        }}
      />
    </div>
  )
}
