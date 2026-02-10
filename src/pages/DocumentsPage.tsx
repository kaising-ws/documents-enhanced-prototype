import { useMemo, useState } from 'react'
import { Plus, Filter, LayoutGrid, Users, AlertTriangle, Eye, FileCheck } from 'lucide-react'
import SearchBox from '../components/ui/SearchBox'
import Button from '../components/ui/Button'
import Dropdown from '../components/ui/Dropdown'
import DocumentsTable from '../components/documents/DocumentsTable'
import MembersTable from '../components/documents/MembersTable'
import DocumentTypeSelector, { DocumentCreationType } from '../components/documents/DocumentTypeSelector'
import AddDocumentModal from '../components/documents/AddDocumentModal'
import AssignDocumentModal from '../components/documents/AssignDocumentModal'
import { useToast } from '../components/ui/Toast'
import { documentTemplates, documentDetails, teamMembers, DocumentTemplate } from '../data/mockData'

interface DocumentsPageProps {
  onOpenDocument: (documentId: string) => void
}

const filterOptions = [
  { id: 'all', label: 'All Types' },
  { id: 'payroll', label: 'Payroll' },
  { id: 'onboarding', label: 'Onboarding' },
  { id: 'certifications', label: 'Certifications' },
  { id: 'write-ups', label: 'Write-ups' },
]

export default function DocumentsPage({ onOpenDocument }: DocumentsPageProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [isTypeSelectorOpen, setIsTypeSelectorOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedDocType, setSelectedDocType] = useState<DocumentCreationType | null>(null)
  const [subView, setSubView] = useState<'templates' | 'members'>('templates')
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

  // Filter documents
  const filteredDocuments = documentTemplates.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filter === 'all' || doc.type.toLowerCase() === filter
    return matchesSearch && matchesFilter
  })

  // Filter members
  const filteredMembers = teamMembers.filter((member) =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // ── Analytics ──
  const analytics = useMemo(() => {
    const totalAttention = documentTemplates.reduce((sum, t) => sum + t.stats.attention, 0)
    const totalAssigned = documentTemplates.reduce((sum, t) => sum + t.stats.total, 0)

    let pendingYourReview = 0
    Object.values(documentDetails).forEach((detail) => {
      detail.recipients.forEach((r) => {
        if (r.status === 'pending_verification') pendingYourReview++
      })
    })

    const templatesWithIssues = documentTemplates.filter((t) => t.stats.attention > 0).length

    return { totalAttention, totalAssigned, pendingYourReview, templatesWithIssues }
  }, [])

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      {/* ─── Analytics Banner ─── */}
      {subView === 'templates' && (
        <div className="grid grid-cols-3 gap-4 mb-5">
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
                total assigned across {documentTemplates.length} templates
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ─── Toolbar ─── */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Sub-view toggle */}
          <div className="inline-flex rounded-element border border-border-light overflow-hidden mr-3">
            <button
              onClick={() => setSubView('templates')}
              className={`h-9 px-3 text-sm font-medium transition-all flex items-center gap-1.5 ${
                subView === 'templates'
                  ? 'bg-nav text-white'
                  : 'bg-white text-text-primary hover:bg-gray-50'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Templates
            </button>
            <button
              onClick={() => setSubView('members')}
              className={`h-9 px-3 text-sm font-medium transition-all flex items-center gap-1.5 border-l border-border-light ${
                subView === 'members'
                  ? 'bg-nav text-white'
                  : 'bg-white text-text-primary hover:bg-gray-50'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Members
            </button>
          </div>

          {subView === 'templates' && (
            <Dropdown
              options={filterOptions}
              value={filter}
              onChange={setFilter}
              className="w-48"
            />
          )}
          <SearchBox
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={subView === 'templates' ? 'Search templates...' : 'Search members...'}
            className="w-72"
          />
        </div>

        <div className="flex items-center gap-2">
          {subView === 'templates' && (
            <>
              <Button variant="ghost" leftIcon={<Filter className="w-4 h-4" />}>
                More filters
              </Button>
              <Button
                variant="primary"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={handleAddClick}
              >
                Add Template
              </Button>
            </>
          )}
        </div>
      </div>

      {/* ─── Content ─── */}
      {subView === 'templates' && (
        <DocumentsTable
          documents={filteredDocuments}
          onAssign={handleAssign}
          onOpenDocument={onOpenDocument}
        />
      )}
      {subView === 'members' && (
        <MembersTable members={filteredMembers} />
      )}

      {/* Pagination */}
      {subView === 'templates' && (
        <div className="flex items-center justify-between mt-4 px-4">
          <span className="text-sm text-text-secondary">
            Showing {filteredDocuments.length} of {documentTemplates.length} templates
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
      )}

      {/* Document Type Selector Modal */}
      <DocumentTypeSelector
        isOpen={isTypeSelectorOpen}
        onClose={() => setIsTypeSelectorOpen(false)}
        onSelect={handleTypeSelect}
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
