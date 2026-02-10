import { useState } from 'react'
import { 
  Bell, 
  AlertTriangle, 
  Clock, 
  Mail, 
  Users, 
  ChevronDown, 
  ChevronUp,
  Plus,
  Trash2,
  Info
} from 'lucide-react'
import Button from '../ui/Button'
import Checkbox from '../ui/Checkbox'

interface EscalationRule {
  id: string
  daysAfterSend: number
  action: 'reminder' | 'notify_hr' | 'notify_manager' | 'mark_refused'
  enabled: boolean
}

interface EscalationSettingsProps {
  escalationDays: number
  onEscalationDaysChange: (days: number) => void
  allowDecline: boolean
  onAllowDeclineChange: (allow: boolean) => void
  rules?: EscalationRule[]
  onRulesChange?: (rules: EscalationRule[]) => void
  compact?: boolean
}

const defaultRules: EscalationRule[] = [
  { id: 'r1', daysAfterSend: 3, action: 'reminder', enabled: true },
  { id: 'r2', daysAfterSend: 5, action: 'notify_manager', enabled: true },
  { id: 'r3', daysAfterSend: 7, action: 'notify_hr', enabled: true },
  { id: 'r4', daysAfterSend: 10, action: 'mark_refused', enabled: true },
]

const actionLabels: Record<string, { label: string; description: string; icon: React.ReactNode; color: string }> = {
  reminder: {
    label: 'Send Reminder',
    description: 'Send a reminder notification to the employee',
    icon: <Bell className="w-4 h-4" />,
    color: 'text-blue-600 bg-blue-50',
  },
  notify_manager: {
    label: 'Notify Manager',
    description: 'Alert the assigning manager about pending acknowledgement',
    icon: <Users className="w-4 h-4" />,
    color: 'text-orange-600 bg-orange-50',
  },
  notify_hr: {
    label: 'Notify HR',
    description: 'Escalate to HR department',
    icon: <Mail className="w-4 h-4" />,
    color: 'text-purple-600 bg-purple-50',
  },
  mark_refused: {
    label: 'Mark as Refused',
    description: 'Automatically mark as "Refused to Sign"',
    icon: <AlertTriangle className="w-4 h-4" />,
    color: 'text-red-600 bg-red-50',
  },
}

export default function EscalationSettings({
  escalationDays,
  onEscalationDaysChange,
  allowDecline,
  onAllowDeclineChange,
  rules = defaultRules,
  onRulesChange,
  compact = false,
}: EscalationSettingsProps) {
  const [isExpanded, setIsExpanded] = useState(!compact)
  const [localRules, setLocalRules] = useState<EscalationRule[]>(rules)

  const handleRuleToggle = (ruleId: string) => {
    const updatedRules = localRules.map(rule => 
      rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
    )
    setLocalRules(updatedRules)
    onRulesChange?.(updatedRules)
  }

  const handleRuleDaysChange = (ruleId: string, days: number) => {
    const updatedRules = localRules.map(rule => 
      rule.id === ruleId ? { ...rule, daysAfterSend: days } : rule
    )
    setLocalRules(updatedRules)
    onRulesChange?.(updatedRules)
  }

  const handleAddRule = () => {
    const newRule: EscalationRule = {
      id: `r${Date.now()}`,
      daysAfterSend: Math.max(...localRules.map(r => r.daysAfterSend)) + 2,
      action: 'reminder',
      enabled: true,
    }
    const updatedRules = [...localRules, newRule]
    setLocalRules(updatedRules)
    onRulesChange?.(updatedRules)
  }

  const handleRemoveRule = (ruleId: string) => {
    const updatedRules = localRules.filter(rule => rule.id !== ruleId)
    setLocalRules(updatedRules)
    onRulesChange?.(updatedRules)
  }

  const handleActionChange = (ruleId: string, action: EscalationRule['action']) => {
    const updatedRules = localRules.map(rule => 
      rule.id === ruleId ? { ...rule, action } : rule
    )
    setLocalRules(updatedRules)
    onRulesChange?.(updatedRules)
  }

  const sortedRules = [...localRules].sort((a, b) => a.daysAfterSend - b.daysAfterSend)

  if (compact) {
    return (
      <div className="border border-border-light rounded-element overflow-hidden">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-text-primary">Escalation Settings</p>
              <p className="text-xs text-text-secondary">
                Auto-mark as refused after {escalationDays} days
              </p>
            </div>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>
        
        {isExpanded && (
          <div className="p-4 space-y-4 border-t border-border-light">
            {renderContent()}
          </div>
        )}
      </div>
    )
  }

  function renderContent() {
    return (
      <>
        {/* Allow Decline Toggle */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-element">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={allowDecline}
              onChange={onAllowDeclineChange}
            />
            <div>
              <p className="text-sm font-medium text-text-primary">Allow employee to decline signing</p>
              <p className="text-xs text-text-secondary">Employee can refuse with a documented reason</p>
            </div>
          </div>
        </div>

        {/* Auto-refuse Days */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Auto-mark as refused after
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min="1"
              max="30"
              value={escalationDays}
              onChange={(e) => onEscalationDaysChange(parseInt(e.target.value) || 7)}
              className="w-20 h-10 px-3 rounded-element border border-border bg-white text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-center"
            />
            <span className="text-sm text-text-secondary">days without response</span>
          </div>
        </div>

        {/* Escalation Timeline */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-text-primary">
              Escalation Timeline
            </label>
            <button
              type="button"
              onClick={handleAddRule}
              className="flex items-center gap-1 text-xs font-medium text-primary-500 hover:text-primary-600"
            >
              <Plus className="w-3 h-3" />
              Add Step
            </button>
          </div>

          <div className="space-y-2">
            {sortedRules.map((rule, index) => {
              const actionConfig = actionLabels[rule.action]
              return (
                <div 
                  key={rule.id}
                  className={`relative flex items-center gap-3 p-3 rounded-element border transition-all ${
                    rule.enabled 
                      ? 'border-border-light bg-white' 
                      : 'border-gray-200 bg-gray-50 opacity-60'
                  }`}
                >
                  {/* Timeline indicator */}
                  <div className="flex flex-col items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                      rule.enabled ? actionConfig.color : 'bg-gray-200 text-gray-500'
                    }`}>
                      {index + 1}
                    </div>
                    {index < sortedRules.length - 1 && (
                      <div className="w-0.5 h-4 bg-gray-200 mt-1" />
                    )}
                  </div>

                  {/* Days input */}
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-text-secondary">Day</span>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={rule.daysAfterSend}
                      onChange={(e) => handleRuleDaysChange(rule.id, parseInt(e.target.value) || 1)}
                      disabled={!rule.enabled}
                      className="w-12 h-8 px-2 rounded border border-border bg-white text-sm text-text-primary text-center focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
                    />
                  </div>

                  {/* Action selector */}
                  <div className="flex-1">
                    <select
                      value={rule.action}
                      onChange={(e) => handleActionChange(rule.id, e.target.value as EscalationRule['action'])}
                      disabled={!rule.enabled}
                      className="w-full h-8 px-2 rounded border border-border bg-white text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
                    >
                      <option value="reminder">Send Reminder</option>
                      <option value="notify_manager">Notify Manager</option>
                      <option value="notify_hr">Notify HR</option>
                      <option value="mark_refused">Mark as Refused</option>
                    </select>
                  </div>

                  {/* Icon */}
                  <div className={`w-8 h-8 rounded flex items-center justify-center ${
                    rule.enabled ? actionConfig.color : 'bg-gray-200 text-gray-500'
                  }`}>
                    {actionConfig.icon}
                  </div>

                  {/* Toggle & Delete */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleRuleToggle(rule.id)}
                      className={`relative w-8 h-5 rounded-full transition-colors ${
                        rule.enabled ? 'bg-primary-500' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                          rule.enabled ? 'right-0.5' : 'left-0.5'
                        }`}
                      />
                    </button>
                    {localRules.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveRule(rule.id)}
                        className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Info Box */}
        <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-element">
          <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs text-blue-800">
              <strong>How escalation works:</strong> The system will automatically perform each enabled action 
              on the specified day after the write-up is sent. All escalation steps are recorded in the audit log.
            </p>
          </div>
        </div>
      </>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
          <Clock className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-text-primary">Escalation Settings</h3>
          <p className="text-sm text-text-secondary">Configure what happens when employees don't respond</p>
        </div>
      </div>
      
      {renderContent()}
    </div>
  )
}

// Standalone component for showing escalation status on a write-up
interface EscalationStatusProps {
  writeUp: {
    sentDate?: string
    status: string
    escalationDays: number
    remindersSent: number
    lastReminderDate?: string
  }
}

export function EscalationStatus({ writeUp }: EscalationStatusProps) {
  if (writeUp.status !== 'sent' || !writeUp.sentDate) {
    return null
  }

  const sentDate = new Date(writeUp.sentDate)
  const now = new Date()
  const daysSinceSent = Math.floor((now.getTime() - sentDate.getTime()) / (1000 * 60 * 60 * 24))
  const daysRemaining = writeUp.escalationDays - daysSinceSent

  const getStatusColor = () => {
    if (daysRemaining <= 0) return 'bg-red-50 border-red-200 text-red-800'
    if (daysRemaining <= 2) return 'bg-amber-50 border-amber-200 text-amber-800'
    return 'bg-blue-50 border-blue-200 text-blue-800'
  }

  const getStatusText = () => {
    if (daysRemaining <= 0) return 'Escalation deadline reached'
    if (daysRemaining === 1) return '1 day until escalation'
    return `${daysRemaining} days until escalation`
  }

  return (
    <div className={`flex items-center gap-3 p-3 rounded-element border ${getStatusColor()}`}>
      <Clock className="w-4 h-4 flex-shrink-0" />
      <div className="flex-1">
        <p className="text-sm font-medium">{getStatusText()}</p>
        <p className="text-xs opacity-80">
          {writeUp.remindersSent > 0 
            ? `${writeUp.remindersSent} reminder${writeUp.remindersSent !== 1 ? 's' : ''} sent`
            : 'No reminders sent yet'}
        </p>
      </div>
      {daysRemaining > 0 && (
        <Button size="sm" variant="outline">
          Send Reminder
        </Button>
      )}
    </div>
  )
}

