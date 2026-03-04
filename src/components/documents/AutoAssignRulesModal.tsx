import { useState } from 'react'
import { 
  Users, 
  MapPin, 
  Briefcase, 
  Plus, 
  Trash2, 
  Play, 
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import MultiSelectDropdown from '../ui/MultiSelectDropdown'
import { locations, teamMembers } from '../../data/mockData'

interface AutoAssignRule {
  id: string
  conditions: {
    jobTitles: string[]
    locations: string[]
  }
  delayDays: number
  dueDays: number
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

const defaultRule: Omit<AutoAssignRule, 'id'> = {
  conditions: {
    jobTitles: [],
    locations: [],
  },
  delayDays: 0,
  dueDays: 7,
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
              Auto-assign rules automatically request this certification when a <strong>new employee is hired</strong> or
              an <strong>existing employee's job title changes</strong> to one matching the conditions below.
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
                      Rule {index + 1}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {rule.conditions.jobTitles.length > 0 
                        ? `${rule.conditions.jobTitles.length} job title(s)` 
                        : 'All job titles'}
                      {rule.conditions.locations.length > 0 
                        ? ` · ${rule.conditions.locations.length} location(s)` 
                        : ' · All locations'}
                      {` · ${rule.delayDays}d delay · due in ${rule.dueDays}d`}
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
                  {/* Job Titles */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-text-primary mb-2">
                      <Briefcase className="w-4 h-4 text-gray-500" />
                      For employees with job title
                    </label>
                    <MultiSelectDropdown
                      options={jobTitleOptions.map((t) => ({ id: t, label: t }))}
                      selected={rule.conditions.jobTitles}
                      onChange={(values) =>
                        updateRule(rule.id, {
                          conditions: { ...rule.conditions, jobTitles: values },
                        })
                      }
                      placeholder="Select job titles…"
                      allLabel="All"
                    />
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
                    <MultiSelectDropdown
                      options={locations.map((l) => ({ id: l.id, label: l.name }))}
                      selected={rule.conditions.locations}
                      onChange={(values) =>
                        updateRule(rule.id, {
                          conditions: { ...rule.conditions, locations: values },
                        })
                      }
                      placeholder="Select locations…"
                      allLabel="All"
                    />
                    {rule.conditions.locations.length === 0 && (
                      <p className="text-xs text-text-secondary mt-2">
                        No locations selected = applies to all locations
                      </p>
                    )}
                  </div>

                  {/* Timing */}
                  <div className="p-4 bg-gray-50 border border-border-light rounded-element space-y-4">
                    <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Timing</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-text-primary mb-1.5">
                          Assign date
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={0}
                            value={rule.delayDays}
                            onChange={(e) => updateRule(rule.id, { delayDays: Math.max(0, parseInt(e.target.value) || 0) })}
                            className="w-20 h-9 px-3 rounded-element border border-border bg-white text-sm text-text-primary text-center focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          />
                          <span className="text-sm text-text-secondary">
                            day{rule.delayDays !== 1 ? 's' : ''} after trigger
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-primary mb-1.5">
                          Due date
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={1}
                            value={rule.dueDays}
                            onChange={(e) => updateRule(rule.id, { dueDays: Math.max(1, parseInt(e.target.value) || 1) })}
                            className="w-20 h-9 px-3 rounded-element border border-border bg-white text-sm text-text-primary text-center focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          />
                          <span className="text-sm text-text-secondary">
                            day{rule.dueDays !== 1 ? 's' : ''} after trigger
                          </span>
                        </div>
                      </div>
                    </div>
                    {rule.delayDays >= rule.dueDays && (
                      <div className="flex items-center gap-2 text-xs text-amber-600">
                        <Info className="w-3 h-3 flex-shrink-0" />
                        The due date should be after the assign date.
                      </div>
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




