import { useState } from 'react'
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  XCircle,
  X,
  ChevronRight,
  Download,
  Bell,
  User,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'
import { TeamMember } from '../../data/mockData'
import Button from '../ui/Button'
import Checkbox from '../ui/Checkbox'
import ContextMenu, { ContextMenuItem } from '../ui/ContextMenu'
import { useToast } from '../ui/Toast'

interface MembersTableProps {
  members: TeamMember[]
}

type SortField = 'name' | 'location' | 'progress' | 'validity'
type SortDirection = 'asc' | 'desc'

export default function MembersTable({ members }: MembersTableProps) {
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [sortField, setSortField] = useState<SortField | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [slideOverMember, setSlideOverMember] = useState<TeamMember | null>(null)
  const { addToast } = useToast()

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'expiring':
        return <AlertCircle className="w-4 h-4 text-orange-500" />
      case 'expired':
        return <XCircle className="w-4 h-4 text-accent-red-400" />
      default:
        return null
    }
  }

  const getMemberStats = (member: TeamMember) => {
    let completed = 0
    let total = 0
    let expired = 0
    let pending = 0
    let expiring = 0

    member.documents.forEach((category) => {
      category.documents.forEach((doc) => {
        total++
        if (doc.status === 'completed') completed++
        if (doc.status === 'expired') expired++
        if (doc.status === 'pending') pending++
        if (doc.status === 'expiring') expiring++
      })
    })

    return { completed, total, expired, pending, expiring }
  }

  const getValidityStatus = (member: TeamMember) => {
    const stats = getMemberStats(member)
    if (stats.expired > 0) return { label: 'Expired', color: 'text-red-600 bg-red-50', priority: 0 }
    if (stats.expiring > 0) return { label: 'Expiring', color: 'text-orange-600 bg-orange-50', priority: 1 }
    if (stats.pending > 0) return { label: 'Pending', color: 'text-amber-600 bg-amber-50', priority: 2 }
    return { label: 'Valid', color: 'text-green-600 bg-green-50', priority: 3 }
  }

  const handleToggleRow = (id: string) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    )
  }

  const handleSelectAll = () => {
    if (selectedRows.length === members.length) {
      setSelectedRows([])
    } else {
      setSelectedRows(members.map((m) => m.id))
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

  // Sort members
  const sortedMembers = [...members].sort((a, b) => {
    if (!sortField) return 0
    const dir = sortDirection === 'asc' ? 1 : -1

    switch (sortField) {
      case 'name':
        return a.name.localeCompare(b.name) * dir
      case 'location':
        return a.location.localeCompare(b.location) * dir
      case 'progress': {
        const aStats = getMemberStats(a)
        const bStats = getMemberStats(b)
        return ((aStats.completed / aStats.total) - (bStats.completed / bStats.total)) * dir
      }
      case 'validity': {
        const aVal = getValidityStatus(a)
        const bVal = getValidityStatus(b)
        return (aVal.priority - bVal.priority) * dir
      }
      default:
        return 0
    }
  })

  const getMenuItems = (member: TeamMember): ContextMenuItem[] => [
    {
      id: 'view',
      label: 'View Profile',
      icon: <User className="w-4 h-4" />,
      onClick: () => setSlideOverMember(member),
    },
    {
      id: 'download',
      label: 'Download Documents',
      icon: <Download className="w-4 h-4" />,
      onClick: () => addToast(`Downloading documents for ${member.name}`, 'info'),
    },
    {
      id: 'remind',
      label: 'Send Reminder',
      icon: <Bell className="w-4 h-4" />,
      onClick: () => addToast(`Reminder sent to ${member.name}`, 'success'),
    },
  ]

  return (
    <div className="relative">
      {/* Floating bulk action bar */}
      {selectedRows.length > 0 && (
        <div className="sticky top-0 z-10 bg-primary-500 text-white rounded-container px-4 py-3 mb-3 flex items-center justify-between shadow-lg">
          <span className="text-sm font-medium">
            {selectedRows.length} member{selectedRows.length !== 1 ? 's' : ''} selected
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
              onClick={() => {
                addToast(`Reminders sent to ${selectedRows.length} member(s)`, 'success')
                setSelectedRows([])
              }}
            >
              Remind All
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
              onClick={() => {
                addToast(`Downloading documents for ${selectedRows.length} member(s)`, 'info')
                setSelectedRows([])
              }}
            >
              Download All
            </Button>
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

      <div className="bg-white rounded-container border border-border-light overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border-light bg-gray-50">
              <th className="h-12 px-4 w-12">
                <Checkbox
                  checked={selectedRows.length === members.length && members.length > 0}
                  onChange={handleSelectAll}
                />
              </th>
              <th className="h-12 px-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider w-[30%]">
                <button
                  onClick={() => handleSort('name')}
                  className="flex items-center gap-1 hover:text-text-primary transition-colors"
                >
                  Member {getSortIcon('name')}
                </button>
              </th>
              <th className="h-12 px-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                <button
                  onClick={() => handleSort('location')}
                  className="flex items-center gap-1 hover:text-text-primary transition-colors"
                >
                  Location {getSortIcon('location')}
                </button>
              </th>
              <th className="h-12 px-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                <button
                  onClick={() => handleSort('progress')}
                  className="flex items-center gap-1 hover:text-text-primary transition-colors"
                >
                  Progress {getSortIcon('progress')}
                </button>
              </th>
              <th className="h-12 px-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                <button
                  onClick={() => handleSort('validity')}
                  className="flex items-center gap-1 hover:text-text-primary transition-colors"
                >
                  Validity {getSortIcon('validity')}
                </button>
              </th>
              <th className="h-12 px-4 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider w-[140px]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedMembers.map((member) => {
              const stats = getMemberStats(member)
              const validity = getValidityStatus(member)
              const pct = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0

              return (
                <tr
                  key={member.id}
                  className={`border-b border-border-light last:border-b-0 hover:bg-gray-50 cursor-pointer ${
                    selectedRows.includes(member.id) ? 'bg-primary-50' : ''
                  }`}
                  onClick={() => setSlideOverMember(member)}
                >
                  <td className="h-16 px-4" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedRows.includes(member.id)}
                      onChange={() => handleToggleRow(member.id)}
                    />
                  </td>
                  <td className="h-16 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-semibold text-white">{member.initials}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text-primary">{member.name}</p>
                        <p className="text-xs text-text-secondary">{member.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="h-16 px-4">
                    <span className="text-sm text-text-primary">{member.location}</span>
                  </td>
                  <td className="h-16 px-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm text-text-primary">
                        {stats.completed}/{stats.total}
                      </span>
                      <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            pct === 100 ? 'bg-green-500' : pct > 60 ? 'bg-primary-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="h-16 px-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${validity.color}`}
                      >
                        {validity.label}
                      </span>
                      {stats.expired > 0 && (
                        <span className="text-xs text-red-600 font-medium">
                          {stats.expired} expired
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="h-16 px-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                      {(stats.expired > 0 || stats.pending > 0) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => addToast(`Reminder sent to ${member.name}`, 'success')}
                        >
                          <Bell className="w-4 h-4 text-amber-500" />
                        </Button>
                      )}
                      <ContextMenu items={getMenuItems(member)} />
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Slide-over Panel */}
      {slideOverMember && (
        <MemberSlideOver
          member={slideOverMember}
          onClose={() => setSlideOverMember(null)}
          getStatusIcon={getStatusIcon}
        />
      )}
    </div>
  )
}

// Slide-over panel component
function MemberSlideOver({
  member,
  onClose,
  getStatusIcon,
}: {
  member: TeamMember
  onClose: () => void
  getStatusIcon: (status: string) => React.ReactNode
}) {
  const { addToast } = useToast()

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 z-50 w-[420px] bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-light">
          <h2 className="text-lg font-bold text-text-primary">Member Details</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Profile */}
          <div className="px-6 py-5 border-b border-border-light">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-primary-500 rounded-full flex items-center justify-center">
                <span className="text-lg font-bold text-white">{member.initials}</span>
              </div>
              <div>
                <h3 className="text-base font-bold text-text-primary">{member.name}</h3>
                <p className="text-sm text-text-secondary">
                  {member.role} · {member.location}
                </p>
                <p className="text-xs text-text-secondary mt-0.5">{member.email}</p>
              </div>
            </div>
          </div>

          {/* Document categories */}
          <div className="px-6 py-5">
            {member.documents.map((category) => (
              <div key={category.category} className="mb-5 last:mb-0">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    {category.category}
                  </h4>
                  <span className="text-xs text-text-secondary">{category.documents.length}</span>
                </div>
                <div className="space-y-2">
                  {category.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-element border border-border-light"
                    >
                      <div className="flex items-center gap-3">
                        {getStatusIcon(doc.status)}
                        <div>
                          <p className="text-sm font-medium text-text-primary">{doc.name}</p>
                          {doc.completedDate && (
                            <p className="text-xs text-text-secondary">Completed {doc.completedDate}</p>
                          )}
                          {doc.dueDate && doc.status !== 'completed' && (
                            <p className="text-xs text-text-secondary">Due {doc.dueDate}</p>
                          )}
                        </div>
                      </div>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded ${
                          doc.status === 'expired'
                            ? 'text-red-600 bg-red-50'
                            : doc.status === 'expiring'
                            ? 'text-orange-600 bg-orange-50'
                            : doc.status === 'pending'
                            ? 'text-amber-600 bg-amber-50'
                            : 'text-green-600 bg-green-50'
                        }`}
                      >
                        {doc.status === 'expired'
                          ? 'Expired'
                          : doc.status === 'expiring'
                          ? 'Expiring'
                          : doc.status === 'pending'
                          ? 'Pending'
                          : 'Completed'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border-light flex items-center gap-3">
          <Button
            variant="primary"
            className="flex-1"
            leftIcon={<Bell className="w-4 h-4" />}
            onClick={() => addToast(`Reminder sent to ${member.name}`, 'success')}
          >
            Send Reminder
          </Button>
          <Button
            variant="outline"
            leftIcon={<Download className="w-4 h-4" />}
            onClick={() => addToast(`Downloading documents for ${member.name}`, 'info')}
          >
            Download
          </Button>
        </div>
      </div>
    </>
  )
}
