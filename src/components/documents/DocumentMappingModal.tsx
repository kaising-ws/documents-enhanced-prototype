import { useState } from 'react'
import { X, Type, Calendar, PenTool, CheckSquare, User, Building2, GripVertical, Trash2 } from 'lucide-react'
import Button from '../ui/Button'

interface DocumentMappingModalProps {
  isOpen: boolean
  onClose: () => void
  fileName: string
  documentName: string
}

interface FieldType {
  id: string
  type: 'signature' | 'date' | 'text' | 'checkbox' | 'initials'
  label: string
  icon: React.ReactNode
  signer: 'team-member' | 'company'
  x: number
  y: number
}

const fieldOptions = [
  { type: 'signature' as const, label: 'Signature', icon: <PenTool className="w-4 h-4" /> },
  { type: 'date' as const, label: 'Date', icon: <Calendar className="w-4 h-4" /> },
  { type: 'text' as const, label: 'Text', icon: <Type className="w-4 h-4" /> },
  { type: 'checkbox' as const, label: 'Checkbox', icon: <CheckSquare className="w-4 h-4" /> },
  { type: 'initials' as const, label: 'Initials', icon: <PenTool className="w-4 h-4" /> },
]

export default function DocumentMappingModal({
  isOpen,
  onClose,
  fileName,
  documentName,
}: DocumentMappingModalProps) {
  const [fields, setFields] = useState<FieldType[]>([])
  const [selectedSigner, setSelectedSigner] = useState<'team-member' | 'company'>('team-member')
  const [draggedField, setDraggedField] = useState<string | null>(null)

  if (!isOpen) return null

  const handleAddField = (type: FieldType['type'], label: string, icon: React.ReactNode) => {
    const newField: FieldType = {
      id: `field-${Date.now()}`,
      type,
      label,
      icon,
      signer: selectedSigner,
      x: 100 + Math.random() * 200,
      y: 100 + Math.random() * 300,
    }
    setFields([...fields, newField])
  }

  const handleRemoveField = (fieldId: string) => {
    setFields(fields.filter((f) => f.id !== fieldId))
  }

  const handleDragStart = (fieldId: string) => {
    setDraggedField(fieldId)
  }

  const handleDragEnd = () => {
    setDraggedField(null)
  }

  const handleDocumentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (draggedField) {
      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      
      setFields(fields.map((f) =>
        f.id === draggedField ? { ...f, x, y } : f
      ))
      setDraggedField(null)
    }
  }

  const handleSave = () => {
    console.log('Saving document mapping:', { documentName, fields })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Full screen modal */}
      <div className="relative flex w-full h-full bg-white">
        {/* Left Sidebar - Field Options */}
        <div className="w-72 border-r border-border-light flex flex-col bg-gray-50">
          {/* Header */}
          <div className="p-4 border-b border-border-light bg-white">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-bold text-text-primary">Map Document</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <p className="text-sm text-text-secondary truncate">{documentName}</p>
          </div>

          {/* Signer Selection */}
          <div className="p-4 border-b border-border-light">
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
              Adding fields for
            </label>
            <div className="space-y-2">
              <button
                onClick={() => setSelectedSigner('team-member')}
                className={`w-full flex items-center gap-3 p-3 rounded-element border transition-colors ${
                  selectedSigner === 'team-member'
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-border-light bg-white hover:bg-gray-50'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  selectedSigner === 'team-member' ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  <User className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-text-primary">Team Member</p>
                  <p className="text-xs text-text-secondary">Employee signer</p>
                </div>
              </button>
              <button
                onClick={() => setSelectedSigner('company')}
                className={`w-full flex items-center gap-3 p-3 rounded-element border transition-colors ${
                  selectedSigner === 'company'
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-border-light bg-white hover:bg-gray-50'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  selectedSigner === 'company' ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  <Building2 className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-text-primary">Company</p>
                  <p className="text-xs text-text-secondary">Manager/Admin signer</p>
                </div>
              </button>
            </div>
          </div>

          {/* Field Types */}
          <div className="p-4 flex-1 overflow-auto">
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
              Drag fields to document
            </label>
            <div className="space-y-2">
              {fieldOptions.map((option) => (
                <button
                  key={option.type}
                  onClick={() => handleAddField(option.type, option.label, option.icon)}
                  className="w-full flex items-center gap-3 p-3 rounded-element border border-border-light bg-white hover:bg-gray-50 hover:border-gray-300 transition-colors cursor-grab active:cursor-grabbing"
                >
                  <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-gray-600">
                    {option.icon}
                  </div>
                  <span className="text-sm font-medium text-text-primary">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Added Fields List */}
          {fields.length > 0 && (
            <div className="p-4 border-t border-border-light">
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
                Added Fields ({fields.length})
              </label>
              <div className="space-y-2 max-h-40 overflow-auto">
                {fields.map((field) => (
                  <div
                    key={field.id}
                    className="flex items-center justify-between p-2 bg-white rounded border border-border-light"
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded flex items-center justify-center ${
                        field.signer === 'team-member' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
                      }`}>
                        {field.icon}
                      </div>
                      <span className="text-xs font-medium text-text-primary">{field.label}</span>
                    </div>
                    <button
                      onClick={() => handleRemoveField(field.id)}
                      className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100 transition-colors"
                    >
                      <Trash2 className="w-3 h-3 text-gray-400" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="p-4 border-t border-border-light bg-white">
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleSave} className="flex-1">
                Save Template
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content - Document Preview */}
        <div className="flex-1 bg-gray-200 p-8 overflow-auto">
          <div className="max-w-3xl mx-auto">
            {/* Document Container */}
            <div
              className="relative bg-white shadow-lg rounded-lg overflow-hidden"
              style={{ minHeight: '800px', aspectRatio: '8.5/11' }}
              onClick={handleDocumentClick}
            >
              {/* Simulated PDF Content */}
              <div className="absolute inset-0 p-12">
                <div className="space-y-6">
                  {/* Header */}
                  <div className="text-center border-b border-gray-200 pb-6">
                    <h1 className="text-2xl font-bold text-gray-800">{documentName}</h1>
                    <p className="text-sm text-gray-500 mt-2">{fileName}</p>
                  </div>

                  {/* Simulated content lines */}
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-100 rounded w-full" />
                    <div className="h-4 bg-gray-100 rounded w-11/12" />
                    <div className="h-4 bg-gray-100 rounded w-full" />
                    <div className="h-4 bg-gray-100 rounded w-9/12" />
                  </div>

                  <div className="space-y-3 pt-4">
                    <div className="h-4 bg-gray-100 rounded w-full" />
                    <div className="h-4 bg-gray-100 rounded w-10/12" />
                    <div className="h-4 bg-gray-100 rounded w-full" />
                    <div className="h-4 bg-gray-100 rounded w-8/12" />
                  </div>

                  <div className="space-y-3 pt-4">
                    <div className="h-4 bg-gray-100 rounded w-full" />
                    <div className="h-4 bg-gray-100 rounded w-full" />
                    <div className="h-4 bg-gray-100 rounded w-7/12" />
                  </div>

                  {/* Signature area hint */}
                  <div className="pt-12 mt-12 border-t border-dashed border-gray-300">
                    <p className="text-xs text-gray-400 text-center mb-8">
                      Click on the document to place fields, or drag them from the sidebar
                    </p>
                    <div className="flex justify-between">
                      <div className="text-center">
                        <div className="w-48 border-b border-gray-300 mb-2" />
                        <p className="text-xs text-gray-500">Team Member Signature</p>
                      </div>
                      <div className="text-center">
                        <div className="w-48 border-b border-gray-300 mb-2" />
                        <p className="text-xs text-gray-500">Date</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Placed Fields */}
              {fields.map((field) => (
                <div
                  key={field.id}
                  draggable
                  onDragStart={() => handleDragStart(field.id)}
                  onDragEnd={handleDragEnd}
                  className={`absolute cursor-move group ${
                    draggedField === field.id ? 'opacity-50' : ''
                  }`}
                  style={{ left: field.x, top: field.y }}
                >
                  <div className={`flex items-center gap-1 px-2 py-1.5 rounded border-2 shadow-sm ${
                    field.signer === 'team-member'
                      ? 'bg-blue-50 border-blue-400 text-blue-700'
                      : 'bg-purple-50 border-purple-400 text-purple-700'
                  }`}>
                    <GripVertical className="w-3 h-3 opacity-50" />
                    {field.icon}
                    <span className="text-xs font-medium">{field.label}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemoveField(field.id)
                      }}
                      className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}



