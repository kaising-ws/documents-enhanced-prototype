import { useState } from 'react'
import { 
  Plus, 
  AlignLeft, 
  CircleDot, 
  CheckSquare, 
  Star, 
  GripVertical, 
  Trash2, 
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react'
import Button from '../ui/Button'

export interface FormField {
  id: string
  type: 'open-text' | 'single-select' | 'multiple-choice' | 'rating'
  label: string
  required: boolean
  options?: string[]
  maxRating?: number
}

interface FormFieldBuilderProps {
  fields: FormField[]
  onChange: (fields: FormField[]) => void
  sectionLabel: string
}

const fieldTypes = [
  { type: 'open-text' as const, label: 'Open Text', icon: <AlignLeft className="w-4 h-4" />, description: 'Free-form text response' },
  { type: 'single-select' as const, label: 'Single Select', icon: <CircleDot className="w-4 h-4" />, description: 'Choose one option' },
  { type: 'multiple-choice' as const, label: 'Multiple Choice', icon: <CheckSquare className="w-4 h-4" />, description: 'Select multiple options' },
  { type: 'rating' as const, label: 'Rating Scale', icon: <Star className="w-4 h-4" />, description: '1-5 star rating' },
]

export default function FormFieldBuilder({ fields, onChange, sectionLabel }: FormFieldBuilderProps) {
  const [isAddingField, setIsAddingField] = useState(false)
  const [expandedFieldId, setExpandedFieldId] = useState<string | null>(null)

  const addField = (type: FormField['type']) => {
    const newField: FormField = {
      id: `field-${Date.now()}`,
      type,
      label: '',
      required: true,
      options: type === 'single-select' || type === 'multiple-choice' ? ['Option 1', 'Option 2'] : undefined,
      maxRating: type === 'rating' ? 5 : undefined,
    }
    onChange([...fields, newField])
    setExpandedFieldId(newField.id)
    setIsAddingField(false)
  }

  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    onChange(fields.map((f) => (f.id === fieldId ? { ...f, ...updates } : f)))
  }

  const removeField = (fieldId: string) => {
    onChange(fields.filter((f) => f.id !== fieldId))
    if (expandedFieldId === fieldId) {
      setExpandedFieldId(null)
    }
  }

  const addOption = (fieldId: string) => {
    const field = fields.find((f) => f.id === fieldId)
    if (field && field.options) {
      updateField(fieldId, { options: [...field.options, `Option ${field.options.length + 1}`] })
    }
  }

  const updateOption = (fieldId: string, optionIndex: number, value: string) => {
    const field = fields.find((f) => f.id === fieldId)
    if (field && field.options) {
      const newOptions = [...field.options]
      newOptions[optionIndex] = value
      updateField(fieldId, { options: newOptions })
    }
  }

  const removeOption = (fieldId: string, optionIndex: number) => {
    const field = fields.find((f) => f.id === fieldId)
    if (field && field.options && field.options.length > 1) {
      updateField(fieldId, { options: field.options.filter((_, i) => i !== optionIndex) })
    }
  }

  const moveField = (index: number, direction: 'up' | 'down') => {
    const newFields = [...fields]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex >= 0 && targetIndex < fields.length) {
      [newFields[index], newFields[targetIndex]] = [newFields[targetIndex], newFields[index]]
      onChange(newFields)
    }
  }

  const getFieldTypeInfo = (type: FormField['type']) => {
    return fieldTypes.find((ft) => ft.type === type)
  }

  return (
    <div className="space-y-3">
      {/* Existing Fields */}
      {fields.map((field, index) => {
        const typeInfo = getFieldTypeInfo(field.type)
        const isExpanded = expandedFieldId === field.id

        return (
          <div
            key={field.id}
            className="border border-border-light rounded-element bg-white overflow-hidden"
          >
            {/* Field Header */}
            <div
              className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50"
              onClick={() => setExpandedFieldId(isExpanded ? null : field.id)}
            >
              <GripVertical className="w-4 h-4 text-gray-400 cursor-grab" />
              <div className="w-7 h-7 rounded bg-gray-100 flex items-center justify-center text-gray-500">
                {typeInfo?.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">
                  {field.label || `Untitled ${typeInfo?.label}`}
                </p>
                <p className="text-xs text-text-secondary">{typeInfo?.label}</p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    moveField(index, 'up')
                  }}
                  disabled={index === 0}
                  className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronUp className="w-4 h-4 text-gray-500" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    moveField(index, 'down')
                  }}
                  disabled={index === fields.length - 1}
                  className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    removeField(field.id)
                  }}
                  className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100 text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
              </div>
            </div>

            {/* Expanded Field Editor */}
            {isExpanded && (
              <div className="border-t border-border-light p-4 bg-gray-50 space-y-4">
                {/* Label */}
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                    Question
                  </label>
                  <input
                    type="text"
                    value={field.label}
                    onChange={(e) => updateField(field.id, { label: e.target.value })}
                    placeholder="Enter your question..."
                    className="w-full h-9 px-3 rounded border border-border bg-white text-sm text-text-primary placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                {/* Options for single-select and multiple-choice */}
                {(field.type === 'single-select' || field.type === 'multiple-choice') && field.options && (
                  <div>
                    <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                      Options
                    </label>
                    <div className="space-y-2">
                      {field.options.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex items-center gap-2">
                          <div className="w-5 h-5 flex items-center justify-center">
                            {field.type === 'single-select' ? (
                              <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                            ) : (
                              <div className="w-4 h-4 rounded border-2 border-gray-300" />
                            )}
                          </div>
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => updateOption(field.id, optionIndex, e.target.value)}
                            className="flex-1 h-8 px-2 rounded border border-border bg-white text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          />
                          {field.options && field.options.length > 1 && (
                            <button
                              onClick={() => removeOption(field.id, optionIndex)}
                              className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-200 text-gray-400 hover:text-red-500"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        onClick={() => addOption(field.id)}
                        className="flex items-center gap-1.5 text-sm text-primary-500 hover:text-primary-600 font-medium"
                      >
                        <Plus className="w-4 h-4" />
                        Add option
                      </button>
                    </div>
                  </div>
                )}

                {/* Rating scale preview */}
                {field.type === 'rating' && (
                  <div>
                    <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                      Preview
                    </label>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className="w-6 h-6 text-yellow-400 fill-yellow-400"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Required toggle */}
                <div className="flex items-center justify-between pt-2 border-t border-border-light">
                  <span className="text-sm text-text-primary">Required</span>
                  <button
                    onClick={() => updateField(field.id, { required: !field.required })}
                    className={`relative w-10 h-6 rounded-full transition-colors ${
                      field.required ? 'bg-primary-500' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                        field.required ? 'left-5' : 'left-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}
          </div>
        )
      })}

      {/* Add Field Button */}
      {!isAddingField ? (
        <button
          onClick={() => setIsAddingField(true)}
          className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 rounded-element text-sm font-medium text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add question to {sectionLabel}
        </button>
      ) : (
        <div className="border border-border-light rounded-element bg-white p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-text-primary">Select question type</p>
            <button
              onClick={() => setIsAddingField(false)}
              className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {fieldTypes.map((ft) => (
              <button
                key={ft.type}
                onClick={() => addField(ft.type)}
                className="flex items-center gap-3 p-3 rounded-element border border-border-light hover:border-primary-500 hover:bg-primary-50 transition-colors text-left"
              >
                <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-gray-600">
                  {ft.icon}
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">{ft.label}</p>
                  <p className="text-xs text-text-secondary">{ft.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {fields.length === 0 && !isAddingField && (
        <p className="text-xs text-text-secondary text-center py-2">
          No questions added yet. Click the button above to add questions.
        </p>
      )}
    </div>
  )
}

