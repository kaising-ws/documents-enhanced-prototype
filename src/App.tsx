import { useState } from 'react'
import Sidebar from './components/layout/Sidebar'
import TopBar from './components/layout/TopBar'
import DocumentsPage from './pages/DocumentsPage'
import DocumentDetailPage from './pages/DocumentDetailPage'
import { ToastProvider } from './components/ui/Toast'
import { documentDetails, documentTemplates, DocumentDetail } from './data/mockData'

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<DocumentDetail | null>(null)

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

  return (
    <ToastProvider>
      <div className="flex h-screen bg-surface-gray">
        <Sidebar 
          collapsed={sidebarCollapsed} 
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
        />
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar title="Documents" />
          <main className="flex-1 overflow-auto">
            {selectedDocument ? (
              <DocumentDetailPage
                document={selectedDocument}
                onBack={handleBackToList}
              />
            ) : (
              <DocumentsPage onOpenDocument={handleOpenDocument} />
            )}
          </main>
        </div>
      </div>
    </ToastProvider>
  )
}

export default App
