import { useState, useMemo } from 'react'
import {
  ArrowLeft,
  FileText,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
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
  Settings,
  Info,
  Shield,
} from 'lucide-react'
import SegmentedControl from '../components/ui/SegmentedControl'
import SearchBox from '../components/ui/SearchBox'
import Button from '../components/ui/Button'
import Checkbox from '../components/ui/Checkbox'
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
  { id: 'settings', label: 'Template Settings' },
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
  const [expandedGroups, setExpandedGroups] = useState<string[]>(
    document.assignmentHistory?.map((a) => a.id) || []
  )
  const { addToast } = useToast()

  // Template Settings state
  const [autoAssignEnabled, setAutoAssignEnabled] = useState(true)
  const [autoAssignTrigger, setAutoAssignTrigger] = useState<'hire' | 'job_change' | 'location_change'>('hire')
  const [autoAssignJobTitles, setAutoAssignJobTitles] = useState<string[]>(['Server', 'Cook', 'Bartender'])
  const [autoAssignLocations, setAutoAssignLocations] = useState<string[]>([])
  const [selectedPermLocations, setSelectedPermLocations] = useState<string[]>([])
  const [selectedPermRoles, setSelectedPermRoles] = useState<string[]>([])
  const [permissionsExpanded, setPermissionsExpanded] = useState(true)
  const [autoAssignExpanded, setAutoAssignExpanded] = useState(true)
  const [settingsDirty, setSettingsDirty] = useState(false)

  const toggleAutoAssignJobTitle = (title: string) => {
    setAutoAssignJobTitles((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    )
    setSettingsDirty(true)
  }

  const toggleAutoAssignLocation = (locId: string) => {
    setAutoAssignLocations((prev) =>
      prev.includes(locId) ? prev.filter((l) => l !== locId) : [...prev, locId]
    )
    setSettingsDirty(true)
  }

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
    (filterStatus !== 'all' ? 1 : 0)

  const clearAllFilters = () => {
    setFilterLocation('all')
    setFilterRole('all')
    setFilterStatus('all')
  }

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId]
    )
  }

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
      return matchesSearch && matchesLocation && matchesRole && matchesStatus
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
                  onClick: () => onEditTemplate ? onEditTemplate() : addToast('Editing template...', 'info'),
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
      <div className="flex items-center justify-between mb-4">
        <SegmentedControl
          segments={tabs}
          activeSegment={activeTab}
          onChange={setActiveTab}
        />
        {activeTab !== 'settings' && (
          <SearchBox
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search"
            className="w-60"
          />
        )}
      </div>

      {/* Filters */}
      {activeTab === 'status' && (
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <div className="flex items-center gap-1.5 text-text-secondary mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">Filters</span>
          </div>

          {/* Location filter */}
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

          {/* Role filter */}
          <div className="relative">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className={`appearance-none h-8 pl-7 pr-7 rounded-full border text-xs font-medium cursor-pointer transition-colors ${
                filterRole !== 'all'
                  ? 'bg-primary-50 border-primary-300 text-primary-700'
                  : 'bg-white border-border text-text-secondary hover:border-gray-400'
              }`}
            >
              <option value="all">All roles</option>
              {uniqueRoles.map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
            <Briefcase className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none text-text-secondary" />
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none text-text-secondary" />
          </div>

          {/* Status filter */}
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
              {uniqueStatuses.map((s) => (
                <option key={s} value={s}>{statusLabel(s)}</option>
              ))}
            </select>
            <CircleDot className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none text-text-secondary" />
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none text-text-secondary" />
          </div>

          {/* Clear all */}
          {activeFilterCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="flex items-center gap-1 h-8 px-3 rounded-full text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              <X className="w-3 h-3" />
              Clear {activeFilterCount > 1 ? `all (${activeFilterCount})` : ''}
            </button>
          )}
        </div>
      )}

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
              <NeedsAttentionTable recipients={attention} documentCategory={documentCategory} onViewAssigneeTask={onViewAssigneeTask} documentName={document.name} />
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
              <CompletedTable recipients={trueCompleted} documentCategory={documentCategory} onViewAssigneeTask={onViewAssigneeTask} documentName={document.name} />
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
                  documentName={document.name}
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

      {/* Template Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6 max-w-[800px]">
          {/* ── Auto-Assignment Rules ── */}
          <div className="bg-white rounded-container border border-border-light overflow-hidden">
            <button
              type="button"
              onClick={() => setAutoAssignExpanded(!autoAssignExpanded)}
              className="flex items-center justify-between w-full p-5 text-left hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">Auto-Assignment Rules</p>
                  <p className="text-xs text-text-secondary">
                    {autoAssignEnabled
                      ? `Automatically assign on ${
                          autoAssignTrigger === 'hire'
                            ? 'new hire'
                            : autoAssignTrigger === 'job_change'
                            ? 'job title change'
                            : 'location change'
                        }`
                      : 'Manual assignment only'}
                  </p>
                </div>
              </div>
              {autoAssignExpanded ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {autoAssignExpanded && (
              <div className="border-t border-border-light p-5 space-y-5">
                {/* Enable toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-text-primary">Enable auto-assignment</label>
                    <p className="text-xs text-text-secondary mt-0.5">
                      Automatically request this document when conditions are met
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
                    {/* Trigger selection */}
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Assign when
                      </label>
                      <div className="flex gap-2">
                        {([
                          { id: 'hire' as const, label: 'Employee is hired' },
                          { id: 'job_change' as const, label: 'Job title changes' },
                          { id: 'location_change' as const, label: 'Location changes' },
                        ]).map((trigger) => (
                          <button
                            key={trigger.id}
                            type="button"
                            onClick={() => { setAutoAssignTrigger(trigger.id); setSettingsDirty(true) }}
                            className={`flex-1 px-3 py-2.5 rounded-element border text-sm font-medium transition-all ${
                              autoAssignTrigger === trigger.id
                                ? 'border-primary-500 bg-primary-50 text-primary-700'
                                : 'border-border-light hover:border-gray-300 text-text-primary'
                            }`}
                          >
                            {trigger.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Job titles */}
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        For employees with job title
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {JOB_TITLE_OPTIONS.map((title) => (
                          <button
                            key={title}
                            type="button"
                            onClick={() => toggleAutoAssignJobTitle(title)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                              autoAssignJobTitles.includes(title)
                                ? 'bg-primary-500 text-white'
                                : 'bg-gray-100 text-text-primary hover:bg-gray-200'
                            }`}
                          >
                            {title}
                          </button>
                        ))}
                      </div>
                      {autoAssignJobTitles.length === 0 && (
                        <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                          <Info className="w-3 h-3" />
                          No job titles selected — will apply to all employees
                        </p>
                      )}
                    </div>

                    {/* Locations for auto-assign */}
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        At locations
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {locations.map((location) => (
                          <button
                            key={location.id}
                            type="button"
                            onClick={() => toggleAutoAssignLocation(location.id)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                              autoAssignLocations.includes(location.id)
                                ? 'bg-primary-500 text-white'
                                : 'bg-gray-100 text-text-primary hover:bg-gray-200'
                            }`}
                          >
                            {location.name}
                          </button>
                        ))}
                      </div>
                      {autoAssignLocations.length === 0 && (
                        <p className="text-xs text-text-secondary mt-1.5">
                          No locations selected — will apply at all locations
                        </p>
                      )}
                    </div>

                    {/* Rule preview */}
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-element">
                      <p className="text-xs text-blue-800">
                        <strong>Rule preview:</strong> When{' '}
                        {autoAssignTrigger === 'hire'
                          ? 'a new employee is hired'
                          : autoAssignTrigger === 'job_change'
                          ? "an employee's job title changes"
                          : "an employee's location changes"}
                        {autoAssignJobTitles.length > 0
                          ? ` as ${autoAssignJobTitles.join(' or ')}`
                          : ''}
                        {autoAssignLocations.length > 0
                          ? ` at ${autoAssignLocations.map(id => locations.find(l => l.id === id)?.name).filter(Boolean).join(' or ')}`
                          : ''}
                        , automatically assign "{document.name}".
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* ── Permissions ── */}
          <div className="bg-white rounded-container border border-border-light overflow-hidden">
            <button
              type="button"
              onClick={() => setPermissionsExpanded(!permissionsExpanded)}
              className="flex items-center justify-between w-full p-5 text-left hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">Permissions</p>
                  <p className="text-xs text-text-secondary">
                    {selectedPermLocations.length === 0 && selectedPermRoles.length === 0
                      ? 'All locations and roles can use this template'
                      : `${selectedPermLocations.length} location(s), ${selectedPermRoles.length} role(s) selected`}
                  </p>
                </div>
              </div>
              {permissionsExpanded ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {permissionsExpanded && (
              <div className="border-t border-border-light p-5 space-y-5">
                {/* Location permissions */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-text-primary mb-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    Locations
                  </label>
                  <p className="text-xs text-text-secondary mb-3">
                    Restrict which locations can use and assign this template
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {locations.map((location) => (
                      <button
                        key={location.id}
                        type="button"
                        onClick={() => togglePermLocation(location.id)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                          selectedPermLocations.includes(location.id)
                            ? 'bg-primary-500 text-white'
                            : 'bg-gray-100 text-text-primary hover:bg-gray-200'
                        }`}
                      >
                        {location.name}
                      </button>
                    ))}
                  </div>
                  {selectedPermLocations.length === 0 && (
                    <p className="text-xs text-text-secondary mt-1.5">
                      No locations selected = available at all locations
                    </p>
                  )}
                </div>

                {/* Role permissions */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-text-primary mb-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    Roles that can use this template
                  </label>
                  <p className="text-xs text-text-secondary mb-3">
                    Restrict which manager roles can assign and manage this template
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {roles.map((role) => (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => togglePermRole(role.id)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                          selectedPermRoles.includes(role.id)
                            ? 'bg-primary-500 text-white'
                            : 'bg-gray-100 text-text-primary hover:bg-gray-200'
                        }`}
                      >
                        {role.name}
                      </button>
                    ))}
                  </div>
                  {selectedPermRoles.length === 0 && (
                    <p className="text-xs text-text-secondary mt-1.5">
                      No roles selected = available to all managers
                    </p>
                  )}
                </div>

                {/* Summary info box */}
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-element">
                  <p className="text-xs text-purple-800">
                    <strong>Access summary:</strong>{' '}
                    {selectedPermLocations.length === 0 && selectedPermRoles.length === 0
                      ? 'All managers at all locations can use this template.'
                      : `${
                          selectedPermRoles.length > 0
                            ? selectedPermRoles.map(id => roles.find(r => r.id === id)?.name).filter(Boolean).join(', ')
                            : 'All roles'
                        } at ${
                          selectedPermLocations.length > 0
                            ? selectedPermLocations.map(id => locations.find(l => l.id === id)?.name).filter(Boolean).join(', ')
                            : 'all locations'
                        } can use this template.`}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Save button */}
          {settingsDirty && (
            <div className="flex justify-end pt-2">
              <Button variant="primary" onClick={handleSaveSettings}>
                Save Settings
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Completed Table Component
function CompletedTable({ recipients, documentCategory, onViewAssigneeTask, documentName }: { recipients: DocumentRecipient[]; documentCategory?: TemplateCategory; onViewAssigneeTask?: (recipient: DocumentRecipient) => void; documentName: string }) {
  const [selected, setSelected] = useState<string[]>([])
  const [sharingRecipient, setSharingRecipient] = useState<DocumentRecipient | null>(null)
  const { addToast } = useToast()
  const hasRefused = recipients.some((r) => r.status === 'refused')

  const toggleRow = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]))
  const toggleAll = () =>
    setSelected((prev) => (prev.length === recipients.length ? [] : recipients.map((r) => r.id)))

  const getMenuItems = (recipient: DocumentRecipient): ContextMenuItem[] => [
    {
      id: 'view-assignee-task',
      label: 'View assignee task',
      icon: <ClipboardList className="w-4 h-4" />,
      onClick: () => onViewAssigneeTask?.(recipient),
    },
    {
      id: 'share-link',
      label: 'Share document link',
      icon: <Link2 className="w-4 h-4" />,
      onClick: () => setSharingRecipient(recipient),
    },
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
      {/* Share document link modal */}
      {sharingRecipient && (
        <ShareDocumentLinkModal
          recipient={sharingRecipient}
          documentName={documentName}
          onClose={() => setSharingRecipient(null)}
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
                <th className="h-11 px-5 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider w-[20%]">
                  Location
                </th>
                {hasRefused && (
                  <th className="h-11 px-5 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider w-[15%]">
                    Status
                  </th>
                )}
                <th className="h-11 px-5 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider w-[20%]">
                  Date
                </th>
                <th className="h-11 px-3 w-12"></th>
              </tr>
            </thead>
            <tbody>
              {recipients.map((recipient) => {
                const isRefused = recipient.status === 'refused'
                return (
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
                    {hasRefused && (
                      <td className="h-12 px-5">
                        {isRefused ? (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium text-red-700 bg-red-50">
                            Refused
                          </span>
                        ) : (
                          <span className="text-xs text-text-secondary">Completed</span>
                        )}
                      </td>
                    )}
                    <td className="h-12 px-5">
                      <span className="text-sm text-text-secondary">{recipient.completedDate}</span>
                    </td>
                    <td className="h-12 px-3">
                      <ContextMenu items={getMenuItems(recipient)} />
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

// Needs Attention Table Component
function NeedsAttentionTable({ recipients, documentCategory, onViewAssigneeTask, documentName }: { recipients: DocumentRecipient[]; documentCategory?: TemplateCategory; onViewAssigneeTask?: (recipient: DocumentRecipient) => void; documentName: string }) {
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
    // "Mark as refused to sign" for write-ups with pending statuses
    if (documentCategory === 'write-up' && (recipient.status === 'pending' || recipient.status === 'assigned')) {
      items.push({
        id: 'mark-refused',
        label: 'Mark as refused to sign',
        icon: <Ban className="w-4 h-4" />,
        variant: 'danger',
        onClick: () => addToast(`${recipient.name} marked as "Refused to sign"`, 'warning'),
      })
    }
    items.push(
      {
        id: 'view-assignee-task',
        label: 'View assignee task',
        icon: <ClipboardList className="w-4 h-4" />,
        onClick: () => onViewAssigneeTask?.(recipient),
      },
      {
        id: 'share-link',
        label: 'Share document link',
        icon: <Link2 className="w-4 h-4" />,
        onClick: () => setSharingRecipient(recipient),
      },
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
        onClick: () => setCancellingRecipient(recipient),
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

      {/* Share document link modal */}
      {sharingRecipient && (
        <ShareDocumentLinkModal
          recipient={sharingRecipient}
          documentName={documentName}
          onClose={() => setSharingRecipient(null)}
        />
      )}

      {/* Bulk send reminder modal */}
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

      {/* Bulk cancel confirmation */}
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
        <div className="sticky top-0 z-10 bg-primary-500 text-white rounded-container px-4 py-3 mb-3 flex items-center justify-between shadow-lg">
          <span className="text-sm font-medium">{selected.length} selected</span>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
              onClick={() => setShowBulkReminder(true)}
            >
              Send Reminder
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
              onClick={() => setShowBulkCancel(true)}
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
                            onClick={() => setSharingRecipient(recipient)}
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
          <h3 className="text-lg font-semibold text-text-primary">
            {isBulk ? 'Send reminder' : 'Share document link'}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
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
              <p className="text-xs text-blue-800">
                This reminder will be sent to <span className="font-semibold">{bulkCount} recipient{bulkCount !== 1 ? 's' : ''}</span>. Use <code className="bg-blue-100 px-1 rounded text-[11px]">{'{{first_name}}'}</code> to personalise the message.
              </p>
            </div>
          )}

          {/* Editable message */}
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={7}
            className="w-full rounded-lg border border-border-light bg-gray-50 px-4 py-3 text-sm text-text-primary leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
              <span className="text-sm text-text-primary">
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
              <span className="text-sm text-text-primary">
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
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
              isBulk
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-text-secondary hover:text-text-primary hover:bg-gray-100'
            }`}
          >
            <Copy className="w-4 h-4" />
            Copy link
          </button>
          <Button
            variant="primary"
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
          <h3 className="text-lg font-semibold text-text-primary">Cancel assignment</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-text-primary">
            Are you sure you want to cancel {label}?
          </p>
          <div className="flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-800">
              {isBulk
                ? 'All selected recipients\u2019 document links will expire and become inaccessible. This action cannot be undone.'
                : 'This recipient\u2019s document link will expire and become inaccessible. This action cannot be undone.'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border-light bg-gray-50">
          <Button variant="ghost" onClick={onClose}>
            Go back
          </Button>
          <Button
            variant="primary"
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
