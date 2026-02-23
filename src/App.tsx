import { useState, useCallback } from 'react'
import Sidebar, { AppPage } from './components/layout/Sidebar'
import TopBar from './components/layout/TopBar'
import DocumentsPage from './pages/DocumentsPage'
import DocumentDetailPage from './pages/DocumentDetailPage'
import TeamPage from './pages/TeamPage'
import WriteUpsPage from './pages/WriteUpsPage'
import AssigneeTaskPage from './pages/AssigneeTaskPage'
import AddDocumentModal, { EditingTemplateData } from './components/documents/AddDocumentModal'
import { DocumentCreationType } from './components/documents/DocumentTypeSelector'
import { ToastProvider } from './components/ui/Toast'
import { documentDetails, documentTemplates, DocumentTemplate, DocumentDetail, DocumentRecipient, TemplateCategory } from './data/mockData'

const PAGE_TITLES: Record<AppPage, string> = {
  documents: 'Documents',
  'write-ups': 'Write-ups',
  team: 'Team',
}

interface AssigneeTaskState {
  documentName: string
  documentDescription?: string
  recipient: DocumentRecipient
  category: TemplateCategory
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

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activePage, setActivePage] = useState<AppPage>('documents')
  const [selectedDocument, setSelectedDocument] = useState<DocumentDetail | null>(null)
  const [assigneeTask, setAssigneeTask] = useState<AssigneeTaskState | null>(null)
  const [templates, setTemplates] = useState<DocumentTemplate[]>(() => [...documentTemplates])

  // Edit-from-detail-page state
  const [detailEditModalOpen, setDetailEditModalOpen] = useState(false)
  const [detailEditDocType, setDetailEditDocType] = useState<DocumentCreationType | null>(null)
  const [detailEditTemplate, setDetailEditTemplate] = useState<EditingTemplateData | null>(null)

  const handleAddTemplate = useCallback((template: DocumentTemplate) => {
    setTemplates((prev) => [template, ...prev])
    // Also register a detail entry so clicking into it works
    documentDetails[template.id] = {
      id: template.id,
      name: template.name,
      type: template.type,
      createdAt: template.createdAtFormatted,
      recipients: [],
      assignmentHistory: [],
    }
  }, [])

  const handleArchiveTemplates = useCallback((ids: string[]) => {
    setTemplates((prev) =>
      prev.map((t) => (ids.includes(t.id) ? { ...t, archived: true } : t))
    )
  }, [])

  const handleUnarchiveTemplates = useCallback((ids: string[]) => {
    setTemplates((prev) =>
      prev.map((t) => (ids.includes(t.id) ? { ...t, archived: false } : t))
    )
  }, [])

  const handleDeleteTemplates = useCallback((ids: string[]) => {
    setTemplates((prev) => prev.filter((t) => !ids.includes(t.id)))
    ids.forEach((id) => { delete documentDetails[id] })
  }, [])

  const handleOpenDocument = (documentId: string) => {
    const detail = documentDetails[documentId]
    if (detail) {
      setSelectedDocument(detail)
    } else {
      // Create a placeholder for documents without detailed data
      const template = templates.find((t) => t.id === documentId)
      setSelectedDocument({
        id: documentId,
        name: template?.name || 'Document',
        type: template?.type || 'General',
        createdAt: template?.createdAtFormatted || 'Unknown',
        recipients: [],
        assignmentHistory: [],
      })
    }
  }

  const handleBackToList = () => {
    setSelectedDocument(null)
  }

  const handleNavigate = (page: AppPage) => {
    setActivePage(page)
    setSelectedDocument(null)
    setAssigneeTask(null)
  }

  const handleViewAssigneeTask = (recipient: DocumentRecipient) => {
    if (selectedDocument) {
      const template = templates.find((t) => t.id === selectedDocument.id)
      const category = template?.category || 'signing'
      setAssigneeTask({
        documentName: selectedDocument.name,
        documentDescription:
          category === 'write-up'
            ? undefined
            : `Upload your ${selectedDocument.name} to complete this task.`,
        recipient,
        category,
      })
    }
  }

  const handleBackFromAssigneeTask = () => {
    setAssigneeTask(null)
  }

  const handleEditFromDetail = () => {
    if (!selectedDocument) return
    const template = templates.find((t) => t.id === selectedDocument.id)
    if (!template) return
    setDetailEditTemplate({
      id: template.id,
      name: template.name,
      category: template.category,
      type: template.type,
    })
    setDetailEditDocType(categoryToDocType(template.category))
    setDetailEditModalOpen(true)
  }

  const handleCloseDetailEdit = () => {
    setDetailEditModalOpen(false)
    setDetailEditDocType(null)
    setDetailEditTemplate(null)
  }

  // Determine the top bar title
  const getTitle = () => {
    if (assigneeTask) return 'Assignee Task'
    return PAGE_TITLES[activePage]
  }

  return (
    <ToastProvider>
      <div className="flex h-screen bg-surface-gray">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          activePage={activePage}
          onNavigate={handleNavigate}
        />
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar title={getTitle()} />
          <main className="flex-1 overflow-auto">
            {activePage === 'documents' && (
              assigneeTask ? (
                <AssigneeTaskPage
                  documentName={assigneeTask.documentName}
                  documentDescription={assigneeTask.documentDescription}
                  recipient={assigneeTask.recipient}
                  category={assigneeTask.category}
                  onBack={handleBackFromAssigneeTask}
                />
              ) : selectedDocument ? (
                <DocumentDetailPage
                  document={selectedDocument}
                  documentCategory={templates.find((t) => t.id === selectedDocument.id)?.category}
                  onBack={handleBackToList}
                  onViewAssigneeTask={handleViewAssigneeTask}
                  onEditTemplate={handleEditFromDetail}
                />
              ) : (
                <DocumentsPage
                  templates={templates}
                  onOpenDocument={handleOpenDocument}
                  onAddTemplate={handleAddTemplate}
                  onArchiveTemplates={handleArchiveTemplates}
                  onUnarchiveTemplates={handleUnarchiveTemplates}
                  onDeleteTemplates={handleDeleteTemplates}
                />
              )
            )}
            {activePage === 'write-ups' && (
              <WriteUpsPage />
            )}
            {activePage === 'team' && (
              <TeamPage />
            )}
          </main>
        </div>

        {/* Edit modal triggered from DocumentDetailPage */}
        <AddDocumentModal
          isOpen={detailEditModalOpen}
          onClose={handleCloseDetailEdit}
          documentType={detailEditDocType}
          editingTemplate={detailEditTemplate}
        />
      </div>
    </ToastProvider>
  )
}

export default App
