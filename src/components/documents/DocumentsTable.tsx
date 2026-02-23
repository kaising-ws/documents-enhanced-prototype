import { useState } from 'react'
import {
  FileSignature,
  Shield,
  PenLine,
  ClipboardList,
  Edit,
  Copy,
  Trash2,
  Eye,
  Send,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Archive,
  ArchiveRestore,
  AlertTriangle,
  X,
} from 'lucide-react'
import { DocumentTemplate, TemplateCategory } from '../../data/mockData'
import Button from '../ui/Button'
import Checkbox from '../ui/Checkbox'
import ContextMenu, { ContextMenuItem } from '../ui/ContextMenu'
import { useToast } from '../ui/Toast'

interface DocumentsTableProps {
  documents: DocumentTemplate[]
  onAssign: (doc: DocumentTemplate) => void
  onOpenDocument: (documentId: string) => void
  onEdit?: (doc: DocumentTemplate) => void
  onArchive?: (ids: string[]) => void
  onUnarchive?: (ids: string[]) => void
  onDelete?: (ids: string[]) => void
  /** When true the table is showing archived templates (changes available actions). */
  isArchivedView?: boolean
}

type SortField = 'name' | 'type' | 'status' | 'createdAt'
type SortDirection = 'asc' | 'desc'

/** Get the icon per document category */
function getCategoryIcon(category: TemplateCategory) {
  switch (category) {
    case 'signing':
      return <FileSignature className="w-4 h-4 text-gray-400" />
    case 'certification':
      return <Shield className="w-4 h-4 text-gray-400" />
    case 'write-up':
      return <PenLine className="w-4 h-4 text-gray-400" />
    case 'custom-form':
      return <ClipboardList className="w-4 h-4 text-gray-400" />
  }
}

const categoryLabel: Record<TemplateCategory, string> = {
  signing: 'Signing',
  certification: 'Certification',
  'write-up': 'Write-up',
  'custom-form': 'Custom Form',
}

/** Health dot color: green = nothing needs attention, amber = some need attention, red = expired items */
function getHealthColor(doc: DocumentTemplate): 'green' | 'amber' | 'red' | 'gray' {
  const { stats } = doc
  if (stats.total === 0) return 'gray'
  if ((stats.expired ?? 0) > 0) return 'red'
  if (stats.attention > 0) return 'amber'
  return 'green'
}

const dotColors = {
  green: 'bg-green-500',
  amber: 'bg-amber-500',
  red: 'bg-red-500',
  gray: 'bg-gray-300',
}

/** Get a sortable "attention ratio" for any tracking mode */
function getAttentionRatio(doc: DocumentTemplate): number {
  if (doc.stats.total === 0) return 0
  return doc.stats.attention / doc.stats.total
}

// ── Confirmation modals ─────────────────────────────────────────────

function ArchiveConfirmModal({
  count,
  templateName,
  onConfirm,
  onClose,
}: {
  count?: number
  templateName?: string
  onConfirm: () => void
  onClose: () => void
}) {
  const isBulk = (count ?? 0) > 1
  const label = isBulk
    ? `${count} templates`
    : templateName
    ? `"${templateName}"`
    : '1 template'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-light">
          <h3 className="text-lg font-semibold text-text-primary">Archive template{isBulk ? 's' : ''}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-text-primary">
            Are you sure you want to archive {label}?
          </p>
          <div className="flex items-start gap-2.5 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-blue-800">
              Anyone who still has this document in progress will still be able to complete it. No new assignments can be made from archived templates.
            </p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border-light bg-gray-50">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            leftIcon={<Archive className="w-4 h-4" />}
            onClick={onConfirm}
          >
            Archive
          </Button>
        </div>
      </div>
    </div>
  )
}

function DeleteConfirmModal({
  count,
  templateName,
  onConfirm,
  onClose,
}: {
  count?: number
  templateName?: string
  onConfirm: () => void
  onClose: () => void
}) {
  const isBulk = (count ?? 0) > 1
  const label = isBulk
    ? `${count} archived templates`
    : templateName
    ? `"${templateName}"`
    : '1 template'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-light">
          <h3 className="text-lg font-semibold text-text-primary">Delete template{isBulk ? 's' : ''}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-text-primary">
            Are you sure you want to permanently delete {label}?
          </p>
          <div className="flex items-start gap-2.5 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-red-800">
              This action cannot be undone. All template data will be permanently removed and cannot be recovered.
            </p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border-light bg-gray-50">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            leftIcon={<Trash2 className="w-4 h-4" />}
            onClick={onConfirm}
            className="!bg-red-600 hover:!bg-red-700"
          >
            Delete permanently
          </Button>
        </div>
      </div>
    </div>
  )
}

// ── Main table ──────────────────────────────────────────────────────

export default function DocumentsTable({
  documents,
  onAssign,
  onOpenDocument,
  onEdit,
  onArchive,
  onUnarchive,
  onDelete,
  isArchivedView = false,
}: DocumentsTableProps) {
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [sortField, setSortField] = useState<SortField | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  // Confirmation modal state
  const [archiveTarget, setArchiveTarget] = useState<{ ids: string[]; name?: string } | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ ids: string[]; name?: string } | null>(null)

  const { addToast } = useToast()

  const handleToggleRow = (id: string) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    )
  }

  const handleSelectAll = () => {
    if (selectedRows.length === documents.length) {
      setSelectedRows([])
    } else {
      setSelectedRows(documents.map((d) => d.id))
    }
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 text-gray-400" />
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-primary-500" />
    ) : (
      <ArrowDown className="w-3 h-3 text-primary-500" />
    )
  }

  const sortedDocuments = [...documents].sort((a, b) => {
    if (!sortField) return 0
    const dir = sortDirection === 'asc' ? 1 : -1
    switch (sortField) {
      case 'name':
        return a.name.localeCompare(b.name) * dir
      case 'type':
        return a.type.localeCompare(b.type) * dir
      case 'status':
        return (getAttentionRatio(a) - getAttentionRatio(b)) * dir
      case 'createdAt':
        return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * dir
      default:
        return 0
    }
  })

  // ── Context menu items ──

  const getActiveMenuItems = (doc: DocumentTemplate): ContextMenuItem[] => [
    {
      id: 'view',
      label: 'View details',
      icon: <Eye className="w-4 h-4" />,
      onClick: () => onOpenDocument(doc.id),
    },
    {
      id: 'assign',
      label: 'Assign',
      icon: <Send className="w-4 h-4" />,
      onClick: () => onAssign(doc),
    },
    {
      id: 'edit',
      label: 'Edit',
      icon: <Edit className="w-4 h-4" />,
      onClick: () => onEdit ? onEdit(doc) : addToast(`Editing "${doc.name}"`, 'info'),
    },
    {
      id: 'duplicate',
      label: 'Duplicate',
      icon: <Copy className="w-4 h-4" />,
      onClick: () => addToast(`"${doc.name}" duplicated`, 'success'),
    },
    {
      id: 'archive',
      label: 'Archive',
      icon: <Archive className="w-4 h-4" />,
      onClick: () => setArchiveTarget({ ids: [doc.id], name: doc.name }),
    },
  ]

  const getArchivedMenuItems = (doc: DocumentTemplate): ContextMenuItem[] => [
    {
      id: 'view',
      label: 'View details',
      icon: <Eye className="w-4 h-4" />,
      onClick: () => onOpenDocument(doc.id),
    },
    {
      id: 'unarchive',
      label: 'Unarchive',
      icon: <ArchiveRestore className="w-4 h-4" />,
      onClick: () => {
        onUnarchive?.([doc.id])
        addToast(`"${doc.name}" restored`, 'success')
      },
    },
    {
      id: 'delete',
      label: 'Delete permanently',
      icon: <Trash2 className="w-4 h-4" />,
      variant: 'danger',
      onClick: () => setDeleteTarget({ ids: [doc.id], name: doc.name }),
    },
  ]

  /** Single-line status text — attention / total assigned */
  function getStatusText(doc: DocumentTemplate): string {
    const { stats } = doc
    if (stats.total === 0) return '\u2014'
    return `${stats.attention} / ${stats.total}`
  }

  // ── Bulk action handlers ──

  const handleBulkArchive = () => {
    setArchiveTarget({ ids: [...selectedRows] })
  }

  const handleBulkDelete = () => {
    setDeleteTarget({ ids: [...selectedRows] })
  }

  const handleBulkUnarchive = () => {
    onUnarchive?.(selectedRows)
    addToast(`${selectedRows.length} template(s) restored`, 'success')
    setSelectedRows([])
  }

  return (
    <div className="relative">
      {/* Archive confirmation modal */}
      {archiveTarget && (
        <ArchiveConfirmModal
          count={archiveTarget.ids.length}
          templateName={archiveTarget.name}
          onConfirm={() => {
            onArchive?.(archiveTarget.ids)
            addToast(
              archiveTarget.ids.length === 1 && archiveTarget.name
                ? `"${archiveTarget.name}" archived`
                : `${archiveTarget.ids.length} template(s) archived`,
              'success'
            )
            setArchiveTarget(null)
            setSelectedRows((prev) => prev.filter((id) => !archiveTarget.ids.includes(id)))
          }}
          onClose={() => setArchiveTarget(null)}
        />
      )}

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <DeleteConfirmModal
          count={deleteTarget.ids.length}
          templateName={deleteTarget.name}
          onConfirm={() => {
            onDelete?.(deleteTarget.ids)
            addToast(
              deleteTarget.ids.length === 1 && deleteTarget.name
                ? `"${deleteTarget.name}" deleted permanently`
                : `${deleteTarget.ids.length} template(s) deleted permanently`,
              'success'
            )
            setDeleteTarget(null)
            setSelectedRows((prev) => prev.filter((id) => !deleteTarget.ids.includes(id)))
          }}
          onClose={() => setDeleteTarget(null)}
        />
      )}

      {/* Floating bulk action bar */}
      {selectedRows.length > 0 && (
        <div className="sticky top-0 z-10 bg-primary-500 text-white rounded-container px-4 py-3 mb-3 flex items-center justify-between shadow-lg">
          <span className="text-sm font-medium">
            {selectedRows.length} selected
          </span>
          <div className="flex items-center gap-2">
            {isArchivedView ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                  onClick={handleBulkUnarchive}
                >
                  Unarchive
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                  onClick={handleBulkDelete}
                >
                  Delete
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                  onClick={() => {
                    addToast(`Reminders sent for ${selectedRows.length} document(s)`, 'success')
                    setSelectedRows([])
                  }}
                >
                  Send Reminders
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                  onClick={handleBulkArchive}
                >
                  Archive
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
              onClick={() => setSelectedRows([])}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-container border border-border-light overflow-visible">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border-light bg-gray-50/80">
              <th className="h-10 px-4 w-11">
                <Checkbox
                  checked={selectedRows.length === documents.length && documents.length > 0}
                  onChange={handleSelectAll}
                />
              </th>
              <th className="h-10 px-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                <button
                  onClick={() => handleSort('name')}
                  className="flex items-center gap-1 hover:text-text-primary transition-colors"
                >
                  Template {getSortIcon('name')}
                </button>
              </th>
              <th className="h-10 px-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider w-[140px]">
                <button
                  onClick={() => handleSort('type')}
                  className="flex items-center gap-1 hover:text-text-primary transition-colors"
                >
                  Type {getSortIcon('type')}
                </button>
              </th>
              <th className="h-10 px-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider w-[110px]">
                <button
                  onClick={() => handleSort('status')}
                  className="flex items-center gap-1 hover:text-text-primary transition-colors"
                >
                  Status {getSortIcon('status')}
                </button>
              </th>
              <th className="h-10 px-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider w-[120px]">
                <button
                  onClick={() => handleSort('createdAt')}
                  className="flex items-center gap-1 hover:text-text-primary transition-colors"
                >
                  Created {getSortIcon('createdAt')}
                </button>
              </th>
              <th className="h-10 px-4 w-11" />
            </tr>
          </thead>
          <tbody>
            {sortedDocuments.map((doc) => {
              const health = getHealthColor(doc)
              return (
                <tr
                  key={doc.id}
                  onClick={() => onOpenDocument(doc.id)}
                  className={`border-b border-border-light last:border-b-0 cursor-pointer transition-colors ${
                    selectedRows.includes(doc.id)
                      ? 'bg-primary-50 hover:bg-primary-50'
                      : 'hover:bg-gray-50/60'
                  }`}
                >
                  <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedRows.includes(doc.id)}
                      onChange={() => handleToggleRow(doc.id)}
                    />
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isArchivedView ? 'bg-gray-100' : 'bg-gray-50'}`}>
                        {getCategoryIcon(doc.category)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm font-medium truncate leading-5 ${isArchivedView ? 'text-text-secondary' : 'text-text-primary'}`}>
                          {doc.name}
                        </p>
                        <p className="text-xs text-text-secondary/70 leading-4">
                          {categoryLabel[doc.category]}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-sm text-text-secondary">
                      {doc.type}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    {isArchivedView ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium text-gray-500 bg-gray-100">
                        <Archive className="w-3 h-3" />
                        Archived
                      </span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColors[health]}`} />
                        <span className="text-sm text-text-primary tabular-nums">
                          {getStatusText(doc)}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-sm text-text-secondary">{doc.createdAtFormatted}</span>
                  </td>
                  <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                    <ContextMenu items={isArchivedView ? getArchivedMenuItems(doc) : getActiveMenuItems(doc)} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
