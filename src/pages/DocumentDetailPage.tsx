import { useState, useMemo, useRef, useEffect } from 'react'
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
  ClipboardList,
  Ban,
  Filter,
  MapPin,
  Briefcase,
  CircleDot,
  Link2,
  Mail,
  MessageSquare,
  Copy,
  Users,
  Info,
} from 'lucide-react'
import SegmentedControl from '../components/ui/SegmentedControl'
import SearchBox from '../components/ui/SearchBox'
import Button from '../components/ui/Button'
import Checkbox from '../components/ui/Checkbox'
import MultiSelectDropdown from '../components/ui/MultiSelectDropdown'
import FilterSelect from '../components/ui/FilterSelect'
import ContextMenu, { ContextMenuItem } from '../components/ui/ContextMenu'
import { useToast } from '../components/ui/Toast'
import { DocumentDetail, AssignmentInstance, DocumentRecipient, TemplateCategory, locations, roles } from '../data/mockData'

interface DocumentDetailPageProps {
  document: DocumentDetail
  documentCategory?: TemplateCategory
  onBack: () => void
  onViewAssigneeTask?: (recipient: DocumentRecipient) => void
  onEditTemplate?: () => void
}

const tabs = [
  { id: 'status', label: 'Status' },
  { id: 'history', label: 'History' },
  { id: 'permissions', label: 'Permissions' },
  { id: 'auto-assign', label: 'Auto-assignment rules' },
]

const JOB_TITLE_OPTIONS = [
  'Server', 'Cook', 'Bartender', 'Host', 'Busser',
  'Dishwasher', 'Manager', 'Shift Lead', 'Prep Cook', 'Delivery Driver',
]

export default function DocumentDetailPage({ document, documentCategory, onBack, onViewAssigneeTask, onEditTemplate }: DocumentDetailPageProps) {
  const [activeTab, setActiveTab] = useState('status')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterLocation, setFilterLocation] = useState<string>('all')
  const [filterRole, setFilterRole] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [quickFilter, setQuickFilter] = useState<'all' | 'attention' | 'completed'>('all')
  const [expandedGroups, setExpandedGroups] = useState<string[]>(
    document.assignmentHistory?.length > 0 ? [document.assignmentHistory[0].id] : []
  )
  const { addToast } = useToast()

  // Template Settings state
  const [autoAssignEnabled, setAutoAssignEnabled] = useState(true)
  const [autoAssignJobTitles, setAutoAssignJobTitles] = useState<string[]>(['Server', 'Cook', 'Bartender'])
  const [autoAssignLocations, setAutoAssignLocations] = useState<string[]>([])
  const [autoAssignDelayDays, setAutoAssignDelayDays] = useState<number>(0)
  const [autoAssignDueDays, setAutoAssignDueDays] = useState<number>(7)
  const [selectedPermLocations, setSelectedPermLocations] = useState<string[]>([])
  const [selectedPermRoles, setSelectedPermRoles] = useState<string[]>([])
  const [settingsDirty, setSettingsDirty] = useState(false)

  const togglePermLocation = (locId: string) => {
    setSelectedPermLocations((prev) =>
      prev.includes(locId) ? prev.filter((l) => l !== locId) : [...prev, locId]
    )
    setSettingsDirty(true)
  }

  const togglePermRole = (roleId: string) => {
    setSelectedPermRoles((prev) =>
      prev.includes(roleId) ? prev.filter((r) => r !== roleId) : [...prev, roleId]
    )
    setSettingsDirty(true)
  }

  const handleSaveSettings = () => {
    addToast('Template settings saved successfully', 'success')
    setSettingsDirty(false)
  }

  // Derive unique filter options from all recipients
  const uniqueLocations = useMemo(
    () => [...new Set(document.recipients.map((r) => r.location))].sort(),
    [document.recipients]
  )
  const uniqueRoles = useMemo(
    () => [...new Set(document.recipients.map((r) => r.role))].sort(),
    [document.recipients]
  )
  const uniqueStatuses = useMemo(
    () => [...new Set(document.recipients.map((r) => r.status))].sort(),
    [document.recipients]
  )

  const statusLabel = (s: string) => {
    const map: Record<string, string> = {
      completed: 'Completed',
      refused: 'Refused',
      pending: 'Pending',
      collecting: 'Collecting',
      expiring: 'Expiring',
      expired: 'Expired',
      assigned: 'Assigned',
      pending_verification: 'Pending verification',
    }
    return map[s] || s
  }

  const activeFilterCount =
    (filterLocation !== 'all' ? 1 : 0) +
    (filterRole !== 'all' ? 1 : 0) +
    (filterStatus !== 'all' ? 1 : 0) +
    (quickFilter !== 'all' ? 1 : 0)

  const clearAllFilters = () => {
    setFilterLocation('all')
    setFilterRole('all')
    setFilterStatus('all')
    setQuickFilter('all')
  }

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId]
    )
  }

  const isTerminalTop = (r: DocumentRecipient) =>
    (r.status === 'completed' || r.status === 'refused') && !r.expiryDate

  // Filter and split recipients
  const filterRecipients = (recipients: DocumentRecipient[]) => {
    return recipients.filter((r) => {
      const matchesSearch =
        searchQuery === '' ||
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.role.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesLocation = filterLocation === 'all' || r.location === filterLocation
      const matchesRole = filterRole === 'all' || r.role === filterRole
      const matchesStatus = filterStatus === 'all' || r.status === filterStatus
      const matchesQuickFilter =
        quickFilter === 'all' ||
        (quickFilter === 'attention' && !isTerminalTop(r)) ||
        (quickFilter === 'completed' && isTerminalTop(r))
      return matchesSearch && matchesLocation && matchesRole && matchesStatus && matchesQuickFilter
    })
  }

  const filteredRecipients = filterRecipients(document.recipients)

  // Summary stats
  const totalAssigned = document.recipients.length
  const isTerminal = (r: DocumentRecipient) =>
    (r.status === 'completed' || r.status === 'refused') && !r.expiryDate
  const totalCompleted = document.recipients.filter(isTerminal).length
  const totalNeedsAttention = document.recipients.filter((r) => !isTerminal(r)).length

  // Split for status tab
  const trueCompleted = filteredRecipients.filter(isTerminal)
  const attention = filteredRecipients.filter((r) => !isTerminal(r))

  return (
    <div className="p-10 max-w-[1200px] mx-auto">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-body text-text-secondary hover:text-text-primary mb-4 -ml-1"
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
              <h1 className="text-title-4 text-text-primary">{document.name}</h1>
              <p className="text-body text-text-secondary">
                Created: {document.createdAt}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="accent-blue"
              leftIcon={<Send className="w-4 h-4" />}
              onClick={() => addToast('Opening assign dialog...', 'info')}
            >
              Assign
            </Button>
            <Button variant="plain-gray" leftIcon={<Eye className="w-4 h-4" />}>
              Preview
            </Button>
            <ContextMenu
              items={[
                {
                  id: 'edit',
                  label: 'Edit Template',
                  icon: <FileText className="w-4 h-4" />,
                  onClick: () => onEditTemplate ? onEditTemplate() : addToast('Editing template...', 'info'),
                },
                {
                  id: 'download',
                  label: 'Download All',
                  icon: <Download className="w-4 h-4" />,
                  onClick: () => addToast('A download link will be sent to your email shortly.', 'info'),
                },
              ]}
            />
          </div>
        </div>

      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between mb-4">
        <SegmentedControl
          segments={tabs}
          activeSegment={activeTab}
          onChange={setActiveTab}
        />
      </div>

      {/* Filters + Search (status tab) */}
      {activeTab === 'status' && (
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <div className="flex items-center gap-1.5 text-text-secondary mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span className="text-callout text-text-secondary">Filters</span>
          </div>

          <FilterSelect
            options={uniqueLocations.map((loc) => ({ id: loc, label: loc }))}
            value={filterLocation}
            onChange={setFilterLocation}
            allLabel="All locations"
            icon={<MapPin className="w-3.5 h-3.5" />}
          />

          <FilterSelect
            options={uniqueRoles.map((role) => ({ id: role, label: role }))}
            value={filterRole}
            onChange={setFilterRole}
            allLabel="All roles"
            icon={<Briefcase className="w-3.5 h-3.5" />}
          />

          <FilterSelect
            options={uniqueStatuses.map((s) => ({ id: s, label: statusLabel(s) }))}
            value={filterStatus}
            onChange={setFilterStatus}
            allLabel="All statuses"
            icon={<CircleDot className="w-3.5 h-3.5" />}
          />

          {activeFilterCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="flex items-center gap-1 h-8 px-3 rounded-element text-caption font-medium text-accent-red-500 hover:bg-red-50 transition-colors"
            >
              <X className="w-3 h-3" />
              Clear{activeFilterCount > 1 ? ` all (${activeFilterCount})` : ''}
            </button>
          )}

          <div className="ml-auto">
            <SearchBox
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search"
              className="w-56"
            />
          </div>
        </div>
      )}

      {/* Status Tab */}
      {activeTab === 'status' && (
        <div>
          {filteredRecipients.length > 0 ? (
            <StatusTable
              attentionRecipients={attention}
              completedRecipients={trueCompleted}
              documentCategory={documentCategory}
              onViewAssigneeTask={onViewAssigneeTask}
              documentName={document.name}
            />
          ) : (
            <div className="bg-white rounded-container border border-border-light p-12 text-center">
              <p className="text-body text-text-secondary">No team members found</p>
            </div>
          )}
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-text-primary">Assignment History</h2>
              <p className="text-sm text-text-secondary mt-0.5">Audit trail of all assignments of this document template.</p>
            </div>
            <SearchBox
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search"
              className="w-60"
            />
          </div>
          {document.assignmentHistory?.map((assignment) => (
            <AssignmentCard
              key={assignment.id}
              assignment={assignment}
              isExpanded={expandedGroups.includes(assignment.id)}
              onToggle={() => toggleGroup(assignment.id)}
              searchQuery={searchQuery}
              documentName={document.name}
            />
          ))}
          {(!document.assignmentHistory || document.assignmentHistory.length === 0) && (
            <div className="bg-white rounded-container border border-border-light p-8 text-center">
              <p className="text-body text-text-secondary">No assignment history</p>
            </div>
          )}
        </div>
      )}

      {/* Permissions Tab */}
      {activeTab === 'permissions' && (
        <div className="space-y-6 max-w-[800px]">
          <div className="bg-white rounded-container border border-border-light overflow-hidden">
            <div className="p-5 space-y-5">
              {/* Location restrictions */}
              <div>
                <label className="flex items-center gap-2 text-headline text-text-primary mb-1">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  Recipient locations
                </label>
                <p className="text-caption text-text-secondary mb-3">
                  Only employees at selected locations can receive this document. When assigning, only employees at these locations will appear in the recipient list.
                </p>
                <MultiSelectDropdown
                  options={locations.map((l) => ({ id: l.id, label: l.name }))}
                  selected={selectedPermLocations}
                  onChange={(values) => { setSelectedPermLocations(values); setSettingsDirty(true) }}
                  placeholder="Select locations…"
                  allLabel="All"
                />
                {selectedPermLocations.length === 0 ? (
                  <p className="text-caption text-text-secondary mt-1.5">
                    No restrictions — employees at any location can receive this document
                  </p>
                ) : (
                  <p className="text-caption text-primary-600 mt-1.5">
                    Only employees at {selectedPermLocations.map(id => locations.find(l => l.id === id)?.name).filter(Boolean).join(', ')} can receive this document
                  </p>
                )}
              </div>

              {/* Role permissions */}
              <div>
                <label className="flex items-center gap-2 text-headline text-text-primary mb-1">
                  <Users className="w-4 h-4 text-gray-500" />
                  Manager roles
                </label>
                <p className="text-caption text-text-secondary mb-3">
                  Only users with selected roles can see this template and assign it to employees. Users without these roles will not see this template in their Documents page.
                </p>
                <MultiSelectDropdown
                  options={roles.map((r) => ({ id: r.id, label: r.name }))}
                  selected={selectedPermRoles}
                  onChange={(values) => { setSelectedPermRoles(values); setSettingsDirty(true) }}
                  placeholder="Select roles…"
                  allLabel="All"
                />
                {selectedPermRoles.length === 0 ? (
                  <p className="text-caption text-text-secondary mt-1.5">
                    No restrictions — all managers can see and assign this template
                  </p>
                ) : (
                  <p className="text-caption text-primary-600 mt-1.5">
                    Only {selectedPermRoles.map(id => roles.find(r => r.id === id)?.name).filter(Boolean).join(', ')} can see and assign this template
                  </p>
                )}
              </div>

              {/* Summary info box */}
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-element space-y-1">
                <p className="text-callout text-purple-800">Access summary</p>
                <p className="text-caption text-purple-800">
                  <strong>Who can receive:</strong>{' '}
                  {selectedPermLocations.length === 0
                    ? 'Employees at any location.'
                    : `Only employees at ${selectedPermLocations.map(id => locations.find(l => l.id === id)?.name).filter(Boolean).join(', ')}.`}
                </p>
                <p className="text-caption text-purple-800">
                  <strong>Who can assign:</strong>{' '}
                  {selectedPermRoles.length === 0
                    ? 'All managers.'
                    : `Only ${selectedPermRoles.map(id => roles.find(r => r.id === id)?.name).filter(Boolean).join(', ')}.`}
                </p>
              </div>
            </div>
          </div>

          {settingsDirty && (
            <div className="flex justify-end pt-2">
              <Button variant="accent-blue" onClick={handleSaveSettings}>
                Save Settings
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Auto-assignment rules Tab */}
      {activeTab === 'auto-assign' && (
        <div className="space-y-6 max-w-[800px]">
          <div className="bg-white rounded-container border border-border-light overflow-hidden">
            <div className="p-5 space-y-5">
              {/* Enable toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-headline text-text-primary">Enable auto-assignment</label>
                  <p className="text-caption text-text-secondary mt-0.5">
                    Automatically assign this document when conditions are met
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => { setAutoAssignEnabled(!autoAssignEnabled); setSettingsDirty(true) }}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    autoAssignEnabled ? 'bg-primary-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      autoAssignEnabled ? 'right-1' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              {autoAssignEnabled && (
                <>
                  {/* How it works */}
                  <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-element">
                    <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-caption text-blue-800">
                      This document will be automatically assigned when a <strong>new employee is hired</strong> or an <strong>existing employee's job title changes</strong> to one of the selected job titles below.
                    </p>
                  </div>

                  {/* Job titles */}
                  <div>
                    <label className="block text-headline text-text-primary mb-2">
                      For employees with job title
                    </label>
                    <MultiSelectDropdown
                      options={JOB_TITLE_OPTIONS.map((t) => ({ id: t, label: t }))}
                      selected={autoAssignJobTitles}
                      onChange={(values) => { setAutoAssignJobTitles(values); setSettingsDirty(true) }}
                      placeholder="Select job titles…"
                      allLabel="All"
                    />
                    {autoAssignJobTitles.length === 0 && (
                      <p className="text-caption text-amber-600 mt-2 flex items-center gap-1">
                        <Info className="w-3 h-3" />
                        No job titles selected — will apply to all employees
                      </p>
                    )}
                  </div>

                  {/* Locations for auto-assign */}
                  <div>
                    <label className="block text-headline text-text-primary mb-2">
                      At locations
                    </label>
                    <p className="text-caption text-text-secondary mb-3">
                      Only employees at selected locations will be auto-assigned this document
                    </p>
                    <MultiSelectDropdown
                      options={locations.map((l) => ({ id: l.id, label: l.name }))}
                      selected={autoAssignLocations}
                      onChange={(values) => { setAutoAssignLocations(values); setSettingsDirty(true) }}
                      placeholder="Select locations…"
                      allLabel="All"
                    />
                    {autoAssignLocations.length === 0 && (
                      <p className="text-caption text-text-secondary mt-1.5">
                        No locations selected — will apply at all locations
                      </p>
                    )}
                  </div>

                  {/* Timing */}
                  <div className="p-4 bg-gray-50 border border-border-light rounded-element space-y-4">
                    <p className="text-callout text-text-secondary uppercase tracking-wider">Timing</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-headline text-text-primary mb-1.5">
                          Assign date
                        </label>
                        <p className="text-caption text-text-secondary mb-2">
                          Delay before the document is sent to the employee
                        </p>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={0}
                            value={autoAssignDelayDays}
                            onChange={(e) => { setAutoAssignDelayDays(Math.max(0, parseInt(e.target.value) || 0)); setSettingsDirty(true) }}
                            className="w-20 h-9 px-3 rounded-element border border-border bg-white text-body text-text-primary text-center focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          />
                          <span className="text-body text-text-secondary">
                            day{autoAssignDelayDays !== 1 ? 's' : ''} after trigger
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-headline text-text-primary mb-1.5">
                          Due date
                        </label>
                        <p className="text-caption text-text-secondary mb-2">
                          Deadline for the employee to complete the document
                        </p>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={1}
                            value={autoAssignDueDays}
                            onChange={(e) => { setAutoAssignDueDays(Math.max(1, parseInt(e.target.value) || 1)); setSettingsDirty(true) }}
                            className="w-20 h-9 px-3 rounded-element border border-border bg-white text-body text-text-primary text-center focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          />
                          <span className="text-body text-text-secondary">
                            day{autoAssignDueDays !== 1 ? 's' : ''} after trigger
                          </span>
                        </div>
                      </div>
                    </div>
                    {autoAssignDelayDays >= autoAssignDueDays && (
                      <div className="flex items-center gap-2 text-caption text-amber-600">
                        <Info className="w-3 h-3 flex-shrink-0" />
                        The due date should be after the assign date. The document would be sent on day {autoAssignDelayDays} but due on day {autoAssignDueDays}.
                      </div>
                    )}
                  </div>

                  {/* Rule preview */}
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-element">
                    <p className="text-caption text-blue-800">
                      <strong>Rule preview:</strong> When a new employee is hired or an existing employee acquires a job title
                      {autoAssignJobTitles.length > 0
                        ? ` matching ${autoAssignJobTitles.join(', ')}`
                        : ''}
                      {autoAssignLocations.length > 0
                        ? ` at ${autoAssignLocations.map(id => locations.find(l => l.id === id)?.name).filter(Boolean).join(' or ')}`
                        : ''}
                      , "{document.name}" will be assigned
                      {autoAssignDelayDays > 0
                        ? ` ${autoAssignDelayDays} day${autoAssignDelayDays !== 1 ? 's' : ''} after the trigger`
                        : ' immediately'}
                      {`, due within ${autoAssignDueDays} day${autoAssignDueDays !== 1 ? 's' : ''}`}.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {settingsDirty && (
            <div className="flex justify-end pt-2">
              <Button variant="accent-blue" onClick={handleSaveSettings}>
                Save Settings
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Bulk Actions Dropdown for multi-select bar
function BulkActionsDropdown({
  onSendReminder,
  onCancelAssignment,
  onDownloadCompleted,
}: {
  onSendReminder: () => void
  onCancelAssignment: () => void
  onDownloadCompleted: () => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const actions = [
    { id: 'remind', label: 'Send Reminder', icon: <Bell className="w-4 h-4" />, onClick: onSendReminder },
    { id: 'cancel', label: 'Cancel Assignment', icon: <UserX className="w-4 h-4" />, onClick: onCancelAssignment, variant: 'danger' as const },
    { id: 'download', label: 'Download completed documents', icon: <Download className="w-4 h-4" />, onClick: onDownloadCompleted },
  ]

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 h-8 px-3 rounded-element bg-white/20 hover:bg-white/30 text-white text-caption font-medium transition-colors cursor-pointer"
      >
        Bulk Actions
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-1 min-w-[260px] bg-white rounded-container border border-border-light shadow-dropdown py-0.5 z-50">
          {actions.map((action) => (
            <button
              key={action.id}
              onClick={() => {
                action.onClick()
                setIsOpen(false)
              }}
              className="relative flex items-center gap-3 w-full px-4 min-h-[44px] py-3 text-body text-left transition-colors group"
            >
              <span className="absolute inset-x-1 inset-y-0.5 rounded-element group-hover:bg-gray-50 transition-colors" />
              <span className={`relative ${action.variant === 'danger' ? 'text-red-500' : 'text-text-secondary'}`}>
                {action.icon}
              </span>
              <span className={`relative ${action.variant === 'danger' ? 'text-red-600' : 'text-text-primary'}`}>
                {action.label}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// Completed Table Component
function StatusTable({
  attentionRecipients,
  completedRecipients,
  documentCategory,
  onViewAssigneeTask,
  documentName,
}: {
  attentionRecipients: DocumentRecipient[]
  completedRecipients: DocumentRecipient[]
  documentCategory?: TemplateCategory
  onViewAssigneeTask?: (recipient: DocumentRecipient) => void
  documentName: string
}) {
  const allRecipients = [...attentionRecipients, ...completedRecipients]
  const [selected, setSelected] = useState<string[]>([])
  const [reviewingRecipient, setReviewingRecipient] = useState<DocumentRecipient | null>(null)
  const [sharingRecipient, setSharingRecipient] = useState<DocumentRecipient | null>(null)
  const [showBulkReminder, setShowBulkReminder] = useState(false)
  const [cancellingRecipient, setCancellingRecipient] = useState<DocumentRecipient | null>(null)
  const [showBulkCancel, setShowBulkCancel] = useState(false)
  const { addToast } = useToast()

  const toggleRow = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]))
  const toggleAll = () =>
    setSelected((prev) => (prev.length === allRecipients.length ? [] : allRecipients.map((r) => r.id)))

  const isTerminal = (r: DocumentRecipient) =>
    (r.status === 'completed' || r.status === 'refused') && !r.expiryDate

  const getStatusDisplay = (recipient: DocumentRecipient) => {
    if (recipient.status === 'completed') {
      return { text: 'Completed', className: 'text-green-600 bg-green-50' }
    }
    if (recipient.status === 'refused') {
      return { text: 'Refused', className: 'text-red-600 bg-red-50' }
    }
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
    if (isTerminal(recipient)) {
      return { label: recipient.status === 'refused' ? 'Refused' : 'Completed', value: recipient.completedDate || '-' }
    }
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
    if (documentCategory === 'write-up' && (recipient.status === 'pending' || recipient.status === 'assigned')) {
      items.push({
        id: 'mark-refused',
        label: 'Mark as refused to sign',
        icon: <Ban className="w-4 h-4" />,
        variant: 'danger',
        onClick: () => addToast(`${recipient.name} marked as "Refused to sign"`, 'warning'),
      })
    }
    items.push({
      id: 'view-assignee-task',
      label: 'View assignee task',
      icon: <ClipboardList className="w-4 h-4" />,
      onClick: () => onViewAssigneeTask?.(recipient),
    })
    items.push({
      id: 'share-link',
      label: 'Share document link',
      icon: <Link2 className="w-4 h-4" />,
      onClick: () => setSharingRecipient(recipient),
    })
    if (!isTerminal(recipient)) {
      items.push({
        id: 'resend',
        label: 'Resend',
        icon: <Send className="w-4 h-4" />,
        onClick: () => addToast(`Document resent to ${recipient.name}`, 'success'),
      })
    }
    items.push({
      id: 'view',
      label: 'View Document',
      icon: <Eye className="w-4 h-4" />,
      onClick: () => addToast(`Viewing document for ${recipient.name}`, 'info'),
    })
    if (isTerminal(recipient)) {
      items.push({
        id: 'download',
        label: 'Download completed documents',
        icon: <Download className="w-4 h-4" />,
        onClick: () => addToast(`A download link for ${recipient.name}'s documents will be sent to your email.`, 'info'),
      })
    } else {
      items.push({
        id: 'cancel',
        label: 'Cancel Assignment',
        icon: <UserX className="w-4 h-4" />,
        variant: 'danger',
        onClick: () => setCancellingRecipient(recipient),
      })
    }
    return items
  }

  const renderRow = (recipient: DocumentRecipient) => {
    const status = getStatusDisplay(recipient)
    const date = getDateDisplay(recipient)
    const isPendingVerification = recipient.status === 'pending_verification'
    const terminal = isTerminal(recipient)

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
            <p className="text-headline text-text-primary">{recipient.name}</p>
            <p className="text-caption text-text-secondary">{recipient.role}</p>
          </div>
        </td>
        <td className="h-14 px-5">
          <span className="text-body text-text-primary">{recipient.location}</span>
        </td>
        <td className="h-14 px-5">
          <span
            className={`inline-flex items-center px-2 py-1 rounded text-caption font-medium ${status.className}`}
          >
            {status.text}
          </span>
        </td>
        <td className="h-14 px-5">
          <div>
            <p className="text-body text-text-primary">{date.value}</p>
            <p className="text-caption text-text-secondary">{date.label}</p>
          </div>
        </td>
        <td className="h-14 px-5">
          <div className="flex items-center justify-end gap-2">
            {isPendingVerification ? (
              <Button
                variant="plain-gray"
                size="sm"
                leftIcon={<Eye className="w-3.5 h-3.5" />}
                onClick={() => setReviewingRecipient(recipient)}
                className="text-purple-600 border-purple-300 hover:bg-purple-50"
              >
                Review
              </Button>
            ) : !terminal ? (
              <Button
                variant="clear"
                size="sm"
                leftIcon={<Bell className="w-3.5 h-3.5" />}
                onClick={() => setSharingRecipient(recipient)}
                className="text-amber-600 hover:bg-amber-50"
              >
                Remind
              </Button>
            ) : null}
            <ContextMenu items={getMenuItems(recipient)} />
          </div>
        </td>
      </tr>
    )
  }

  return (
    <div className="relative">
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

      {sharingRecipient && (
        <ShareDocumentLinkModal
          recipient={sharingRecipient}
          documentName={documentName}
          onClose={() => setSharingRecipient(null)}
        />
      )}

      {showBulkReminder && (
        <ShareDocumentLinkModal
          bulkCount={selected.length}
          documentName={documentName}
          onClose={() => {
            setShowBulkReminder(false)
            setSelected([])
          }}
        />
      )}

      {cancellingRecipient && (
        <CancelAssignmentModal
          recipientName={cancellingRecipient.name}
          onConfirm={() => {
            addToast(`Assignment cancelled for ${cancellingRecipient.name}`, 'warning')
            setCancellingRecipient(null)
          }}
          onClose={() => setCancellingRecipient(null)}
        />
      )}

      {showBulkCancel && (
        <CancelAssignmentModal
          bulkCount={selected.length}
          onConfirm={() => {
            addToast(`${selected.length} assignment(s) cancelled`, 'warning')
            setShowBulkCancel(false)
            setSelected([])
          }}
          onClose={() => setShowBulkCancel(false)}
        />
      )}

      {selected.length > 0 && (
        <div className="sticky top-0 z-10 bg-primary-500 text-white rounded-container px-4 py-3 mb-3 flex items-center gap-3 shadow-lg">
          <button
            onClick={() => setSelected([])}
            className="text-white/80 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <span className="text-body font-medium">{selected.length} items selected</span>
          <BulkActionsDropdown
            onSendReminder={() => setShowBulkReminder(true)}
            onCancelAssignment={() => setShowBulkCancel(true)}
            onDownloadCompleted={() => {
              addToast(`A download link for ${selected.length} completed document(s) will be sent to your email.`, 'info')
              setSelected([])
            }}
          />
        </div>
      )}
      <div className="bg-white rounded-container border border-border-light overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-border-light">
                <th className="h-11 px-4 w-12">
                  <Checkbox checked={selected.length === allRecipients.length && allRecipients.length > 0} onChange={toggleAll} />
                </th>
                <th className="h-11 px-5 text-left text-callout text-text-secondary uppercase tracking-wider w-[25%]">
                  Name
                </th>
                <th className="h-11 px-5 text-left text-callout text-text-secondary uppercase tracking-wider w-[18%]">
                  Location
                </th>
                <th className="h-11 px-5 text-left text-callout text-text-secondary uppercase tracking-wider w-[18%]">
                  Status
                </th>
                <th className="h-11 px-5 text-left text-callout text-text-secondary uppercase tracking-wider w-[18%]">
                  Date
                </th>
                <th className="h-11 px-5 text-right text-callout text-text-secondary uppercase tracking-wider w-[140px]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {attentionRecipients.map(renderRow)}
              {attentionRecipients.length > 0 && completedRecipients.length > 0 && (
                <tr>
                  <td colSpan={6} className="h-9 px-5 bg-gray-50 border-b border-border-light">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                      <span className="text-callout text-text-secondary uppercase tracking-wider">
                        Completed ({completedRecipients.length})
                      </span>
                    </div>
                  </td>
                </tr>
              )}
              {completedRecipients.map(renderRow)}
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
            <h3 className="text-title-4 text-text-primary">Review Submission</h3>
            <p className="text-body text-text-secondary">
              {recipient.name} · {recipient.role} · {recipient.location}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-50 transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Uploaded document preview */}
          <div>
            <label className="flex items-center gap-2 text-headline text-text-primary mb-3">
              <ImageIcon className="w-4 h-4 text-gray-500" />
              Uploaded Document
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 p-8 flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center mb-3">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-headline text-text-primary mb-1">
                {recipient.name.replace(/\s+/g, '_')}_certificate.jpg
              </p>
              <p className="text-caption text-text-secondary mb-3">Uploaded by employee</p>
              <Button variant="plain-gray" size="sm" leftIcon={<Eye className="w-3.5 h-3.5" />}>
                View Full Image
              </Button>
            </div>
          </div>

          {/* OCR-captured expiration date */}
          <div>
            <label className="flex items-center gap-2 text-headline text-text-primary mb-3">
              <Calendar className="w-4 h-4 text-gray-500" />
              Expiration Date
            </label>
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-border-light">
              <div className="flex-1">
                <p className="text-body text-text-secondary mb-1">Detected via OCR</p>
                <p className="text-lg font-semibold text-text-primary">
                  {recipient.uploadedExpiryDate || 'Not detected'}
                </p>
              </div>
              <div className="w-px h-10 bg-border-light" />
              <div className="flex-1">
                <p className="text-body text-text-secondary mb-1">Status</p>
                {recipient.uploadedExpiryDate ? (
                  <span className="inline-flex items-center gap-1.5 text-headline text-green-600">
                    <Check className="w-4 h-4" />
                    Date captured successfully
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-headline text-amber-600">
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
            <p className="text-caption text-blue-800">
              Please verify that the uploaded document matches the employee's information and that the
              expiration date is correct. If it's wrong, the employee will be asked to re-upload.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border-light bg-gray-50">
          <Button variant="clear" onClick={onClose}>
            Cancel
          </Button>
          <div className="flex items-center gap-3">
            <Button
              variant="plain-gray"
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

// ── Share Document Link Modal ────────────────────────────────────────
// When `recipient` is provided → single-recipient "Share document link" mode.
// When `bulkCount` is provided instead → bulk "Send reminder" mode.
function ShareDocumentLinkModal({
  recipient,
  bulkCount,
  documentName,
  onClose,
}: {
  recipient?: DocumentRecipient | null
  bulkCount?: number
  documentName: string
  onClose: () => void
}) {
  const { addToast } = useToast()
  const isBulk = !recipient && (bulkCount ?? 0) > 0

  const taskLink = recipient
    ? `https://docs.workstream.us/task/${recipient.id}`
    : ''

  const defaultMessage = isBulk
    ? `Hi {{first_name}},\n\nThis is a friendly reminder to complete your document "${documentName}".\n\nPlease click the link below to complete your task:\n\nhttps://docs.workstream.us/task/{{task_id}}`
    : `Hi ${recipient?.name.split(' ')[0]},\n\nThis is a friendly reminder to complete your document "${documentName}".\n\nPlease click the link below to complete your task:\n\n${taskLink}`

  const [message, setMessage] = useState(defaultMessage)
  const [sendEmail, setSendEmail] = useState(true)
  const [sendSms, setSendSms] = useState(true)

  const handleCopyLink = () => {
    if (isBulk) return
    navigator.clipboard.writeText(taskLink).catch(() => {})
    addToast('Link copied to clipboard', 'success')
  }

  const handleSendMessage = () => {
    const channels: string[] = []
    if (sendEmail) channels.push('email')
    if (sendSms) channels.push('SMS')
    if (channels.length === 0) {
      addToast('Please select at least one delivery method', 'warning')
      return
    }
    if (isBulk) {
      addToast(`Reminder sent to ${bulkCount} recipient(s) via ${channels.join(' and ')}`, 'success')
    } else {
      addToast(`Reminder sent to ${recipient?.name} via ${channels.join(' and ')}`, 'success')
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-light">
          <h3 className="text-title-4 text-text-primary">
            {isBulk ? 'Send reminder' : 'Share document link'}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-50 transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Bulk info banner */}
          {isBulk && (
            <div className="flex items-center gap-2.5 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
              <Bell className="w-4 h-4 text-blue-500 flex-shrink-0" />
              <p className="text-caption text-blue-800">
                This reminder will be sent to <span className="font-semibold">{bulkCount} recipient{bulkCount !== 1 ? 's' : ''}</span>. Use <code className="bg-blue-100 px-1 rounded text-[11px]">{'{{first_name}}'}</code> to personalise the message.
              </p>
            </div>
          )}

          {/* Editable message */}
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={7}
            className="w-full rounded-element border border-border bg-white px-3 py-2 text-body text-text-primary leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
          />

          {/* Delivery checkboxes */}
          <div className="flex flex-wrap items-center gap-6">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={sendEmail}
                onChange={(e) => setSendEmail(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-primary-500 focus:ring-primary-500 cursor-pointer"
              />
              <Mail className="w-4 h-4 text-gray-400" />
              <span className="text-body text-text-primary">
                {isBulk ? (
                  <>Send via email to <span className="font-medium">all recipients</span></>
                ) : (
                  <>Send via email to <span className="font-medium">{recipient?.email}</span></>
                )}
              </span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={sendSms}
                onChange={(e) => setSendSms(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-primary-500 focus:ring-primary-500 cursor-pointer"
              />
              <MessageSquare className="w-4 h-4 text-gray-400" />
              <span className="text-body text-text-primary">
                {isBulk ? (
                  <>Send via text to <span className="font-medium">all recipients</span></>
                ) : (
                  <>Send via text to <span className="font-medium">{recipient?.phone}</span></>
                )}
              </span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border-light bg-gray-50">
          <button
            onClick={handleCopyLink}
            disabled={isBulk}
            className={`flex items-center gap-2 px-4 py-2.5 text-body font-medium rounded-lg transition-colors ${
              isBulk
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-text-secondary hover:text-text-primary hover:bg-gray-50'
            }`}
          >
            <Copy className="w-4 h-4" />
            Copy link
          </button>
          <Button
            variant="accent-blue"
            leftIcon={<Send className="w-4 h-4" />}
            onClick={handleSendMessage}
          >
            Send message
          </Button>
        </div>
      </div>
    </div>
  )
}

// ── Cancel Assignment Confirmation Modal ─────────────────────────────
function CancelAssignmentModal({
  recipientName,
  bulkCount,
  onConfirm,
  onClose,
}: {
  recipientName?: string
  bulkCount?: number
  onConfirm: () => void
  onClose: () => void
}) {
  const isBulk = !recipientName && (bulkCount ?? 0) > 0
  const label = isBulk
    ? `${bulkCount} assignment${bulkCount !== 1 ? 's' : ''}`
    : `the assignment for ${recipientName}`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-light">
          <h3 className="text-title-4 text-text-primary">Cancel assignment</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-50 transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-body text-text-primary">
            Are you sure you want to cancel {label}?
          </p>
          <div className="flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-caption text-amber-800">
              {isBulk
                ? 'All selected recipients\u2019 document links will expire and become inaccessible. This action cannot be undone.'
                : 'This recipient\u2019s document link will expire and become inaccessible. This action cannot be undone.'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border-light bg-gray-50">
          <Button variant="clear" onClick={onClose}>
            Go back
          </Button>
          <Button
            variant="accent-blue"
            leftIcon={<UserX className="w-4 h-4" />}
            onClick={onConfirm}
            className="!bg-red-600 hover:!bg-red-700"
          >
            Cancel assignment
          </Button>
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
  documentName: string
}

function AssignmentCard({
  assignment,
  isExpanded,
  onToggle,
  searchQuery,
  documentName,
}: AssignmentCardProps) {
  const { addToast } = useToast()
  const [sharingRecipient, setSharingRecipient] = useState<DocumentRecipient | null>(null)
  const [cancellingRecipient, setCancellingRecipient] = useState<DocumentRecipient | null>(null)
  const [showCancelAll, setShowCancelAll] = useState(false)

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
      id: 'share-link',
      label: 'Share document link',
      icon: <Link2 className="w-4 h-4" />,
      onClick: () => setSharingRecipient(recipient),
    },
    {
      id: 'remind',
      label: 'Send Reminder',
      icon: <Bell className="w-4 h-4" />,
      onClick: () => setSharingRecipient(recipient),
    },
    {
      id: 'cancel',
      label: 'Cancel Assignment',
      icon: <UserX className="w-4 h-4" />,
      variant: 'danger',
      onClick: () => setCancellingRecipient(recipient),
    },
  ]

  return (
    <div className="bg-white rounded-container border border-border-light overflow-hidden">
      {/* Share document link modal */}
      {sharingRecipient && (
        <ShareDocumentLinkModal
          recipient={sharingRecipient}
          documentName={documentName}
          onClose={() => setSharingRecipient(null)}
        />
      )}

      {/* Individual cancel confirmation */}
      {cancellingRecipient && (
        <CancelAssignmentModal
          recipientName={cancellingRecipient.name}
          onConfirm={() => {
            addToast(`Assignment cancelled for ${cancellingRecipient.name}`, 'warning')
            setCancellingRecipient(null)
          }}
          onClose={() => setCancellingRecipient(null)}
        />
      )}

      {/* Cancel all confirmation */}
      {showCancelAll && (
        <CancelAssignmentModal
          bulkCount={assignment.recipientCount}
          onConfirm={() => {
            addToast('All assignments cancelled', 'warning')
            setShowCancelAll(false)
          }}
          onClose={() => setShowCancelAll(false)}
        />
      )}

      {/* Card Header */}
      <div className="p-5 cursor-pointer hover:bg-gray-50 transition-colors" onClick={onToggle}>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-2.5">
            <div className="mt-0.5 w-5 h-5 flex items-center justify-center flex-shrink-0">
              <ChevronDown
                className={`w-4 h-4 text-gray-500 transition-transform ${
                  isExpanded ? '' : '-rotate-90'
                }`}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-callout text-text-primary">
                  Assigned to {assignment.recipientCount} recipient
                  {assignment.recipientCount !== 1 ? 's' : ''}
                </h3>
              </div>
              <p className="text-caption text-text-secondary mt-0.5">
                {assignment.assignedDate} by {assignment.assignedBy}
                {' · '}{assignment.completedCount}/{assignment.recipientCount} completed
                {assignment.cancelledCount > 0 ? ` · ${assignment.cancelledCount} cancelled` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2" onClick={(e) => e.stopPropagation()}>
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
                  onClick: () => setShowCancelAll(true),
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
                  <th className="h-12 px-5 text-left text-callout text-text-secondary uppercase tracking-wider">
                    Member
                  </th>
                  <th className="h-12 px-5 text-left text-callout text-text-secondary uppercase tracking-wider">
                    Location
                  </th>
                  <th className="h-12 px-5 text-left text-callout text-text-secondary uppercase tracking-wider">
                    Status
                  </th>
                  <th className="h-12 px-5 text-left text-callout text-text-secondary uppercase tracking-wider">
                    Completed Date
                  </th>
                  <th className="h-12 px-5 text-left text-callout text-text-secondary uppercase tracking-wider">
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
                        <p className="text-headline text-text-primary">{recipient.name}</p>
                        <p className="text-caption text-text-secondary">{recipient.role}</p>
                      </div>
                    </td>
                    <td className="h-14 px-5">
                      <span className="text-body text-text-primary">{recipient.location}</span>
                    </td>
                    <td className="h-14 px-5">
                      <span
                        className={`text-body ${
                          recipient.status === 'completed'
                            ? 'text-green-600'
                            : recipient.status === 'refused'
                            ? 'text-red-600'
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
                      <span className="text-body text-text-primary">
                        {recipient.completedDate || '-'}
                      </span>
                    </td>
                    <td className="h-14 px-5">
                      <span className="text-body text-text-primary">
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
                <p className="text-body text-text-secondary">
                  No recipients match your search
                </p>
              </div>
            )}
          </div>

          {/* Footer with pagination */}
          <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-border-light">
            <button
              className="w-8 h-8 flex items-center justify-center rounded-element border border-border-light hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled
            >
              <ChevronLeft className="w-4 h-4 text-gray-400" />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-element border border-border-light hover:bg-gray-50 transition-colors">
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </>
      )}
    </div>
  )
}
