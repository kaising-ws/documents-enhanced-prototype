import { useMemo, useState } from 'react'
import { Plus, AlertTriangle, Eye, FileCheck, Archive } from 'lucide-react'
import SearchBox from '../components/ui/SearchBox'
import Button from '../components/ui/Button'
import DocumentsTable from '../components/documents/DocumentsTable'
import DocumentTypeSelector, { DocumentCreationType } from '../components/documents/DocumentTypeSelector'
import AddDocumentModal, { EditingTemplateData } from '../components/documents/AddDocumentModal'
import AssignDocumentModal from '../components/documents/AssignDocumentModal'
import RecommendedDocumentsModal from '../components/documents/RecommendedDocumentsModal'
import { useToast } from '../components/ui/Toast'
import { documentDetails, DocumentTemplate, TemplateCategory } from '../data/mockData'

interface DocumentsPageProps {
  templates: DocumentTemplate[]
  onOpenDocument: (documentId: string) => void
  onAddTemplate: (template: DocumentTemplate) => void
  onArchiveTemplates: (ids: string[]) => void
  onUnarchiveTemplates: (ids: string[]) => void
  onDeleteTemplates: (ids: string[]) => void
  /** When set, lock the page to a single category (hides category tabs). */
  lockedCategory?: TemplateCategory
}

/** Map a template category to the corresponding document creation type */
function categoryToDocType(category: TemplateCategory): DocumentCreationType {
  switch (category) {
    case 'signing':
      return 'pdf-signing'
    case 'write-up':
      return 'write-up'
    case 'certification':
      return 'collect-uploads'
    case 'custom-form':
      return 'custom-form'
  }
}

/** Category tabs — "All" plus one per category (excluding write-ups, which have their own page) */
const CATEGORY_TABS: { id: TemplateCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'signing', label: 'Signing' },
  { id: 'certification', label: 'Certifications' },
  { id: 'custom-form', label: 'Custom Forms' },
]

export default function DocumentsPage({ templates: documentTemplates, onOpenDocument, onAddTemplate, onArchiveTemplates, onUnarchiveTemplates, onDeleteTemplates, lockedCategory }: DocumentsPageProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<TemplateCategory | 'all'>('all')
  const [showArchived, setShowArchived] = useState(false)
  const [isTypeSelectorOpen, setIsTypeSelectorOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedDocType, setSelectedDocType] = useState<DocumentCreationType | null>(null)
  const [isAssignDocModalOpen, setIsAssignDocModalOpen] = useState(false)
  const [assignDocumentTemplate, setAssignDocumentTemplate] = useState<DocumentTemplate | null>(null)
  const [isRecommendedModalOpen, setIsRecommendedModalOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<EditingTemplateData | null>(null)

  const { addToast } = useToast()

  const handleAssign = (doc: DocumentTemplate) => {
    setAssignDocumentTemplate(doc)
    setIsAssignDocModalOpen(true)
  }

  const handleEdit = (doc: DocumentTemplate) => {
    setEditingTemplate({
      id: doc.id,
      name: doc.name,
      category: doc.category,
      type: doc.type,
    })
    setSelectedDocType(categoryToDocType(doc.category))
    setIsAddModalOpen(true)
  }

  const handleAddClick = () => {
    setIsTypeSelectorOpen(true)
  }

  const handleTypeSelect = (type: DocumentCreationType) => {
    setIsTypeSelectorOpen(false)
    if (type === 'recommended') {
      setIsRecommendedModalOpen(true)
      return
    }
    setSelectedDocType(type)
    setIsAddModalOpen(true)
  }

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false)
    setSelectedDocType(null)
    setEditingTemplate(null)
  }

  // The effective category: either locked from props, or user-selected from tabs
  const effectiveCategory = lockedCategory ?? activeCategory

  // Base templates (when locked to a category, only show that category's templates)
  const baseTemplates = lockedCategory
    ? documentTemplates.filter((t) => t.category === lockedCategory)
    : documentTemplates

  // Count templates per category (for tab badges) — exclude write-ups and archived
  const categoryCounts = useMemo(() => {
    const active = documentTemplates.filter((t) => t.category !== 'write-up' && !t.archived)
    const counts: Record<string, number> = { all: active.length }
    for (const cat of ['signing', 'certification', 'custom-form'] as TemplateCategory[]) {
      counts[cat] = active.filter((t) => t.category === cat).length
    }
    return counts
  }, [documentTemplates])

  // Count archived templates (excluding write-ups)
  const archivedCount = useMemo(
    () => documentTemplates.filter((t) => t.archived && t.category !== 'write-up').length,
    [documentTemplates]
  )

  // Filter documents — search matches name AND type
  const filteredDocuments = baseTemplates.filter((doc) => {
    const q = searchQuery.toLowerCase()
    const matchesSearch = !q || doc.name.toLowerCase().includes(q) || doc.type.toLowerCase().includes(q)
    const matchesCategory = lockedCategory || effectiveCategory === 'all' || doc.category === effectiveCategory
    // When not locked, exclude write-ups from the Documents page (they have their own page)
    const notWriteUp = lockedCategory ? true : doc.category !== 'write-up'
    // Archive filter: show only archived when toggled, or only active when not
    const matchesArchive = showArchived ? !!doc.archived : !doc.archived
    return matchesSearch && matchesCategory && notWriteUp && matchesArchive
  })

  // ── Analytics ──
  const analytics = useMemo(() => {
    const scopedTemplates = lockedCategory
      ? documentTemplates.filter((t) => t.category === lockedCategory && !t.archived)
      : documentTemplates.filter((t) => t.category !== 'write-up' && !t.archived)
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
  }, [lockedCategory, documentTemplates])

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
        <div className="flex items-center gap-3">
          <SearchBox
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by name or type..."
            className="w-72"
          />
          {archivedCount > 0 && (
            <button
              onClick={() => setShowArchived(!showArchived)}
              className={`flex items-center gap-1.5 h-9 px-3 rounded-full border text-xs font-medium transition-colors ${
                showArchived
                  ? 'bg-primary-50 border-primary-300 text-primary-700'
                  : 'bg-white border-border text-text-secondary hover:border-gray-400'
              }`}
            >
              <Archive className="w-3.5 h-3.5" />
              Archived
              <span className="tabular-nums">{archivedCount}</span>
            </button>
          )}
        </div>

        {!showArchived && (
          <Button
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={handleAddClick}
          >
            Add Template
          </Button>
        )}
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
        onEdit={handleEdit}
        onArchive={onArchiveTemplates}
        onUnarchive={onUnarchiveTemplates}
        onDelete={onDeleteTemplates}
        isArchivedView={showArchived}
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

      {/* Add / Edit Document Modal */}
      <AddDocumentModal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        documentType={selectedDocType}
        onCreateTemplate={onAddTemplate}
        editingTemplate={editingTemplate}
      />

      {/* Recommended Documents Modal */}
      <RecommendedDocumentsModal
        isOpen={isRecommendedModalOpen}
        onClose={() => setIsRecommendedModalOpen(false)}
        existingTemplates={documentTemplates}
        onAddTemplates={(templates) => {
          templates.forEach((t) => onAddTemplate(t))
          addToast(`Added ${templates.length} recommended template${templates.length !== 1 ? 's' : ''}`, 'success')
        }}
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
