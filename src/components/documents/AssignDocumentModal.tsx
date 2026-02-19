import { useState } from 'react'
import { Search, X, MapPin, Users, CheckCircle2, AlertTriangle } from 'lucide-react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Checkbox from '../ui/Checkbox'
import { teamMembers, TeamMember, DocumentTemplate, locations, roles } from '../../data/mockData'

interface AssignDocumentModalProps {
  isOpen: boolean
  onClose: () => void
  document: DocumentTemplate | null
  onAssign?: (assignment: DocumentAssignment) => void
}

export interface DocumentAssignment {
  documentId: string
  documentName: string
  recipientIds: string[]
  recipientNames: string[]
  dueDate?: string
  sendNotification: boolean
  message?: string
}

export default function AssignDocumentModal({
  isOpen,
  onClose,
  document,
  onAssign,
}: AssignDocumentModalProps) {
  const [step, setStep] = useState<'select' | 'review'>('select')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [dueDate, setDueDate] = useState('')
  const [sendNotification, setSendNotification] = useState(true)
  const [message, setMessage] = useState('')

  // Filters for quick select
  const [locationFilter, setLocationFilter] = useState<string | null>(null)
  const [roleFilter, setRoleFilter] = useState<string | null>(null)

  const filteredMembers = teamMembers.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.location.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  const handleToggleMember = (memberId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
    )
  }

  const handleSelectAll = () => {
    if (selectedMembers.length === filteredMembers.length) {
      setSelectedMembers([])
    } else {
      setSelectedMembers(filteredMembers.map((m) => m.id))
    }
  }

  const handleSelectByLocation = (locationName: string) => {
    const membersAtLocation = teamMembers
      .filter((m) => m.location === locationName)
      .map((m) => m.id)
    const allSelected = membersAtLocation.every((id) => selectedMembers.includes(id))

    if (allSelected) {
      setSelectedMembers((prev) => prev.filter((id) => !membersAtLocation.includes(id)))
    } else {
      setSelectedMembers((prev) => [...new Set([...prev, ...membersAtLocation])])
    }
    setLocationFilter(locationName)
  }

  const handleSelectByRole = (roleName: string) => {
    const membersWithRole = teamMembers
      .filter((m) => m.role.toLowerCase() === roleName.toLowerCase())
      .map((m) => m.id)
    const allSelected = membersWithRole.every((id) => selectedMembers.includes(id))

    if (allSelected) {
      setSelectedMembers((prev) => prev.filter((id) => !membersWithRole.includes(id)))
    } else {
      setSelectedMembers((prev) => [...new Set([...prev, ...membersWithRole])])
    }
    setRoleFilter(roleName)
  }

  const handleClose = () => {
    setStep('select')
    setSearchQuery('')
    setSelectedMembers([])
    setDueDate('')
    setSendNotification(true)
    setMessage('')
    setLocationFilter(null)
    setRoleFilter(null)
    onClose()
  }

  const handleSubmit = () => {
    if (!document || selectedMembers.length === 0) return

    const selectedNames = teamMembers
      .filter((m) => selectedMembers.includes(m.id))
      .map((m) => m.name)

    const assignment: DocumentAssignment = {
      documentId: document.id,
      documentName: document.name,
      recipientIds: selectedMembers,
      recipientNames: selectedNames,
      dueDate: dueDate || undefined,
      sendNotification,
      message: message || undefined,
    }

    onAssign?.(assignment)
    handleClose()
  }

  // Build location summary
  const getLocationSummary = () => {
    const locationCounts: Record<string, number> = {}
    teamMembers
      .filter((m) => selectedMembers.includes(m.id))
      .forEach((m) => {
        locationCounts[m.location] = (locationCounts[m.location] || 0) + 1
      })
    return Object.entries(locationCounts)
      .map(([loc, count]) => `${count} at ${loc}`)
      .join(', ')
  }

  const renderSelectStep = () => (
    <div className="space-y-5">
      {/* Quick select by location */}
      <div>
        <label className="block text-sm font-semibold text-text-primary mb-2">
          <MapPin className="w-4 h-4 inline mr-1" />
          Select by Location
        </label>
        <div className="flex flex-wrap gap-2">
          {locations.map((loc) => {
            const membersAtLoc = teamMembers.filter((m) => m.location === loc.name)
            const allSelected = membersAtLoc.length > 0 && membersAtLoc.every((m) => selectedMembers.includes(m.id))
            return (
              <button
                key={loc.id}
                onClick={() => handleSelectByLocation(loc.name)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  allSelected
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-text-primary hover:bg-gray-200'
                }`}
              >
                {loc.name} ({membersAtLoc.length})
              </button>
            )
          })}
        </div>
      </div>

      {/* Quick select by role */}
      <div>
        <label className="block text-sm font-semibold text-text-primary mb-2">
          <Users className="w-4 h-4 inline mr-1" />
          Select by Role
        </label>
        <div className="flex flex-wrap gap-2">
          {Array.from(new Set(teamMembers.map((m) => m.role))).map((role) => {
            const membersWithRole = teamMembers.filter((m) => m.role === role)
            const allSelected =
              membersWithRole.length > 0 && membersWithRole.every((m) => selectedMembers.includes(m.id))
            return (
              <button
                key={role}
                onClick={() => handleSelectByRole(role)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  allSelected
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-text-primary hover:bg-gray-200'
                }`}
              >
                {role} ({membersWithRole.length})
              </button>
            )
          })}
        </div>
      </div>

      {/* Search & member list */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-semibold text-text-primary">
            Select Recipients
          </label>
          <button onClick={handleSelectAll} className="text-xs text-primary-500 hover:underline font-medium">
            {selectedMembers.length === filteredMembers.length ? 'Deselect All' : 'Select All'}
          </button>
        </div>
        <div className="relative mb-3">
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <Search className="w-4 h-4 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, role, or location..."
            className="w-full h-10 pl-10 pr-3 rounded-element border border-border bg-white text-sm text-text-primary placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div className="border border-border-light rounded-element max-h-[280px] overflow-y-auto divide-y divide-border-light">
          {filteredMembers.map((member) => (
            <label
              key={member.id}
              className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <Checkbox
                checked={selectedMembers.includes(member.id)}
                onChange={() => handleToggleMember(member.id)}
              />
              <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-semibold text-white">{member.initials}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary">{member.name}</p>
                <p className="text-xs text-text-secondary">
                  {member.role} · {member.location}
                </p>
              </div>
            </label>
          ))}
          {filteredMembers.length === 0 && (
            <div className="p-4 text-center text-sm text-text-secondary">No employees found</div>
          )}
        </div>
      </div>

      {/* Selection summary */}
      {selectedMembers.length > 0 && (
        <div className="bg-primary-50 border border-primary-200 rounded-element p-3">
          <p className="text-sm text-primary-800 font-medium">
            {selectedMembers.length} recipient{selectedMembers.length !== 1 ? 's' : ''} selected
          </p>
          {getLocationSummary() && (
            <p className="text-xs text-primary-600 mt-1">{getLocationSummary()}</p>
          )}
        </div>
      )}
    </div>
  )

  const renderReviewStep = () => {
    const selectedMemberDetails = teamMembers.filter((m) => selectedMembers.includes(m.id))

    return (
      <div className="space-y-5">
        {/* Document info */}
        <div className="bg-gray-50 rounded-element p-4">
          <p className="text-xs text-text-secondary uppercase tracking-wider mb-1">Document</p>
          <p className="text-sm font-semibold text-text-primary">{document?.name}</p>
          <p className="text-xs text-text-secondary mt-0.5">{document?.type}</p>
        </div>

        {/* Recipients */}
        <div>
          <p className="text-sm font-semibold text-text-primary mb-2">
            Recipients ({selectedMemberDetails.length})
          </p>
          <div className="border border-border-light rounded-element max-h-[200px] overflow-y-auto divide-y divide-border-light">
            {selectedMemberDetails.map((member) => (
              <div key={member.id} className="flex items-center gap-3 p-3">
                <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-semibold text-white">{member.initials}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-text-primary">{member.name}</p>
                  <p className="text-xs text-text-secondary">
                    {member.role} · {member.location}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Due date */}
        <div>
          <label className="block text-sm font-semibold text-text-primary mb-2">
            Due Date (optional)
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full h-10 px-3 rounded-element border border-border bg-white text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* Custom message */}
        <div>
          <label className="block text-sm font-semibold text-text-primary mb-2">
            Message (optional)
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Add a note to recipients..."
            className="w-full h-20 px-3 py-2 rounded-element border border-border bg-white text-sm text-text-primary placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Notification toggle */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-element">
          <div>
            <p className="text-sm font-medium text-text-primary">Send notification</p>
            <p className="text-xs text-text-secondary">
              Recipients will be notified via email and push notification
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSendNotification(!sendNotification)}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              sendNotification ? 'bg-primary-500' : 'bg-gray-300'
            }`}
          >
            <span
              className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                sendNotification ? 'right-1' : 'left-1'
              }`}
            />
          </button>
        </div>

        {/* Summary */}
        <div className="bg-blue-50 border border-blue-200 rounded-element p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-blue-800">
              This will send <strong>{document?.name}</strong> to{' '}
              <strong>
                {selectedMemberDetails.length} employee{selectedMemberDetails.length !== 1 ? 's' : ''}
              </strong>
              {getLocationSummary() ? ` (${getLocationSummary()})` : ''}.
              {dueDate && ` Due by ${new Date(dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}.`}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={step === 'select' ? `Assign: ${document?.name || 'Document'}` : 'Review & Confirm'}
      size="xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <Button variant="ghost" onClick={step === 'review' ? () => setStep('select') : handleClose}>
            {step === 'review' ? 'Back' : 'Cancel'}
          </Button>
          <div className="flex items-center gap-3">
            {step === 'select' ? (
              <Button onClick={() => setStep('review')} disabled={selectedMembers.length === 0}>
                Review ({selectedMembers.length})
              </Button>
            ) : (
              <Button onClick={handleSubmit}>
                Assign to {selectedMembers.length} Recipient{selectedMembers.length !== 1 ? 's' : ''}
              </Button>
            )}
          </div>
        </div>
      }
    >
      {step === 'select' ? renderSelectStep() : renderReviewStep()}
    </Modal>
  )
}



