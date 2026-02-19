import { useState } from 'react'
import { 
  Users, 
  MapPin, 
  Briefcase, 
  Plus, 
  Trash2, 
  Play, 
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Dropdown from '../ui/Dropdown'
import Checkbox from '../ui/Checkbox'
import { locations, teamMembers } from '../../data/mockData'

interface AutoAssignRule {
  id: string
  trigger: 'hire' | 'job_change' | 'location_change'
  conditions: {
    jobTitles: string[]
    locations: string[]
    roles: string[]
  }
  enabled: boolean
}

interface AutoAssignRulesModalProps {
  isOpen: boolean
  onClose: () => void
  certificationName?: string
  existingRules?: AutoAssignRule[]
  onSave?: (rules: AutoAssignRule[]) => void
}

const jobTitleOptions = [
  'Server', 'Cook', 'Bartender', 'Host', 'Busser', 
  'Dishwasher', 'Manager', 'Assistant Manager', 'Shift Lead', 
  'Prep Cook', 'Delivery Driver', 'Cashier'
]

const roleOptions = [
  { id: 'manager', label: 'Manager' },
  { id: 'supervisor', label: 'Supervisor' },
  { id: 'staff', label: 'Staff' },
]

const triggerOptions = [
  { id: 'hire', label: 'Employee is hired', description: 'Request when a new employee joins' },
  { id: 'job_change', label: 'Job title changes', description: 'Request when job title is updated' },
  { id: 'location_change', label: 'Location changes', description: 'Request when employee moves location' },
]

const defaultRule: Omit<AutoAssignRule, 'id'> = {
  trigger: 'hire',
  conditions: {
    jobTitles: [],
    locations: [],
    roles: [],
  },
  enabled: true,
}

export default function AutoAssignRulesModal({
  isOpen,
  onClose,
  certificationName = 'Certification',
  existingRules = [],
  onSave,
}: AutoAssignRulesModalProps) {
  const [rules, setRules] = useState<AutoAssignRule[]>(
    existingRules.length > 0 
      ? existingRules 
      : [{ ...defaultRule, id: 'rule-1' }]
  )
  const [expandedRule, setExpandedRule] = useState<string | null>('rule-1')
  const [testResults, setTestResults] = useState<{ employeeId: string; name: string; matches: boolean }[] | null>(null)

  const addRule = () => {
    const newRule: AutoAssignRule = {
      ...defaultRule,
      id: `rule-${Date.now()}`,
    }
    setRules([...rules, newRule])
    setExpandedRule(newRule.id)
  }

  const removeRule = (ruleId: string) => {
    setRules(rules.filter(r => r.id !== ruleId))
    if (expandedRule === ruleId) {
      setExpandedRule(null)
    }
  }

  const updateRule = (ruleId: string, updates: Partial<AutoAssignRule>) => {
    setRules(rules.map(r => 
      r.id === ruleId ? { ...r, ...updates } : r
    ))
  }

  const toggleCondition = (
    ruleId: string, 
    conditionType: 'jobTitles' | 'locations' | 'roles', 
    value: string
  ) => {
    const rule = rules.find(r => r.id === ruleId)
    if (!rule) return

    const currentValues = rule.conditions[conditionType]
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value]

    updateRule(ruleId, {
      conditions: {
        ...rule.conditions,
        [conditionType]: newValues,
      },
    })
  }

  const testRules = () => {
    // Test rules against current employees
    const results = teamMembers.map(member => {
      const matches = rules.some(rule => {
        if (!rule.enabled) return false
        
        const jobTitleMatch = rule.conditions.jobTitles.length === 0 || 
          rule.conditions.jobTitles.includes(member.role)
        const locationMatch = rule.conditions.locations.length === 0 || 
          rule.conditions.locations.some(loc => 
            locations.find(l => l.id === loc)?.name === member.location
          )
        
        return jobTitleMatch && locationMatch
      })
      
      return {
        employeeId: member.id,
        name: member.name,
        matches,
      }
    })
    
    setTestResults(results)
  }

  const handleSave = () => {
    if (onSave) {
      onSave(rules)
    }
    onClose()
  }

  const getMatchingCount = () => {
    if (!testResults) return 0
    return testResults.filter(r => r.matches).length
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Auto-assign Rules: ${certificationName}`}
      size="xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              leftIcon={<Play className="w-4 h-4" />}
              onClick={testRules}
            >
              Test Rules
            </Button>
            <Button onClick={handleSave}>
              Save Rules
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Info */}
        <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-element">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-blue-800">
              Auto-assign rules automatically request this certification from employees when certain conditions are met.
              Rules are checked when employees are hired, when their job title changes, or when their location changes.
            </p>
          </div>
        </div>

        {/* Rules */}
        <div className="space-y-3">
          {rules.map((rule, index) => (
            <div 
              key={rule.id}
              className={`border rounded-container overflow-hidden transition-all ${
                rule.enabled ? 'border-border-light' : 'border-gray-200 opacity-60'
              }`}
            >
              {/* Rule Header */}
              <div 
                className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer"
                onClick={() => setExpandedRule(expandedRule === rule.id ? null : rule.id)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    rule.enabled ? 'bg-primary-100 text-primary-600' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      {triggerOptions.find(t => t.id === rule.trigger)?.label || 'Rule'}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {rule.conditions.jobTitles.length > 0 
                        ? `${rule.conditions.jobTitles.length} job title(s)` 
                        : 'All job titles'}
                      {rule.conditions.locations.length > 0 
                        ? ` · ${rule.conditions.locations.length} location(s)` 
                        : ' · All locations'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      updateRule(rule.id, { enabled: !rule.enabled })
                    }}
                    className={`relative w-10 h-5 rounded-full transition-colors ${
                      rule.enabled ? 'bg-primary-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                        rule.enabled ? 'right-0.5' : 'left-0.5'
                      }`}
                    />
                  </button>
                  
                  {rules.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        removeRule(rule.id)
                      }}
                      className="p-2 rounded hover:bg-gray-200 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                    </button>
                  )}
                  
                  {expandedRule === rule.id ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>

              {/* Rule Content */}
              {expandedRule === rule.id && (
                <div className="p-4 space-y-4 border-t border-border-light">
                  {/* Trigger */}
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      When
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {triggerOptions.map((trigger) => (
                        <button
                          key={trigger.id}
                          onClick={() => updateRule(rule.id, { trigger: trigger.id as AutoAssignRule['trigger'] })}
                          className={`p-3 rounded-element border text-left transition-all ${
                            rule.trigger === trigger.id
                              ? 'border-primary-500 bg-primary-50'
                              : 'border-border-light hover:border-gray-300'
                          }`}
                        >
                          <p className="text-sm font-medium text-text-primary">{trigger.label}</p>
                          <p className="text-xs text-text-secondary mt-0.5">{trigger.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Job Titles */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-text-primary mb-2">
                      <Briefcase className="w-4 h-4 text-gray-500" />
                      If job title is
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {jobTitleOptions.map((title) => (
                        <button
                          key={title}
                          onClick={() => toggleCondition(rule.id, 'jobTitles', title)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                            rule.conditions.jobTitles.includes(title)
                              ? 'bg-primary-500 text-white'
                              : 'bg-gray-100 text-text-primary hover:bg-gray-200'
                          }`}
                        >
                          {title}
                        </button>
                      ))}
                    </div>
                    {rule.conditions.jobTitles.length === 0 && (
                      <p className="text-xs text-text-secondary mt-2">
                        No job titles selected = applies to all job titles
                      </p>
                    )}
                  </div>

                  {/* Locations */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-text-primary mb-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      At location
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {locations.map((location) => (
                        <button
                          key={location.id}
                          onClick={() => toggleCondition(rule.id, 'locations', location.id)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                            rule.conditions.locations.includes(location.id)
                              ? 'bg-primary-500 text-white'
                              : 'bg-gray-100 text-text-primary hover:bg-gray-200'
                          }`}
                        >
                          {location.name}
                        </button>
                      ))}
                    </div>
                    {rule.conditions.locations.length === 0 && (
                      <p className="text-xs text-text-secondary mt-2">
                        No locations selected = applies to all locations
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add Rule Button */}
        <button
          onClick={addRule}
          className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 rounded-element text-sm font-medium text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Another Rule
        </button>

        {/* Test Results */}
        {testResults && (
          <div className="border border-border-light rounded-container overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-border-light">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    getMatchingCount() > 0 ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    <Users className={`w-5 h-5 ${
                      getMatchingCount() > 0 ? 'text-green-600' : 'text-gray-400'
                    }`} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">
                      Test Results
                    </p>
                    <p className="text-xs text-text-secondary">
                      {getMatchingCount()} of {testResults.length} employees would receive this certification
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setTestResults(null)}
                  className="text-xs text-text-secondary hover:text-text-primary"
                >
                  Clear
                </button>
              </div>
            </div>
            
            <div className="max-h-48 overflow-auto">
              {testResults.map((result) => (
                <div
                  key={result.employeeId}
                  className={`flex items-center justify-between p-3 border-b border-border-light last:border-b-0 ${
                    result.matches ? 'bg-green-50' : ''
                  }`}
                >
                  <span className="text-sm text-text-primary">{result.name}</span>
                  {result.matches ? (
                    <span className="flex items-center gap-1 text-xs font-medium text-green-600">
                      <CheckCircle2 className="w-3 h-3" />
                      Would be assigned
                    </span>
                  ) : (
                    <span className="text-xs text-text-secondary">
                      No match
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}



