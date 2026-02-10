import { useState } from 'react'
import {
  ArrowLeft,
  FileText,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  Bell,
  Download,
  Send,
  Eye,
  UserX,
  X,
  Check,
  RotateCcw,
  ImageIcon,
  Calendar,
} from 'lucide-react'
import SegmentedControl from '../components/ui/SegmentedControl'
import SearchBox from '../components/ui/SearchBox'
import Button from '../components/ui/Button'
import Checkbox from '../components/ui/Checkbox'
import ContextMenu, { ContextMenuItem } from '../components/ui/ContextMenu'
import { useToast } from '../components/ui/Toast'
import { DocumentDetail, AssignmentInstance, DocumentRecipient } from '../data/mockData'

interface DocumentDetailPageProps {
  document: DocumentDetail
  onBack: () => void
}

const tabs = [
  { id: 'status', label: 'Status' },
  { id: 'history', label: 'History' },
]

export default function DocumentDetailPage({ document, onBack }: DocumentDetailPageProps) {
  const [activeTab, setActiveTab] = useState('status')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedGroups, setExpandedGroups] = useState<string[]>(
    document.assignmentHistory?.map((a) => a.id) || []
  )
  const { addToast } = useToast()

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId]
    )
  }

  // Filter and split recipients
  const filterRecipients = (recipients: DocumentRecipient[]) => {
    return recipients.filter(
      (r) =>
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.role.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  const filteredRecipients = filterRecipients(document.recipients)

  // Summary stats
  const totalAssigned = document.recipients.length
  const totalCompleted = document.recipients.filter((r) => r.status === 'completed' && !r.expiryDate).length
  const totalNeedsAttention = document.recipients.filter(
    (r) => r.status !== 'completed' || r.expiryDate
  ).length

  // Split for status tab
  const trueCompleted = filteredRecipients.filter(
    (r) => r.status === 'completed' && !r.expiryDate
  )
  const attention = filteredRecipients.filter(
    (r) => r.status !== 'completed' || r.expiryDate
  )

  return (
    <div className="p-10 max-w-[1200px] mx-auto">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary mb-4 -ml-1"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Documents
      </button>

      {/* Object Header */}
      <div className="bg-white rounded-container border border-border-light p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-gray-500" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-text-primary">{document.name}</h1>
              <p className="text-sm text-text-secondary">
                Created: {document.createdAt}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="primary"
              leftIcon={<Send className="w-4 h-4" />}
              onClick={() => addToast('Opening assign dialog...', 'info')}
            >
              Assign
            </Button>
            <Button variant="outline" leftIcon={<Eye className="w-4 h-4" />}>
              Preview
            </Button>
            <ContextMenu
              items={[
                {
                  id: 'edit',
                  label: 'Edit Template',
                  icon: <FileText className="w-4 h-4" />,
                  onClick: () => addToast('Editing template...', 'info'),
                },
                {
                  id: 'download',
                  label: 'Download All',
                  icon: <Download className="w-4 h-4" />,
                  onClick: () => addToast('Downloading all documents...', 'info'),
                },
                {
                  id: 'remind-all',
                  label: 'Remind All Pending',
                  icon: <Bell className="w-4 h-4" />,
                  onClick: () => addToast('Reminders sent to all pending recipients', 'success'),
                },
              ]}
            />
          </div>
        </div>

        {/* Summary stats row */}
        <div className="flex items-center gap-6 mt-4 pt-4 border-t border-border-light">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-text-primary">{totalAssigned}</span>
            <span className="text-sm text-text-secondary">assigned</span>
          </div>
          <div className="w-px h-4 bg-border-light" />
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-text-primary">{totalNeedsAttention}</span>
            <span className="text-sm text-text-secondary">needs attention</span>
          </div>
          <div className="w-px h-4 bg-border-light" />
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-text-primary">{totalCompleted}</span>
            <span className="text-sm text-text-secondary">completed</span>
          </div>
        </div>
      </div>

      {/* Tabs and Search */}
      <div className="flex items-center justify-between mb-6">
        <SegmentedControl
          segments={tabs}
          activeSegment={activeTab}
          onChange={setActiveTab}
        />
        <SearchBox
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search"
          className="w-60"
        />
      </div>

      {/* Status Tab */}
      {activeTab === 'status' && (
        <div className="space-y-8">
          {/* Needs Attention Table */}
          {attention.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-text-primary">
                    Needs Attention
                  </h2>
                  <p className="text-sm text-text-secondary">
                    {attention.length} team member{attention.length !== 1 ? 's' : ''} require action
                  </p>
                </div>
              </div>
              <NeedsAttentionTable recipients={attention} />
            </div>
          )}

          {/* Completed Table */}
          {trueCompleted.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-text-primary">
                    Completed
                  </h2>
                  <p className="text-sm text-text-secondary">
                    {trueCompleted.length} team member{trueCompleted.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <CompletedTable recipients={trueCompleted} />
            </div>
          )}

          {/* Empty state */}
          {filteredRecipients.length === 0 && (
            <div className="bg-white rounded-container border border-border-light p-12 text-center">
              <p className="text-sm text-text-secondary">No team members found</p>
            </div>
          )}
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="space-y-8">
          <div>
            <h2 className="text-base font-semibold text-text-primary mb-4">Assignment History</h2>
            <div className="space-y-4">
              {document.assignmentHistory?.map((assignment) => (
                <AssignmentCard
                  key={assignment.id}
                  assignment={assignment}
                  isExpanded={expandedGroups.includes(assignment.id)}
                  onToggle={() => toggleGroup(assignment.id)}
                  searchQuery={searchQuery}
                />
              ))}
              {(!document.assignmentHistory || document.assignmentHistory.length === 0) && (
                <div className="bg-white rounded-container border border-border-light p-8 text-center">
                  <p className="text-sm text-text-secondary">No assignment history</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Completed Table Component
function CompletedTable({ recipients }: { recipients: DocumentRecipient[] }) {
  const [selected, setSelected] = useState<string[]>([])
  const { addToast } = useToast()

  const toggleRow = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]))
  const toggleAll = () =>
    setSelected((prev) => (prev.length === recipients.length ? [] : recipients.map((r) => r.id)))

  const getMenuItems = (recipient: DocumentRecipient): ContextMenuItem[] => [
    {
      id: 'view',
      label: 'View Document',
      icon: <Eye className="w-4 h-4" />,
      onClick: () => addToast(`Viewing document for ${recipient.name}`, 'info'),
    },
    {
      id: 'download',
      label: 'Export PDF',
      icon: <Download className="w-4 h-4" />,
      onClick: () => addToast(`Exporting PDF for ${recipient.name}`, 'info'),
    },
  ]

  return (
    <div className="relative">
      {selected.length > 0 && (
        <div className="sticky top-0 z-10 bg-primary-500 text-white rounded-container px-4 py-3 mb-3 flex items-center justify-between shadow-lg">
          <span className="text-sm font-medium">{selected.length} selected</span>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
              onClick={() => {
                addToast(`Exporting ${selected.length} PDF(s)`, 'info')
                setSelected([])
              }}
            >
              Export PDF
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
              onClick={() => setSelected([])}
            >
              Deselect
            </Button>
          </div>
        </div>
      )}
      <div className="bg-white rounded-container border border-border-light overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-border-light">
                <th className="h-11 px-4 w-12">
                  <Checkbox checked={selected.length === recipients.length && recipients.length > 0} onChange={toggleAll} />
                </th>
                <th className="h-11 px-5 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Name
                </th>
                <th className="h-11 px-5 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider w-[25%]">
                  Location
                </th>
                <th className="h-11 px-5 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider w-[25%]">
                  Completed
                </th>
                <th className="h-11 px-3 w-12"></th>
              </tr>
            </thead>
            <tbody>
              {recipients.map((recipient) => (
                <tr
                  key={recipient.id}
                  className={`border-b border-border-light last:border-b-0 ${
                    selected.includes(recipient.id) ? 'bg-primary-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <td className="h-12 px-4">
                    <Checkbox checked={selected.includes(recipient.id)} onChange={() => toggleRow(recipient.id)} />
                  </td>
                  <td className="h-12 px-5">
                    <div>
                      <p className="text-sm text-text-primary">{recipient.name}</p>
                      <p className="text-xs text-text-secondary">{recipient.role}</p>
                    </div>
                  </td>
                  <td className="h-12 px-5">
                    <span className="text-sm text-text-secondary">{recipient.location}</span>
                  </td>
                  <td className="h-12 px-5">
                    <span className="text-sm text-text-secondary">{recipient.completedDate}</span>
                  </td>
                  <td className="h-12 px-3">
                    <ContextMenu items={getMenuItems(recipient)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// Needs Attention Table Component
function NeedsAttentionTable({ recipients }: { recipients: DocumentRecipient[] }) {
  const [selected, setSelected] = useState<string[]>([])
  const [reviewingRecipient, setReviewingRecipient] = useState<DocumentRecipient | null>(null)
  const { addToast } = useToast()

  const toggleRow = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]))
  const toggleAll = () =>
    setSelected((prev) => (prev.length === recipients.length ? [] : recipients.map((r) => r.id)))

  const getStatusDisplay = (recipient: DocumentRecipient) => {
    if (recipient.status === 'pending_verification') {
      return { text: 'Pending verification', className: 'text-purple-600 bg-purple-50' }
    }
    if (recipient.status === 'expired') {
      return { text: 'Expired', className: 'text-red-600 bg-red-50' }
    }
    if (recipient.status === 'expiring') {
      return { text: 'Expiring soon', className: 'text-amber-600 bg-amber-50' }
    }
    if (recipient.status === 'collecting' && recipient.signaturesCollected !== undefined) {
      return {
        text: `${recipient.signaturesCollected}/${recipient.signaturesRequired} complete`,
        className: 'text-blue-600 bg-blue-50',
      }
    }
    if (recipient.status === 'assigned') {
      return { text: 'Assigned', className: 'text-gray-600 bg-gray-100' }
    }
    return { text: recipient.statusText, className: 'text-gray-600 bg-gray-100' }
  }

  const getDateDisplay = (recipient: DocumentRecipient) => {
    if (recipient.status === 'pending_verification') {
      return { label: 'Uploaded expiry', value: recipient.uploadedExpiryDate || '-' }
    }
    if (recipient.status === 'expired' || recipient.status === 'expiring') {
      return { label: 'Expiry', value: recipient.expiryDate || '-' }
    }
    return { label: 'Due', value: recipient.dueDate || '-' }
  }

  const getMenuItems = (recipient: DocumentRecipient): ContextMenuItem[] => {
    const items: ContextMenuItem[] = []
    if (recipient.status === 'pending_verification') {
      items.push({
        id: 'review',
        label: 'Review Submission',
        icon: <Eye className="w-4 h-4" />,
        onClick: () => setReviewingRecipient(recipient),
      })
    }
    items.push(
      {
        id: 'resend',
        label: 'Resend',
        icon: <Send className="w-4 h-4" />,
        onClick: () => addToast(`Document resent to ${recipient.name}`, 'success'),
      },
      {
        id: 'view',
        label: 'View Document',
        icon: <Eye className="w-4 h-4" />,
        onClick: () => addToast(`Viewing document for ${recipient.name}`, 'info'),
      },
      {
        id: 'cancel',
        label: 'Cancel Assignment',
        icon: <UserX className="w-4 h-4" />,
        variant: 'danger',
        onClick: () => addToast(`Assignment cancelled for ${recipient.name}`, 'warning'),
      },
    )
    return items
  }

  return (
    <div className="relative">
      {/* Verification review panel */}
      {reviewingRecipient && (
        <VerificationPanel
          recipient={reviewingRecipient}
          onClose={() => setReviewingRecipient(null)}
          onApprove={() => {
            addToast(`${reviewingRecipient.name}'s submission approved`, 'success')
            setReviewingRecipient(null)
          }}
          onReject={() => {
            addToast(`${reviewingRecipient.name}'s submission rejected — they will be asked to re-upload`, 'warning')
            setReviewingRecipient(null)
          }}
        />
      )}

      {selected.length > 0 && (
        <div className="sticky top-0 z-10 bg-primary-500 text-white rounded-container px-4 py-3 mb-3 flex items-center justify-between shadow-lg">
          <span className="text-sm font-medium">{selected.length} selected</span>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
              onClick={() => {
                addToast(`Reminders sent to ${selected.length} member(s)`, 'success')
                setSelected([])
              }}
            >
              Send Reminder
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
              onClick={() => {
                addToast(`${selected.length} assignment(s) cancelled`, 'warning')
                setSelected([])
              }}
            >
              Cancel Assignment
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
              onClick={() => setSelected([])}
            >
              Deselect
            </Button>
          </div>
        </div>
      )}
      <div className="bg-white rounded-container border border-border-light overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-border-light">
                <th className="h-11 px-4 w-12">
                  <Checkbox checked={selected.length === recipients.length && recipients.length > 0} onChange={toggleAll} />
                </th>
                <th className="h-11 px-5 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider w-[25%]">
                  Name
                </th>
                <th className="h-11 px-5 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider w-[18%]">
                  Location
                </th>
                <th className="h-11 px-5 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider w-[18%]">
                  Status
                </th>
                <th className="h-11 px-5 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider w-[18%]">
                  Date
                </th>
                <th className="h-11 px-5 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider w-[140px]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {recipients.map((recipient) => {
                const status = getStatusDisplay(recipient)
                const date = getDateDisplay(recipient)
                const isPendingVerification = recipient.status === 'pending_verification'

                return (
                  <tr
                    key={recipient.id}
                    className={`border-b border-border-light last:border-b-0 ${
                      selected.includes(recipient.id) ? 'bg-primary-50' : isPendingVerification ? 'bg-purple-50/30' : 'hover:bg-gray-50'
                    }`}
                  >
                    <td className="h-14 px-4">
                      <Checkbox checked={selected.includes(recipient.id)} onChange={() => toggleRow(recipient.id)} />
                    </td>
                    <td className="h-14 px-5">
                      <div>
                        <p className="text-sm font-medium text-text-primary">{recipient.name}</p>
                        <p className="text-xs text-text-secondary">{recipient.role}</p>
                      </div>
                    </td>
                    <td className="h-14 px-5">
                      <span className="text-sm text-text-primary">{recipient.location}</span>
                    </td>
                    <td className="h-14 px-5">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${status.className}`}
                      >
                        {status.text}
                      </span>
                    </td>
                    <td className="h-14 px-5">
                      <div>
                        <p className="text-sm text-text-primary">{date.value}</p>
                        <p className="text-xs text-text-secondary">{date.label}</p>
                      </div>
                    </td>
                    <td className="h-14 px-5">
                      <div className="flex items-center justify-end gap-2">
                        {isPendingVerification ? (
                          <Button
                            variant="outline"
                            size="sm"
                            leftIcon={<Eye className="w-3.5 h-3.5" />}
                            onClick={() => setReviewingRecipient(recipient)}
                            className="text-purple-600 border-purple-300 hover:bg-purple-50"
                          >
                            Review
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<Bell className="w-3.5 h-3.5" />}
                            onClick={() =>
                              addToast(`Reminder sent to ${recipient.name}`, 'success')
                            }
                            className="text-amber-600 hover:bg-amber-50"
                          >
                            Remind
                          </Button>
                        )}
                        <ContextMenu items={getMenuItems(recipient)} />
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ── Verification Review Panel ────────────────────────────────────────
function VerificationPanel({
  recipient,
  onClose,
  onApprove,
  onReject,
}: {
  recipient: DocumentRecipient
  onClose: () => void
  onApprove: () => void
  onReject: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-light">
          <div>
            <h3 className="text-lg font-semibold text-text-primary">Review Submission</h3>
            <p className="text-sm text-text-secondary">
              {recipient.name} · {recipient.role} · {recipient.location}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Uploaded document preview */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-text-primary mb-3">
              <ImageIcon className="w-4 h-4 text-gray-500" />
              Uploaded Document
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 p-8 flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center mb-3">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-text-primary mb-1">
                {recipient.name.replace(/\s+/g, '_')}_certificate.jpg
              </p>
              <p className="text-xs text-text-secondary mb-3">Uploaded by employee</p>
              <Button variant="outline" size="sm" leftIcon={<Eye className="w-3.5 h-3.5" />}>
                View Full Image
              </Button>
            </div>
          </div>

          {/* OCR-captured expiration date */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-text-primary mb-3">
              <Calendar className="w-4 h-4 text-gray-500" />
              Expiration Date
            </label>
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-border-light">
              <div className="flex-1">
                <p className="text-sm text-text-secondary mb-1">Detected via OCR</p>
                <p className="text-lg font-semibold text-text-primary">
                  {recipient.uploadedExpiryDate || 'Not detected'}
                </p>
              </div>
              <div className="w-px h-10 bg-border-light" />
              <div className="flex-1">
                <p className="text-sm text-text-secondary mb-1">Status</p>
                {recipient.uploadedExpiryDate ? (
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-green-600">
                    <Check className="w-4 h-4" />
                    Date captured successfully
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-600">
                    <AlertTriangle className="w-4 h-4" />
                    Employee entered manually
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Verification note */}
          <div className="flex items-start gap-2.5 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-blue-800">
              Please verify that the uploaded document matches the employee's information and that the
              expiration date is correct. If it's wrong, the employee will be asked to re-upload.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border-light bg-gray-50">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              leftIcon={<RotateCcw className="w-4 h-4" />}
              onClick={onReject}
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              Reject & Ask to Re-upload
            </Button>
            <Button
              leftIcon={<Check className="w-4 h-4" />}
              onClick={onApprove}
            >
              Approve
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

interface AssignmentCardProps {
  assignment: AssignmentInstance
  isExpanded: boolean
  onToggle: () => void
  searchQuery: string
}

function AssignmentCard({
  assignment,
  isExpanded,
  onToggle,
  searchQuery,
}: AssignmentCardProps) {
  const { addToast } = useToast()

  const filteredRecipients = assignment.recipients.filter(
    (r) =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.location.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getRecipientMenuItems = (recipient: DocumentRecipient): ContextMenuItem[] => [
    {
      id: 'view',
      label: 'View Document',
      icon: <Eye className="w-4 h-4" />,
      onClick: () => addToast(`Viewing document for ${recipient.name}`, 'info'),
    },
    {
      id: 'remind',
      label: 'Send Reminder',
      icon: <Bell className="w-4 h-4" />,
      onClick: () => addToast(`Reminder sent to ${recipient.name}`, 'success'),
    },
    {
      id: 'cancel',
      label: 'Cancel Assignment',
      icon: <UserX className="w-4 h-4" />,
      variant: 'danger',
      onClick: () => addToast(`Assignment cancelled for ${recipient.name}`, 'warning'),
    },
  ]

  return (
    <div className="bg-white rounded-container border border-border-light overflow-hidden">
      {/* Card Header */}
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-2.5">
            <button
              onClick={onToggle}
              className="mt-0.5 w-5 h-5 flex items-center justify-center flex-shrink-0"
            >
              <ChevronDown
                className={`w-4 h-4 text-gray-500 transition-transform ${
                  isExpanded ? '' : '-rotate-90'
                }`}
              />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-text-primary">
                  Assigned to {assignment.recipientCount} recipient
                  {assignment.recipientCount !== 1 ? 's' : ''}
                </h3>
              </div>
              <p className="text-sm text-text-secondary mt-1">
                {assignment.completedCount} / {assignment.recipientCount} completed •{' '}
                {assignment.cancelledCount} cancelled
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-text-primary">
                Assigned by {assignment.assignedBy}
              </p>
              <p className="text-sm text-text-secondary">{assignment.assignedDate}</p>
            </div>
            <ContextMenu
              items={[
                {
                  id: 'remind-all',
                  label: 'Remind All',
                  icon: <Bell className="w-4 h-4" />,
                  onClick: () => addToast('Reminders sent to all recipients', 'success'),
                },
                {
                  id: 'cancel-all',
                  label: 'Cancel All',
                  icon: <UserX className="w-4 h-4" />,
                  variant: 'danger',
                  onClick: () => addToast('All assignments cancelled', 'warning'),
                },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      {isExpanded && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-t border-b border-border-light">
                  <th className="h-12 px-5 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Member
                  </th>
                  <th className="h-12 px-5 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Location
                  </th>
                  <th className="h-12 px-5 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Status
                  </th>
                  <th className="h-12 px-5 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Completed Date
                  </th>
                  <th className="h-12 px-5 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Last Assigned
                  </th>
                  <th className="h-12 px-3 w-12"></th>
                </tr>
              </thead>
              <tbody>
                {filteredRecipients.map((recipient) => (
                  <tr
                    key={recipient.id}
                    className="border-b border-border-light last:border-b-0 hover:bg-gray-50"
                  >
                    <td className="h-14 px-5">
                      <div>
                        <p className="text-sm font-medium text-text-primary">{recipient.name}</p>
                        <p className="text-xs text-text-secondary">{recipient.role}</p>
                      </div>
                    </td>
                    <td className="h-14 px-5">
                      <span className="text-sm text-text-primary">{recipient.location}</span>
                    </td>
                    <td className="h-14 px-5">
                      <span
                        className={`text-sm ${
                          recipient.status === 'completed'
                            ? 'text-green-600'
                            : recipient.status === 'pending_verification'
                            ? 'text-purple-600'
                            : recipient.status === 'collecting'
                            ? 'text-primary-500'
                            : recipient.status === 'expired'
                            ? 'text-red-600'
                            : recipient.status === 'expiring'
                            ? 'text-amber-600'
                            : 'text-text-primary'
                        }`}
                      >
                        {recipient.statusText}
                      </span>
                    </td>
                    <td className="h-14 px-5">
                      <span className="text-sm text-text-primary">
                        {recipient.completedDate || '-'}
                      </span>
                    </td>
                    <td className="h-14 px-5">
                      <span className="text-sm text-text-primary">
                        {recipient.lastAssignedDate}
                      </span>
                    </td>
                    <td className="h-14 px-3">
                      <ContextMenu items={getRecipientMenuItems(recipient)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredRecipients.length === 0 && (
              <div className="py-8 text-center border-t border-border-light">
                <p className="text-sm text-text-secondary">
                  No recipients match your search
                </p>
              </div>
            )}
          </div>

          {/* Footer with pagination */}
          <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-border-light">
            <button
              className="w-8 h-8 flex items-center justify-center rounded-md border border-border-light hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled
            >
              <ChevronLeft className="w-4 h-4 text-gray-400" />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-md border border-border-light hover:bg-gray-50 transition-colors">
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </>
      )}
    </div>
  )
}
