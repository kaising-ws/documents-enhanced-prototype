import { useState, useMemo } from 'react'
import {
  Plus,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  PenLine,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  Send,
  Trash2,
  Edit,
  Ban,
  Filter,
  MapPin,
  Briefcase,
  CircleDot,
  ChevronDown,
  X,
} from 'lucide-react'
import SearchBox from '../components/ui/SearchBox'
import Button from '../components/ui/Button'
import Checkbox from '../components/ui/Checkbox'
import ContextMenu, { ContextMenuItem } from '../components/ui/ContextMenu'
import { useToast } from '../components/ui/Toast'
import {
  writeUps,
  WriteUp,
  WriteUpStatus,
  WriteUpType,
  getWriteUpStats,
  getWriteUpTemplateName,
} from '../data/mockData'
import WriteUpQuickView from '../components/documents/WriteUpQuickView'

// ─── Status badge config ───
const statusConfig: Record<
  WriteUpStatus,
  { label: string; icon: React.ReactNode; color: string; bgColor: string }
> = {
  draft: { label: 'Draft', icon: <FileText className="w-3.5 h-3.5" />, color: 'text-gray-500', bgColor: 'bg-gray-100' },
  scheduled: { label: 'Scheduled', icon: <Clock className="w-3.5 h-3.5" />, color: 'text-gray-500', bgColor: 'bg-gray-100' },
  sent: { label: 'Pending', icon: <Clock className="w-3.5 h-3.5" />, color: 'text-amber-600', bgColor: 'bg-amber-50' },
  acknowledged: { label: 'Acknowledged', icon: <CheckCircle2 className="w-3.5 h-3.5" />, color: 'text-green-600', bgColor: 'bg-green-50' },
  refused: { label: 'Refused', icon: <XCircle className="w-3.5 h-3.5" />, color: 'text-red-600', bgColor: 'bg-red-50' },
  expired: { label: 'Expired', icon: <AlertTriangle className="w-3.5 h-3.5" />, color: 'text-red-600', bgColor: 'bg-red-50' },
}

const typeLabels: Record<WriteUpType, string> = {
  'verbal-warning': 'Verbal Warning',
  'written-warning': 'Written Warning',
  'final-warning': 'Final Warning',
  'performance-improvement': 'PIP',
  recognition: 'Recognition',
  coaching: 'Coaching',
}

type SortField = 'employee' | 'type' | 'template' | 'status' | 'date'
type SortDirection = 'asc' | 'desc'

export default function WriteUpsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [sortField, setSortField] = useState<SortField | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [quickViewWriteUp, setQuickViewWriteUp] = useState<WriteUp | null>(null)

  // Filters
  const [filterLocation, setFilterLocation] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterTemplate, setFilterTemplate] = useState('all')

  const { addToast } = useToast()
  const stats = getWriteUpStats()

  // Unique filter values
  const uniqueLocations = useMemo(
    () => [...new Set(writeUps.map((w) => w.location))].sort(),
    []
  )
  const uniqueTemplates = useMemo(
    () =>
      [...new Set(writeUps.map((w) => w.templateId))].map((id) => ({
        id,
        label: getWriteUpTemplateName(id),
      })),
    []
  )

  const activeFilterCount =
    (filterLocation !== 'all' ? 1 : 0) +
    (filterStatus !== 'all' ? 1 : 0) +
    (filterTemplate !== 'all' ? 1 : 0)

  const clearAllFilters = () => {
    setFilterLocation('all')
    setFilterStatus('all')
    setFilterTemplate('all')
  }

  // Filter
  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase()
    return writeUps.filter((wu) => {
      const matchesSearch =
        !q ||
        wu.employeeName.toLowerCase().includes(q) ||
        wu.title.toLowerCase().includes(q) ||
        wu.location.toLowerCase().includes(q)
      const matchesLocation = filterLocation === 'all' || wu.location === filterLocation
      const matchesStatus = filterStatus === 'all' || wu.status === filterStatus
      const matchesTemplate = filterTemplate === 'all' || wu.templateId === filterTemplate
      return matchesSearch && matchesLocation && matchesStatus && matchesTemplate
    })
  }, [searchQuery, filterLocation, filterStatus, filterTemplate])

  // Sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'))
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

  const sorted = useMemo(() => {
    if (!sortField) return filtered
    const dir = sortDirection === 'asc' ? 1 : -1
    return [...filtered].sort((a, b) => {
      switch (sortField) {
        case 'employee':
          return a.employeeName.localeCompare(b.employeeName) * dir
        case 'type':
          return a.type.localeCompare(b.type) * dir
        case 'template':
          return getWriteUpTemplateName(a.templateId).localeCompare(getWriteUpTemplateName(b.templateId)) * dir
        case 'status':
          return a.status.localeCompare(b.status) * dir
        case 'date':
          return (new Date(a.incidentDate).getTime() - new Date(b.incidentDate).getTime()) * dir
        default:
          return 0
      }
    })
  }, [filtered, sortField, sortDirection])

  // Selection
  const handleToggleRow = (id: string) =>
    setSelectedRows((prev) => (prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]))

  const handleSelectAll = () => {
    if (selectedRows.length === sorted.length) setSelectedRows([])
    else setSelectedRows(sorted.map((w) => w.id))
  }

  const getMenuItems = (wu: WriteUp): ContextMenuItem[] => {
    const items: ContextMenuItem[] = [
      {
        id: 'view',
        label: 'View write-up',
        icon: <Eye className="w-4 h-4" />,
        onClick: () => setQuickViewWriteUp(wu),
      },
    ]
    if (wu.status === 'sent') {
      items.push({
        id: 'remind',
        label: 'Send reminder',
        icon: <Send className="w-4 h-4" />,
        onClick: () => addToast(`Reminder sent to ${wu.employeeName}`, 'success'),
      })
      items.push({
        id: 'refuse',
        label: 'Mark as refused to sign',
        icon: <Ban className="w-4 h-4" />,
        variant: 'danger',
        onClick: () => addToast(`Marked as refused for ${wu.employeeName}`, 'info'),
      })
    }
    if (wu.status === 'draft') {
      items.push({
        id: 'edit',
        label: 'Edit draft',
        icon: <Edit className="w-4 h-4" />,
        onClick: () => addToast(`Editing "${wu.title}"`, 'info'),
      })
    }
    items.push({
      id: 'delete',
      label: 'Delete',
      icon: <Trash2 className="w-4 h-4" />,
      variant: 'danger',
      onClick: () => addToast(`"${wu.title}" deleted`, 'error'),
    })
    return items
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      {/* ─── Analytics Banner ─── */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-container border border-border-light p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
            <PenLine className="w-5 h-5 text-gray-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-text-primary">{stats.total}</p>
            <p className="text-xs text-text-secondary">Total write-ups</p>
          </div>
        </div>
        <div className="bg-white rounded-container border border-border-light p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-text-primary">{stats.sent}</p>
            <p className="text-xs text-text-secondary">Pending acknowledgement</p>
          </div>
        </div>
        <div className="bg-white rounded-container border border-border-light p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
            <XCircle className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-text-primary">{stats.refused}</p>
            <p className="text-xs text-text-secondary">Refused to sign</p>
          </div>
        </div>
        <div className="bg-white rounded-container border border-border-light p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-text-primary">{stats.acknowledged}</p>
            <p className="text-xs text-text-secondary">Acknowledged</p>
          </div>
        </div>
      </div>

      {/* ─── Toolbar ─── */}
      <div className="flex items-center justify-between mb-4">
        <SearchBox
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by name, title, or location..."
          className="w-72"
        />
        <Button
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => addToast('Opening write-up creation...', 'info')}
        >
          New Write-up
        </Button>
      </div>

      {/* ─── Filters ─── */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <div className="flex items-center gap-1.5 text-text-secondary mr-1">
          <Filter className="w-3.5 h-3.5" />
          <span className="text-xs font-medium">Filters</span>
        </div>

        {/* Location */}
        <div className="relative">
          <select
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
            className={`appearance-none h-8 pl-7 pr-7 rounded-full border text-xs font-medium cursor-pointer transition-colors ${
              filterLocation !== 'all'
                ? 'bg-primary-50 border-primary-300 text-primary-700'
                : 'bg-white border-border text-text-secondary hover:border-gray-400'
            }`}
          >
            <option value="all">All locations</option>
            {uniqueLocations.map((loc) => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
          <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none text-text-secondary" />
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none text-text-secondary" />
        </div>

        {/* Template */}
        <div className="relative">
          <select
            value={filterTemplate}
            onChange={(e) => setFilterTemplate(e.target.value)}
            className={`appearance-none h-8 pl-7 pr-7 rounded-full border text-xs font-medium cursor-pointer transition-colors ${
              filterTemplate !== 'all'
                ? 'bg-primary-50 border-primary-300 text-primary-700'
                : 'bg-white border-border text-text-secondary hover:border-gray-400'
            }`}
          >
            <option value="all">All templates</option>
            {uniqueTemplates.map((t) => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>
          <Briefcase className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none text-text-secondary" />
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none text-text-secondary" />
        </div>

        {/* Status */}
        <div className="relative">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={`appearance-none h-8 pl-7 pr-7 rounded-full border text-xs font-medium cursor-pointer transition-colors ${
              filterStatus !== 'all'
                ? 'bg-primary-50 border-primary-300 text-primary-700'
                : 'bg-white border-border text-text-secondary hover:border-gray-400'
            }`}
          >
            <option value="all">All statuses</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="sent">Pending</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="refused">Refused</option>
          </select>
          <CircleDot className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none text-text-secondary" />
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none text-text-secondary" />
        </div>

        {activeFilterCount > 0 && (
          <button
            onClick={clearAllFilters}
            className="flex items-center gap-1 h-8 px-3 rounded-full text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <X className="w-3 h-3" />
            Clear{activeFilterCount > 1 ? ` all (${activeFilterCount})` : ''}
          </button>
        )}
      </div>

      {/* ─── Bulk actions ─── */}
      {selectedRows.length > 0 && (
        <div className="sticky top-0 z-10 bg-primary-500 text-white rounded-container px-4 py-3 mb-3 flex items-center justify-between shadow-lg">
          <span className="text-sm font-medium">{selectedRows.length} selected</span>
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
              onClick={() => setSelectedRows([])}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* ─── Table ─── */}
      <div className="bg-white rounded-container border border-border-light overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border-light bg-gray-50/80">
              <th className="h-10 px-4 w-11">
                <Checkbox
                  checked={selectedRows.length === sorted.length && sorted.length > 0}
                  onChange={handleSelectAll}
                />
              </th>
              <th className="h-10 px-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                <button onClick={() => handleSort('employee')} className="flex items-center gap-1 hover:text-text-primary transition-colors">
                  Employee {getSortIcon('employee')}
                </button>
              </th>
              <th className="h-10 px-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider w-[150px]">
                <button onClick={() => handleSort('template')} className="flex items-center gap-1 hover:text-text-primary transition-colors">
                  Template {getSortIcon('template')}
                </button>
              </th>
              <th className="h-10 px-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider w-[130px]">
                <button onClick={() => handleSort('type')} className="flex items-center gap-1 hover:text-text-primary transition-colors">
                  Type {getSortIcon('type')}
                </button>
              </th>
              <th className="h-10 px-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider w-[140px]">
                <button onClick={() => handleSort('status')} className="flex items-center gap-1 hover:text-text-primary transition-colors">
                  Status {getSortIcon('status')}
                </button>
              </th>
              <th className="h-10 px-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider w-[110px]">
                <button onClick={() => handleSort('date')} className="flex items-center gap-1 hover:text-text-primary transition-colors">
                  Date {getSortIcon('date')}
                </button>
              </th>
              <th className="h-10 px-4 w-11" />
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-sm text-text-secondary">
                  No write-ups found
                </td>
              </tr>
            ) : (
              sorted.map((wu) => {
                const sc = statusConfig[wu.status]
                return (
                  <tr
                    key={wu.id}
                    onClick={() => setQuickViewWriteUp(wu)}
                    className={`border-b border-border-light last:border-b-0 cursor-pointer transition-colors ${
                      selectedRows.includes(wu.id)
                        ? 'bg-primary-50 hover:bg-primary-50'
                        : 'hover:bg-gray-50/60'
                    }`}
                  >
                    <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedRows.includes(wu.id)}
                        onChange={() => handleToggleRow(wu.id)}
                      />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate leading-5">
                          {wu.employeeName}
                        </p>
                        <p className="text-xs text-text-secondary/70 leading-4 truncate">
                          {wu.employeeRole} &middot; {wu.location}
                        </p>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-xs font-medium text-text-secondary bg-gray-100 px-2 py-1 rounded-md">
                        {getWriteUpTemplateName(wu.templateId)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-sm text-text-secondary">{typeLabels[wu.type]}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${sc.bgColor} ${sc.color}`}
                      >
                        {sc.icon}
                        {sc.label}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-sm text-text-secondary">{formatDate(wu.incidentDate)}</span>
                    </td>
                    <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                      <ContextMenu items={getMenuItems(wu)} />
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination footer */}
      <div className="flex items-center justify-between mt-4 px-4">
        <span className="text-sm text-text-secondary">
          Showing {sorted.length} of {writeUps.length} write-up{writeUps.length !== 1 ? 's' : ''}
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

      {/* Quick View Side Panel */}
      <WriteUpQuickView
        writeUp={quickViewWriteUp}
        onClose={() => setQuickViewWriteUp(null)}
      />
    </div>
  )
}

