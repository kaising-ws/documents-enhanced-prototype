import { useState, useMemo } from 'react'
import {
  Search,
  X,
  MapPin,
  Users,
  ChevronDown,
  ChevronUp,
  Calendar,
  Clock,
  Check,
  ArrowRight,
  ArrowLeft,
  Info,
  UserCheck,
} from 'lucide-react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Checkbox from '../ui/Checkbox'
import { teamMembers, TeamMember, DocumentTemplate, locations, roles } from '../../data/mockData'

// ── Types ────────────────────────────────────────────────────────────

interface WorkflowStepConfig {
  id: string
  label: string
  questionCount: number
  managerOnly: boolean
}

interface StepAssignment {
  stepId: string
  assigneeMode: 'role' | 'location' | 'individual'
  selectedRoles: string[]
  selectedLocations: string[]
  selectedMembers: string[]
}

export interface CustomFormAssignment {
  documentId: string
  documentName: string
  stepAssignments: StepAssignment[]
  scheduledDate?: string
  scheduledTime?: string
  sendImmediately: boolean
}

interface AssignCustomFormModalProps {
  isOpen: boolean
  onClose: () => void
  document: DocumentTemplate | null
  workflowSteps?: WorkflowStepConfig[]
  onAssign?: (assignment: CustomFormAssignment) => void
}

// ── Mock workflow steps (fallback) ───────────────────────────────────

const DEFAULT_WORKFLOW_STEPS: WorkflowStepConfig[] = [
  { id: 'step-1', label: 'Self-Assessment', questionCount: 4, managerOnly: false },
  { id: 'step-2', label: 'Manager Review', questionCount: 5, managerOnly: true },
]

// ── Component ────────────────────────────────────────────────────────

export default function AssignCustomFormModal({
  isOpen,
  onClose,
  document,
  workflowSteps = DEFAULT_WORKFLOW_STEPS,
  onAssign,
}: AssignCustomFormModalProps) {
  const [currentPage, setCurrentPage] = useState<'steps' | 'schedule'>('steps')
  const [activeStepIdx, setActiveStepIdx] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')

  // Per-step assignments
  const [stepAssignments, setStepAssignments] = useState<StepAssignment[]>(() =>
    workflowSteps.map((step) => ({
      stepId: step.id,
      assigneeMode: step.managerOnly ? 'role' : 'individual',
      selectedRoles: step.managerOnly ? ['manager'] : [],
      selectedLocations: [],
      selectedMembers: [],
    }))
  )

  // Scheduling
  const [sendImmediately, setSendImmediately] = useState(true)
  const [scheduledDate, setScheduledDate] = useState('')
  const [scheduledTime, setScheduledTime] = useState('09:00')

  const activeStep = workflowSteps[activeStepIdx]
  const activeAssignment = stepAssignments[activeStepIdx]

  const updateStepAssignment = (updates: Partial<StepAssignment>) => {
    setStepAssignments((prev) =>
      prev.map((sa, idx) => (idx === activeStepIdx ? { ...sa, ...updates } : sa))
    )
  }

  const filteredMembers = useMemo(() => {
    return teamMembers.filter((m) => {
      const matchesSearch =
        searchQuery === '' ||
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.location.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesSearch
    })
  }, [searchQuery])

  const toggleMember = (memberId: string) => {
    const current = activeAssignment.selectedMembers
    updateStepAssignment({
      selectedMembers: current.includes(memberId)
        ? current.filter((id) => id !== memberId)
        : [...current, memberId],
    })
  }

  const toggleRole = (roleId: string) => {
    const current = activeAssignment.selectedRoles
    updateStepAssignment({
      selectedRoles: current.includes(roleId)
        ? current.filter((id) => id !== roleId)
        : [...current, roleId],
    })
  }

  const toggleLocation = (locId: string) => {
    const current = activeAssignment.selectedLocations
    updateStepAssignment({
      selectedLocations: current.includes(locId)
        ? current.filter((id) => id !== locId)
        : [...current, locId],
    })
  }

  const getStepAssigneeCount = (idx: number) => {
    const sa = stepAssignments[idx]
    if (sa.assigneeMode === 'individual') return sa.selectedMembers.length
    if (sa.assigneeMode === 'role') return sa.selectedRoles.length
    return sa.selectedLocations.length
  }

  const getStepAssigneeLabel = (idx: number) => {
    const sa = stepAssignments[idx]
    if (sa.assigneeMode === 'individual') {
      const count = sa.selectedMembers.length
      return count === 0 ? 'No assignees' : `${count} team member${count > 1 ? 's' : ''}`
    }
    if (sa.assigneeMode === 'role') {
      if (sa.selectedRoles.length === 0) return 'No roles'
      return sa.selectedRoles
        .map((id) => roles.find((r) => r.id === id)?.name || id)
        .join(', ')
    }
    if (sa.selectedLocations.length === 0) return 'No locations'
    return sa.selectedLocations
      .map((id) => locations.find((l) => l.id === id)?.name || id)
      .join(', ')
  }

  const isAllStepsConfigured = stepAssignments.every((sa) => {
    if (sa.assigneeMode === 'individual') return sa.selectedMembers.length > 0
    if (sa.assigneeMode === 'role') return sa.selectedRoles.length > 0
    return sa.selectedLocations.length > 0
  })

  const handleClose = () => {
    setCurrentPage('steps')
    setActiveStepIdx(0)
    setSearchQuery('')
    setStepAssignments(
      workflowSteps.map((step) => ({
        stepId: step.id,
        assigneeMode: step.managerOnly ? 'role' : 'individual',
        selectedRoles: step.managerOnly ? ['manager'] : [],
        selectedLocations: [],
        selectedMembers: [],
      }))
    )
    setSendImmediately(true)
    setScheduledDate('')
    setScheduledTime('09:00')
    onClose()
  }

  const handleSubmit = () => {
    if (!document) return
    onAssign?.({
      documentId: document.id,
      documentName: document.name,
      stepAssignments,
      scheduledDate: sendImmediately ? undefined : scheduledDate,
      scheduledTime: sendImmediately ? undefined : scheduledTime,
      sendImmediately,
    })
    handleClose()
  }

  if (!document) return null

  const renderStepAssignmentPage = () => (
    <div className="space-y-5">
      {/* Workflow step tabs */}
      <div>
        <p className="text-sm font-semibold text-text-primary mb-3">
          Configure assignees for each step
        </p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {workflowSteps.map((step, idx) => {
            const hasAssignees = getStepAssigneeCount(idx) > 0
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => setActiveStepIdx(idx)}
                className={`relative flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all border-2 ${
                  idx === activeStepIdx
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : hasAssignees
                    ? 'border-green-300 bg-green-50 text-green-700'
                    : 'border-border-light bg-white text-text-primary hover:border-gray-300'
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
                    idx === activeStepIdx
                      ? 'bg-primary-500 text-white'
                      : hasAssignees
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {hasAssignees && idx !== activeStepIdx ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    idx + 1
                  )}
                </span>
                {step.label}
                {step.managerOnly && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-700 font-semibold">
                    Manager
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Active step config */}
      {activeStep && activeAssignment && (
        <div className="border border-border-light rounded-container bg-white overflow-hidden">
          {/* Step header */}
          <div className="p-4 bg-gray-50 border-b border-border-light">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-text-primary">
                  {activeStep.label} — {activeStep.questionCount} question{activeStep.questionCount !== 1 ? 's' : ''}
                </p>
                <p className="text-xs text-text-secondary mt-0.5">
                  {activeStep.managerOnly
                    ? 'Only managers can fill out this step'
                    : 'Select who should complete this step'}
                </p>
              </div>
            </div>
          </div>

          {/* Assignee mode tabs */}
          <div className="p-4 border-b border-border-light">
            <p className="text-xs font-semibold text-text-secondary mb-2">Assign by</p>
            <div className="flex gap-2">
              {([
                { id: 'individual' as const, label: 'Individual', icon: <UserCheck className="w-3.5 h-3.5" /> },
                { id: 'role' as const, label: 'Role', icon: <Users className="w-3.5 h-3.5" /> },
                { id: 'location' as const, label: 'Location', icon: <MapPin className="w-3.5 h-3.5" /> },
              ]).map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => updateStepAssignment({ assigneeMode: mode.id })}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-element border text-xs font-medium transition-all ${
                    activeAssignment.assigneeMode === mode.id
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-border-light bg-white text-text-primary hover:border-gray-300'
                  }`}
                >
                  {mode.icon}
                  {mode.label}
                </button>
              ))}
            </div>
          </div>

          {/* Assignee selection content */}
          <div className="p-4">
            {/* Individual mode */}
            {activeAssignment.assigneeMode === 'individual' && (
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search team members..."
                    className="w-full h-9 pl-9 pr-3 rounded-element border border-border bg-white text-sm text-text-primary placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      <X className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                  )}
                </div>

                <div className="max-h-[240px] overflow-y-auto divide-y divide-border-light border border-border-light rounded-element">
                  {filteredMembers.map((member) => (
                    <label
                      key={member.id}
                      className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 cursor-pointer"
                    >
                      <Checkbox
                        checked={activeAssignment.selectedMembers.includes(member.id)}
                        onChange={() => toggleMember(member.id)}
                      />
                      <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                        {member.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">{member.name}</p>
                        <p className="text-xs text-text-secondary">{member.role} · {member.location}</p>
                      </div>
                    </label>
                  ))}
                </div>

                {activeAssignment.selectedMembers.length > 0 && (
                  <p className="text-xs text-text-secondary">
                    {activeAssignment.selectedMembers.length} team member{activeAssignment.selectedMembers.length !== 1 ? 's' : ''} selected
                  </p>
                )}
              </div>
            )}

            {/* Role mode */}
            {activeAssignment.assigneeMode === 'role' && (
              <div className="space-y-3">
                <p className="text-xs text-text-secondary">
                  All team members with the selected role(s) will be assigned this step.
                </p>
                <div className="flex flex-wrap gap-2">
                  {roles.map((role) => (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => toggleRole(role.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        activeAssignment.selectedRoles.includes(role.id)
                          ? 'bg-primary-500 text-white'
                          : 'bg-gray-100 text-text-primary hover:bg-gray-200'
                      }`}
                    >
                      {role.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Location mode */}
            {activeAssignment.assigneeMode === 'location' && (
              <div className="space-y-3">
                <p className="text-xs text-text-secondary">
                  All team members at the selected location(s) will be assigned this step.
                </p>
                <div className="flex flex-wrap gap-2">
                  {locations.map((loc) => (
                    <button
                      key={loc.id}
                      type="button"
                      onClick={() => toggleLocation(loc.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        activeAssignment.selectedLocations.includes(loc.id)
                          ? 'bg-primary-500 text-white'
                          : 'bg-gray-100 text-text-primary hover:bg-gray-200'
                      }`}
                    >
                      {loc.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="p-3 bg-gray-50 border border-border-light rounded-element">
        <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Assignment Summary</p>
        <div className="space-y-1.5">
          {workflowSteps.map((step, idx) => (
            <div key={step.id} className="flex items-center gap-2 text-xs">
              <span className={`w-5 h-5 rounded-full font-bold flex items-center justify-center flex-shrink-0 ${
                getStepAssigneeCount(idx) > 0
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-200 text-gray-500'
              }`}>
                {getStepAssigneeCount(idx) > 0 ? <Check className="w-3 h-3" /> : idx + 1}
              </span>
              <span className="text-text-primary font-medium">{step.label}:</span>
              <span className="text-text-secondary">{getStepAssigneeLabel(idx)}</span>
              {idx < workflowSteps.length - 1 && (
                <ArrowRight className="w-3 h-3 text-gray-400 ml-auto flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderSchedulePage = () => (
    <div className="space-y-6">
      {/* Send timing */}
      <div>
        <p className="text-sm font-semibold text-text-primary mb-3">
          When should the form be sent?
        </p>
        <p className="text-xs text-text-secondary mb-4">
          This controls when the <strong>first step</strong> is sent to its assigned recipients. Subsequent steps are triggered automatically after the previous step is completed.
        </p>

        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setSendImmediately(true)}
            className={`w-full flex items-center gap-3 p-4 rounded-container border-2 transition-all text-left ${
              sendImmediately
                ? 'border-primary-500 bg-primary-50'
                : 'border-border-light bg-white hover:border-gray-300'
            }`}
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              sendImmediately ? 'bg-primary-100' : 'bg-gray-100'
            }`}>
              <ArrowRight className={`w-5 h-5 ${sendImmediately ? 'text-primary-600' : 'text-gray-500'}`} />
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">Send immediately</p>
              <p className="text-xs text-text-secondary">Form will be sent as soon as you assign</p>
            </div>
            {sendImmediately && (
              <Check className="w-5 h-5 text-primary-500 ml-auto" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setSendImmediately(false)}
            className={`w-full flex items-center gap-3 p-4 rounded-container border-2 transition-all text-left ${
              !sendImmediately
                ? 'border-primary-500 bg-primary-50'
                : 'border-border-light bg-white hover:border-gray-300'
            }`}
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              !sendImmediately ? 'bg-primary-100' : 'bg-gray-100'
            }`}>
              <Calendar className={`w-5 h-5 ${!sendImmediately ? 'text-primary-600' : 'text-gray-500'}`} />
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">Schedule for later</p>
              <p className="text-xs text-text-secondary">Choose a date and time to send the form</p>
            </div>
            {!sendImmediately && (
              <Check className="w-5 h-5 text-primary-500 ml-auto" />
            )}
          </button>
        </div>

        {!sendImmediately && (
          <div className="mt-4 p-4 bg-gray-50 border border-border-light rounded-element space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">Date</label>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full h-10 px-3 rounded-element border border-border bg-white text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">Time</label>
                <input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full h-10 px-3 rounded-element border border-border bg-white text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-start gap-2.5 p-3 bg-blue-50 border border-blue-200 rounded-element">
              <Clock className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-blue-800">
                The form will be sent to <strong>Step 1</strong> assignees on{' '}
                {scheduledDate || 'the selected date'} at {scheduledTime}.
                Subsequent steps will be triggered automatically.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="p-4 bg-gray-50 border border-border-light rounded-element">
        <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">Final Summary</p>
        <div className="space-y-2">
          {workflowSteps.map((step, idx) => (
            <div key={step.id} className="flex items-center gap-2 text-xs">
              <span className="w-5 h-5 rounded-full bg-primary-100 text-primary-700 font-bold flex items-center justify-center flex-shrink-0">
                {idx + 1}
              </span>
              <span className="text-text-primary font-medium">{step.label}</span>
              <span className="text-text-secondary">→ {getStepAssigneeLabel(idx)}</span>
            </div>
          ))}
          <div className="pt-2 mt-2 border-t border-border-light flex items-center gap-2 text-xs">
            <Clock className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-text-secondary">
              {sendImmediately
                ? 'Sends immediately after assignment'
                : `Scheduled for ${scheduledDate} at ${scheduledTime}`}
            </span>
          </div>
        </div>
      </div>
    </div>
  )

  const canProceedToSchedule = isAllStepsConfigured
  const canSubmit =
    isAllStepsConfigured && (sendImmediately || (!!scheduledDate && !!scheduledTime))

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Assign: ${document.name}`}
      size="xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <div>
            {currentPage === 'schedule' ? (
              <Button
                variant="ghost"
                leftIcon={<ArrowLeft className="w-4 h-4" />}
                onClick={() => setCurrentPage('steps')}
              >
                Back
              </Button>
            ) : (
              <Button variant="ghost" onClick={handleClose}>
                Cancel
              </Button>
            )}
          </div>
          <div>
            {currentPage === 'steps' ? (
              <Button
                onClick={() => setCurrentPage('schedule')}
                disabled={!canProceedToSchedule}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Next: Schedule
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={!canSubmit}>
                Assign Form
              </Button>
            )}
          </div>
        </div>
      }
    >
      {/* Page indicator */}
      <div className="flex items-center gap-3 mb-5">
        <button
          type="button"
          onClick={() => setCurrentPage('steps')}
          className={`flex items-center gap-2 text-sm font-medium ${
            currentPage === 'steps' ? 'text-primary-700' : 'text-text-secondary'
          }`}
        >
          <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
            currentPage === 'steps' ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-500'
          }`}>
            1
          </span>
          Assign Steps
        </button>
        <div className="h-px w-8 bg-gray-300" />
        <button
          type="button"
          onClick={() => canProceedToSchedule && setCurrentPage('schedule')}
          className={`flex items-center gap-2 text-sm font-medium ${
            currentPage === 'schedule' ? 'text-primary-700' : 'text-text-secondary'
          }`}
        >
          <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
            currentPage === 'schedule' ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-500'
          }`}>
            2
          </span>
          Schedule
        </button>
      </div>

      {currentPage === 'steps' && renderStepAssignmentPage()}
      {currentPage === 'schedule' && renderSchedulePage()}
    </Modal>
  )
}


