import { useState } from 'react'
import { Calendar, Clock, Search, X, AlertTriangle, CheckCircle2, User } from 'lucide-react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Dropdown from '../ui/Dropdown'
import { teamMembers, TeamMember } from '../../data/mockData'

interface AssignWriteUpModalProps {
  isOpen: boolean
  onClose: () => void
  onAssign?: (assignment: WriteUpAssignment) => void
  templateId?: string
  templateName?: string
}

export interface WriteUpAssignment {
  templateId: string
  employeeId: string
  employeeName: string
  incidentDate: string
  incidentDescription: string
  managerNotes: string
  points?: number
  sendOption: 'now' | 'scheduled' | 'draft'
  scheduledDate?: string
  managerSignature: boolean
}

const writeUpTypes = [
  { id: 'verbal-warning', label: 'Verbal Warning', points: 1, color: 'bg-yellow-100 text-yellow-800' },
  { id: 'written-warning', label: 'Written Warning', points: 2, color: 'bg-orange-100 text-orange-800' },
  { id: 'final-warning', label: 'Final Warning', points: 3, color: 'bg-red-100 text-red-800' },
  { id: 'performance-improvement', label: 'Performance Improvement Plan', points: 0, color: 'bg-purple-100 text-purple-800' },
  { id: 'recognition', label: 'Recognition', points: -1, color: 'bg-green-100 text-green-800' },
  { id: 'coaching', label: 'Coaching', points: 0, color: 'bg-blue-100 text-blue-800' },
]

export default function AssignWriteUpModal({
  isOpen,
  onClose,
  onAssign,
  templateId = '',
  templateName = 'Write Up',
}: AssignWriteUpModalProps) {
  const [selectedEmployee, setSelectedEmployee] = useState<TeamMember | null>(null)
  const [employeeSearch, setEmployeeSearch] = useState('')
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false)
  const [writeUpType, setWriteUpType] = useState('')
  const [incidentDate, setIncidentDate] = useState(new Date().toISOString().split('T')[0])
  const [incidentDescription, setIncidentDescription] = useState('')
  const [managerNotes, setManagerNotes] = useState('')
  const [usePoints, setUsePoints] = useState(false)
  const [customPoints, setCustomPoints] = useState<number | null>(null)
  const [sendOption, setSendOption] = useState<'now' | 'scheduled' | 'draft'>('now')
  const [scheduledDate, setScheduledDate] = useState('')
  const [managerSignature, setManagerSignature] = useState(false)
  const [step, setStep] = useState<'details' | 'preview'>('details')

  const filteredEmployees = teamMembers.filter(
    (member) =>
      member.name.toLowerCase().includes(employeeSearch.toLowerCase()) ||
      member.role.toLowerCase().includes(employeeSearch.toLowerCase()) ||
      member.location.toLowerCase().includes(employeeSearch.toLowerCase())
  )

  const selectedType = writeUpTypes.find((t) => t.id === writeUpType)
  const pointsToAssign = customPoints !== null ? customPoints : (selectedType?.points || 0)

  const handleClose = () => {
    // Reset form
    setSelectedEmployee(null)
    setEmployeeSearch('')
    setWriteUpType('')
    setIncidentDate(new Date().toISOString().split('T')[0])
    setIncidentDescription('')
    setManagerNotes('')
    setUsePoints(false)
    setCustomPoints(null)
    setSendOption('now')
    setScheduledDate('')
    setManagerSignature(false)
    setStep('details')
    onClose()
  }

  const handleSubmit = () => {
    if (!selectedEmployee || !writeUpType || !incidentDescription) return

    const assignment: WriteUpAssignment = {
      templateId,
      employeeId: selectedEmployee.id,
      employeeName: selectedEmployee.name,
      incidentDate,
      incidentDescription,
      managerNotes,
      points: usePoints ? pointsToAssign : undefined,
      sendOption,
      scheduledDate: sendOption === 'scheduled' ? scheduledDate : undefined,
      managerSignature,
    }

    if (onAssign) {
      onAssign(assignment)
    }

    console.log('Write-up assigned:', assignment)
    handleClose()
  }

  const isFormValid = () => {
    const baseValid = selectedEmployee && writeUpType && incidentDescription && managerSignature
    if (sendOption === 'scheduled') {
      return baseValid && scheduledDate
    }
    return baseValid
  }

  const renderDetailsStep = () => (
    <div className="space-y-6">
      {/* Employee Selection */}
      <div>
        <label className="block text-sm font-semibold text-text-primary mb-2">
          Select Employee
        </label>
        <div className="relative">
          {selectedEmployee ? (
            <div className="flex items-center justify-between p-3 border border-primary-500 rounded-element bg-primary-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-white">
                    {selectedEmployee.initials}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">{selectedEmployee.name}</p>
                  <p className="text-xs text-text-secondary">{selectedEmployee.role} · {selectedEmployee.location}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedEmployee(null)
                  setEmployeeSearch('')
                }}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-primary-100 transition-colors"
              >
                <X className="w-4 h-4 text-primary-600" />
              </button>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <Search className="w-4 h-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={employeeSearch}
                onChange={(e) => {
                  setEmployeeSearch(e.target.value)
                  setShowEmployeeDropdown(true)
                }}
                onFocus={() => setShowEmployeeDropdown(true)}
                placeholder="Search by name, role, or location..."
                className="w-full h-10 pl-10 pr-3 rounded-element border border-border bg-white text-sm text-text-primary placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              
              {showEmployeeDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-border-light rounded-element shadow-lg max-h-60 overflow-auto">
                  {filteredEmployees.length > 0 ? (
                    filteredEmployees.map((member) => (
                      <button
                        key={member.id}
                        onClick={() => {
                          setSelectedEmployee(member)
                          setEmployeeSearch('')
                          setShowEmployeeDropdown(false)
                        }}
                        className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors text-left"
                      >
                        <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-semibold text-white">
                            {member.initials}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-text-primary">{member.name}</p>
                          <p className="text-xs text-text-secondary">{member.role} · {member.location}</p>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="p-4 text-center text-sm text-text-secondary">
                      No employees found
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Write-up Type */}
      <div>
        <label className="block text-sm font-semibold text-text-primary mb-2">
          Write-up Type
        </label>
        <div className="grid grid-cols-2 gap-2">
          {writeUpTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setWriteUpType(type.id)}
              className={`p-3 rounded-element border text-left transition-all ${
                writeUpType === type.id
                  ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-500'
                  : 'border-border-light hover:border-gray-300'
              }`}
            >
              <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${type.color}`}>
                {type.label}
              </span>
              {type.points !== 0 && (
                <p className="text-xs text-text-secondary mt-1">
                  {type.points > 0 ? `+${type.points} points` : `${type.points} points`}
                </p>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Incident Date */}
      <div>
        <label className="block text-sm font-semibold text-text-primary mb-2">
          Incident Date
        </label>
        <div className="relative">
          <input
            type="date"
            value={incidentDate}
            onChange={(e) => setIncidentDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className="w-full h-10 px-3 pr-10 rounded-element border border-border bg-white text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Incident Description */}
      <div>
        <label className="block text-sm font-semibold text-text-primary mb-2">
          Incident Description <span className="text-red-500">*</span>
        </label>
        <textarea
          value={incidentDescription}
          onChange={(e) => setIncidentDescription(e.target.value)}
          placeholder="Describe what happened, when, and any relevant details..."
          className="w-full h-28 px-3 py-2 rounded-element border border-border bg-white text-sm text-text-primary placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
        />
      </div>

      {/* Manager Notes */}
      <div>
        <label className="block text-sm font-semibold text-text-primary mb-2">
          Manager Notes (optional)
        </label>
        <textarea
          value={managerNotes}
          onChange={(e) => setManagerNotes(e.target.value)}
          placeholder="Additional context or action items..."
          className="w-full h-20 px-3 py-2 rounded-element border border-border bg-white text-sm text-text-primary placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
        />
      </div>

      {/* Points System */}
      {selectedType && selectedType.points !== 0 && (
        <div className="p-4 bg-gray-50 rounded-element">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-semibold text-text-primary">
              Assign demerit points
            </label>
            <button
              onClick={() => setUsePoints(!usePoints)}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                usePoints ? 'bg-primary-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  usePoints ? 'right-1' : 'left-1'
                }`}
              />
            </button>
          </div>
          
          {usePoints && (
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-xs text-text-secondary mb-1">Points to assign</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={customPoints !== null ? customPoints : selectedType.points}
                  onChange={(e) => setCustomPoints(parseInt(e.target.value) || 0)}
                  className="w-24 h-10 px-3 rounded-element border border-border bg-white text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div className="flex-1">
                <p className="text-xs text-text-secondary">
                  {selectedEmployee?.name || 'Employee'} will have <strong>{pointsToAssign}</strong> points added to their record.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Send Options */}
      <div className="border-t border-border-light pt-6">
        <label className="block text-sm font-semibold text-text-primary mb-3">
          When to send
        </label>
        <div className="space-y-2">
          <button
            onClick={() => setSendOption('now')}
            className={`w-full flex items-center gap-3 p-3 rounded-element border transition-all ${
              sendOption === 'now'
                ? 'border-primary-500 bg-primary-50'
                : 'border-border-light hover:border-gray-300'
            }`}
          >
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
              sendOption === 'now' ? 'border-primary-500' : 'border-gray-300'
            }`}>
              {sendOption === 'now' && <div className="w-2 h-2 rounded-full bg-primary-500" />}
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-text-primary">Send immediately</p>
              <p className="text-xs text-text-secondary">Employee will be notified right away</p>
            </div>
          </button>
          
          <button
            onClick={() => setSendOption('scheduled')}
            className={`w-full flex items-center gap-3 p-3 rounded-element border transition-all ${
              sendOption === 'scheduled'
                ? 'border-primary-500 bg-primary-50'
                : 'border-border-light hover:border-gray-300'
            }`}
          >
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
              sendOption === 'scheduled' ? 'border-primary-500' : 'border-gray-300'
            }`}>
              {sendOption === 'scheduled' && <div className="w-2 h-2 rounded-full bg-primary-500" />}
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-text-primary">Schedule for later</p>
              <p className="text-xs text-text-secondary">Choose a date and time to send</p>
            </div>
            <Clock className="w-4 h-4 text-gray-400" />
          </button>
          
          {sendOption === 'scheduled' && (
            <div className="ml-7 mt-2">
              <input
                type="datetime-local"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className="w-full h-10 px-3 rounded-element border border-border bg-white text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          )}
          
          <button
            onClick={() => setSendOption('draft')}
            className={`w-full flex items-center gap-3 p-3 rounded-element border transition-all ${
              sendOption === 'draft'
                ? 'border-primary-500 bg-primary-50'
                : 'border-border-light hover:border-gray-300'
            }`}
          >
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
              sendOption === 'draft' ? 'border-primary-500' : 'border-gray-300'
            }`}>
              {sendOption === 'draft' && <div className="w-2 h-2 rounded-full bg-primary-500" />}
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-text-primary">Save as draft</p>
              <p className="text-xs text-text-secondary">Save for later without sending</p>
            </div>
          </button>
        </div>
      </div>

      {/* Manager Signature */}
      <div className="border-t border-border-light pt-6">
        <label className="block text-sm font-semibold text-text-primary mb-3">
          Manager Signature
        </label>
        <div 
          onClick={() => setManagerSignature(!managerSignature)}
          className={`p-4 rounded-element border-2 border-dashed cursor-pointer transition-all ${
            managerSignature
              ? 'border-green-500 bg-green-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          {managerSignature ? (
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-800">Signed by Manager</p>
                <p className="text-xs text-green-600">Click to remove signature</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-text-primary">Click to sign as manager</p>
                <p className="text-xs text-text-secondary">Your signature is required before sending</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  const renderPreviewStep = () => (
    <div className="space-y-6">
      <div className="p-6 bg-gray-50 rounded-container border border-border-light">
        {/* Header */}
        <div className="flex items-start justify-between mb-6 pb-6 border-b border-border-light">
          <div>
            <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${selectedType?.color}`}>
              {selectedType?.label}
            </span>
            <h3 className="text-lg font-bold text-text-primary mt-2">{templateName}</h3>
          </div>
          <div className="text-right">
            <p className="text-sm text-text-secondary">Incident Date</p>
            <p className="text-sm font-medium text-text-primary">{incidentDate}</p>
          </div>
        </div>

        {/* Employee */}
        <div className="mb-6">
          <p className="text-xs text-text-secondary uppercase tracking-wider mb-2">Employee</p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
              <span className="text-sm font-semibold text-white">
                {selectedEmployee?.initials}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">{selectedEmployee?.name}</p>
              <p className="text-xs text-text-secondary">{selectedEmployee?.role} · {selectedEmployee?.location}</p>
            </div>
          </div>
        </div>

        {/* Incident Description */}
        <div className="mb-6">
          <p className="text-xs text-text-secondary uppercase tracking-wider mb-2">Incident Description</p>
          <p className="text-sm text-text-primary whitespace-pre-wrap">{incidentDescription}</p>
        </div>

        {/* Manager Notes */}
        {managerNotes && (
          <div className="mb-6">
            <p className="text-xs text-text-secondary uppercase tracking-wider mb-2">Manager Notes</p>
            <p className="text-sm text-text-primary whitespace-pre-wrap">{managerNotes}</p>
          </div>
        )}

        {/* Points */}
        {usePoints && pointsToAssign !== 0 && (
          <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-element">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <p className="text-sm text-amber-800">
                <strong>{pointsToAssign > 0 ? '+' : ''}{pointsToAssign} points</strong> will be added to {selectedEmployee?.name}'s record
              </p>
            </div>
          </div>
        )}

        {/* Send Option */}
        <div className="pt-4 border-t border-border-light">
          <p className="text-xs text-text-secondary uppercase tracking-wider mb-2">Delivery</p>
          <p className="text-sm text-text-primary">
            {sendOption === 'now' && '📤 Send immediately after confirmation'}
            {sendOption === 'scheduled' && `📅 Scheduled for ${new Date(scheduledDate).toLocaleString()}`}
            {sendOption === 'draft' && '📝 Save as draft (will not be sent)'}
          </p>
        </div>
      </div>
    </div>
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={step === 'details' ? 'Assign Write-up' : 'Review & Confirm'}
      size="xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <Button variant="ghost" onClick={step === 'preview' ? () => setStep('details') : handleClose}>
            {step === 'preview' ? 'Back' : 'Cancel'}
          </Button>
          <div className="flex items-center gap-3">
            {step === 'details' ? (
              <Button onClick={() => setStep('preview')} disabled={!isFormValid()}>
                Preview
              </Button>
            ) : (
              <Button onClick={handleSubmit}>
                {sendOption === 'draft' ? 'Save Draft' : sendOption === 'scheduled' ? 'Schedule' : 'Send Write-up'}
              </Button>
            )}
          </div>
        </div>
      }
    >
      {step === 'details' ? renderDetailsStep() : renderPreviewStep()}
    </Modal>
  )
}



