import { useState } from 'react'
import { 
  Plus, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  XCircle,
  FileText,
  Bell,
  Award,
  PenLine,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  Send,
  Trash2,
  Edit,
  Copy,
} from 'lucide-react'
import Button from '../ui/Button'
import SearchBox from '../ui/SearchBox'
import Checkbox from '../ui/Checkbox'
import ContextMenu, { ContextMenuItem } from '../ui/ContextMenu'
import { useToast } from '../ui/Toast'
import { writeUps, WriteUp, WriteUpStatus, getWriteUpStats } from '../../data/mockData'

interface WriteUpsDashboardProps {
  onCreateWriteUp?: () => void
  onViewWriteUp?: (writeUp: WriteUp) => void
  onAssignWriteUp?: () => void
}

// ─── Reduced color palette ───
// Red = needs action (refused, expired)
// Amber = pending (sent/waiting)
// Green = resolved (acknowledged)
// Gray = neutral (draft, scheduled)
const statusConfig: Record<WriteUpStatus, { label: string; icon: React.ReactNode; color: string; bgColor: string }> = {
  draft: { 
    label: 'Draft', 
    icon: <FileText className="w-3.5 h-3.5" />, 
    color: 'text-gray-500',
    bgColor: 'bg-gray-100'
  },
  scheduled: { 
    label: 'Scheduled', 
    icon: <Clock className="w-3.5 h-3.5" />, 
    color: 'text-gray-500',
    bgColor: 'bg-gray-100'
  },
  sent: { 
    label: 'Pending', 
    icon: <Clock className="w-3.5 h-3.5" />, 
    color: 'text-amber-600',
    bgColor: 'bg-amber-50'
  },
  acknowledged: { 
    label: 'Acknowledged', 
    icon: <CheckCircle2 className="w-3.5 h-3.5" />, 
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  refused: { 
    label: 'Refused', 
    icon: <XCircle className="w-3.5 h-3.5" />, 
    color: 'text-red-600',
    bgColor: 'bg-red-50'
  },
  expired: { 
    label: 'Expired', 
    icon: <AlertTriangle className="w-3.5 h-3.5" />, 
    color: 'text-red-600',
    bgColor: 'bg-red-50'
  },
}

// All type badges use neutral gray — the label text itself differentiates
const typeConfig: Record<string, { label: string; icon: React.ReactNode }> = {
  'verbal-warning': { label: 'Verbal', icon: <AlertTriangle className="w-3 h-3" /> },
  'written-warning': { label: 'Written', icon: <PenLine className="w-3 h-3" /> },
  'final-warning': { label: 'Final', icon: <AlertTriangle className="w-3 h-3" /> },
  'performance-improvement': { label: 'PIP', icon: <FileText className="w-3 h-3" /> },
  'recognition': { label: 'Recognition', icon: <Award className="w-3 h-3" /> },
  'coaching': { label: 'Coaching', icon: <PenLine className="w-3 h-3" /> },
}

type SortField = 'employee' | 'type' | 'status' | 'date'
type SortDirection = 'asc' | 'desc'

// Status filter chip definitions — matching traffic light palette
const statusChips: { id: string; label: string; filterFn: (wu: WriteUp) => boolean; dotColor: string }[] = [
  { id: 'all', label: 'All', filterFn: () => true, dotColor: 'bg-gray-400' },
  { id: 'sent', label: 'Pending', filterFn: (wu) => wu.status === 'sent', dotColor: 'bg-amber-500' },
  { id: 'refused', label: 'Refused', filterFn: (wu) => wu.status === 'refused', dotColor: 'bg-red-500' },
  { id: 'acknowledged', label: 'Acknowledged', filterFn: (wu) => wu.status === 'acknowledged', dotColor: 'bg-green-500' },
  { id: 'draft', label: 'Draft', filterFn: (wu) => wu.status === 'draft', dotColor: 'bg-gray-400' },
  { id: 'scheduled', label: 'Scheduled', filterFn: (wu) => wu.status === 'scheduled', dotColor: 'bg-gray-400' },
]

export default function WriteUpsDashboard({
  onCreateWriteUp,
  onViewWriteUp,
  onAssignWriteUp,
}: WriteUpsDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeChip, setActiveChip] = useState('all')
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [sortField, setSortField] = useState<SortField | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const { addToast } = useToast()

  // Compute chip counts
  const chipCounts = statusChips.reduce((acc, chip) => {
    acc[chip.id] = writeUps.filter(chip.filterFn).length
    return acc
  }, {} as Record<string, number>)

  // Filter write-ups
  const activeChipDef = statusChips.find((c) => c.id === activeChip) || statusChips[0]
  const filteredWriteUps = writeUps.filter((writeUp) => {
    const matchesSearch = 
      writeUp.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      writeUp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      writeUp.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesChip = activeChipDef.filterFn(writeUp)
    
    return matchesSearch && matchesChip
  })

  // Sort
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
      <ArrowUp className="w-3 h-3 text-gray-600" />
    ) : (
      <ArrowDown className="w-3 h-3 text-gray-600" />
    )
  }

  const sortedWriteUps = [...filteredWriteUps].sort((a, b) => {
    if (!sortField) {
      // Default: most recent first
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }
    const dir = sortDirection === 'asc' ? 1 : -1
    switch (sortField) {
      case 'employee':
        return a.employeeName.localeCompare(b.employeeName) * dir
      case 'type':
        return a.type.localeCompare(b.type) * dir
      case 'status':
        return a.status.localeCompare(b.status) * dir
      case 'date':
        return (new Date(a.incidentDate).getTime() - new Date(b.incidentDate).getTime()) * dir
      default:
        return 0
    }
  })

  // Bulk selection
  const handleToggleRow = (id: string) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    )
  }

  const handleSelectAll = () => {
    if (selectedRows.length === sortedWriteUps.length) {
      setSelectedRows([])
    } else {
      setSelectedRows(sortedWriteUps.map((w) => w.id))
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const getMenuItems = (writeUp: WriteUp): ContextMenuItem[] => [
    {
      id: 'view',
      label: 'View Details',
      icon: <Eye className="w-4 h-4" />,
      onClick: () => onViewWriteUp?.(writeUp),
    },
    {
      id: 'edit',
      label: 'Edit',
      icon: <Edit className="w-4 h-4" />,
      onClick: () => addToast(`Editing "${writeUp.title}"`, 'info'),
      disabled: writeUp.status === 'acknowledged',
    },
    {
      id: 'resend',
      label: 'Resend',
      icon: <Send className="w-4 h-4" />,
      onClick: () => addToast(`Write-up resent to ${writeUp.employeeName}`, 'success'),
    },
    {
      id: 'remind',
      label: 'Send Reminder',
      icon: <Bell className="w-4 h-4" />,
      onClick: () => addToast(`Reminder sent to ${writeUp.employeeName}`, 'success'),
      disabled: writeUp.status !== 'sent',
    },
    {
      id: 'duplicate',
      label: 'Duplicate',
      icon: <Copy className="w-4 h-4" />,
      onClick: () => addToast(`"${writeUp.title}" duplicated`, 'success'),
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: <Trash2 className="w-4 h-4" />,
      variant: 'danger',
      onClick: () => addToast(`"${writeUp.title}" deleted`, 'error'),
    },
  ]

  return (
    <div className="space-y-4">
      {/* ─── Status Filter Chips + Search ─── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {statusChips.map((chip) => {
            const count = chipCounts[chip.id]
            if (chip.id !== 'all' && count === 0) return null
            const isActive = activeChip === chip.id
            return (
              <button
                key={chip.id}
                onClick={() => setActiveChip(chip.id)}
                className={`
                  inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-medium transition-all
                  ${isActive
                    ? 'bg-text-primary text-white shadow-sm'
                    : 'bg-white text-text-secondary border border-border-light hover:border-gray-300 hover:text-text-primary'
                  }
                `}
              >
                {chip.id !== 'all' && (
                  <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white/70' : chip.dotColor}`} />
                )}
                {chip.label}
                <span className={`${isActive ? 'text-white/70' : 'text-text-secondary'}`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        <SearchBox
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search write-ups..."
          className="w-64"
        />
      </div>

      {/* Floating bulk action bar */}
      {selectedRows.length > 0 && (
        <div className="sticky top-0 z-10 bg-gray-900 text-white rounded-container px-4 py-3 flex items-center justify-between shadow-lg">
          <span className="text-sm font-medium">
            {selectedRows.length} write-up{selectedRows.length !== 1 ? 's' : ''} selected
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
              onClick={() => {
                addToast(`Reminders sent for ${selectedRows.length} write-up(s)`, 'success')
                setSelectedRows([])
              }}
            >
              Send Reminders
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
              onClick={() => {
                addToast(`${selectedRows.length} write-up(s) deleted`, 'error')
                setSelectedRows([])
              }}
            >
              Delete
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

      {/* ─── Write-ups Table ─── */}
      <div className="bg-white rounded-container border border-border-light overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border-light bg-gray-50">
              <th className="h-11 px-4 w-12">
                <Checkbox
                  checked={selectedRows.length === sortedWriteUps.length && sortedWriteUps.length > 0}
                  onChange={handleSelectAll}
                />
              </th>
              <th className="h-11 px-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                <button
                  onClick={() => handleSort('employee')}
                  className="flex items-center gap-1 hover:text-text-primary transition-colors"
                >
                  Employee {getSortIcon('employee')}
                </button>
              </th>
              <th className="h-11 px-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                <button
                  onClick={() => handleSort('type')}
                  className="flex items-center gap-1 hover:text-text-primary transition-colors"
                >
                  Type {getSortIcon('type')}
                </button>
              </th>
              <th className="h-11 px-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Title
              </th>
              <th className="h-11 px-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                <button
                  onClick={() => handleSort('status')}
                  className="flex items-center gap-1 hover:text-text-primary transition-colors"
                >
                  Status {getSortIcon('status')}
                </button>
              </th>
              <th className="h-11 px-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                <button
                  onClick={() => handleSort('date')}
                  className="flex items-center gap-1 hover:text-text-primary transition-colors"
                >
                  Date {getSortIcon('date')}
                </button>
              </th>
              <th className="h-11 px-4 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider w-[100px]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedWriteUps.map((writeUp) => {
              const status = statusConfig[writeUp.status]
              const type = typeConfig[writeUp.type]
              
              return (
                <tr 
                  key={writeUp.id} 
                  className={`border-b border-border-light last:border-b-0 hover:bg-gray-50 cursor-pointer ${
                    selectedRows.includes(writeUp.id) ? 'bg-gray-50' : ''
                  }`}
                  onClick={() => onViewWriteUp?.(writeUp)}
                >
                  <td className="h-14 px-4" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedRows.includes(writeUp.id)}
                      onChange={() => handleToggleRow(writeUp.id)}
                    />
                  </td>
                  <td className="h-14 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-semibold text-gray-600">
                          {writeUp.employeeName.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text-primary">{writeUp.employeeName}</p>
                        <p className="text-xs text-text-secondary">{writeUp.employeeRole}</p>
                      </div>
                    </div>
                  </td>
                  <td className="h-14 px-4">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600">
                      {type.icon}
                      {type.label}
                    </span>
                  </td>
                  <td className="h-14 px-4">
                    <p className="text-sm text-text-primary truncate max-w-xs">{writeUp.title}</p>
                  </td>
                  <td className="h-14 px-4">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium ${status.bgColor} ${status.color}`}>
                      {status.icon}
                      {status.label}
                    </span>
                  </td>
                  <td className="h-14 px-4">
                    <div>
                      <p className="text-sm text-text-primary">{formatDate(writeUp.incidentDate)}</p>
                      <p className="text-xs text-text-secondary">{writeUp.location}</p>
                    </div>
                  </td>
                  <td className="h-14 px-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                      {writeUp.status === 'sent' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => addToast(`Reminder sent to ${writeUp.employeeName}`, 'success')}
                          className="text-gray-500 hover:bg-gray-100"
                        >
                          <Bell className="w-3.5 h-3.5" />
                        </Button>
                      )}
                      <ContextMenu items={getMenuItems(writeUp)} />
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {sortedWriteUps.length === 0 && (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-sm font-medium text-text-primary mb-1">No write-ups found</h3>
            <p className="text-sm text-text-secondary">
              {searchQuery || activeChip !== 'all'
                ? 'Try adjusting your filters'
                : 'Create your first write-up to get started'}
            </p>
            {!searchQuery && activeChip === 'all' && (
              <Button
                variant="primary"
                leftIcon={<Plus className="w-4 h-4" />}
                className="mt-4"
                onClick={onAssignWriteUp}
              >
                Create Write-up
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      {sortedWriteUps.length > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-secondary">
            Showing {sortedWriteUps.length} of {writeUps.length} write-ups
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
    </div>
  )
}
