import { useState } from 'react'
import Sidebar, { AppPage } from './components/layout/Sidebar'
import TopBar from './components/layout/TopBar'
import DocumentsPage from './pages/DocumentsPage'
import DocumentDetailPage from './pages/DocumentDetailPage'
import TeamPage from './pages/TeamPage'
import WriteUpsPage from './pages/WriteUpsPage'
import AssigneeTaskPage from './pages/AssigneeTaskPage'
import { ToastProvider } from './components/ui/Toast'
import { documentDetails, documentTemplates, DocumentDetail, DocumentRecipient, TemplateCategory } from './data/mockData'

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

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activePage, setActivePage] = useState<AppPage>('documents')
  const [selectedDocument, setSelectedDocument] = useState<DocumentDetail | null>(null)
  const [assigneeTask, setAssigneeTask] = useState<AssigneeTaskState | null>(null)

  const handleOpenDocument = (documentId: string) => {
    const detail = documentDetails[documentId]
    if (detail) {
      setSelectedDocument(detail)
    } else {
      // Create a placeholder for documents without detailed data
      const template = documentTemplates.find((t) => t.id === documentId)
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
      const template = documentTemplates.find((t) => t.id === selectedDocument.id)
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
                  documentCategory={documentTemplates.find((t) => t.id === selectedDocument.id)?.category}
                  onBack={handleBackToList}
                  onViewAssigneeTask={handleViewAssigneeTask}
                />
              ) : (
                <DocumentsPage onOpenDocument={handleOpenDocument} />
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
      </div>
    </ToastProvider>
  )
}

export default App
