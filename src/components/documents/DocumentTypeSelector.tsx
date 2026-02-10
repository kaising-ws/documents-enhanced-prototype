import { FileSignature, PenLine, Upload, Copy } from 'lucide-react'
import Modal from '../ui/Modal'

export type DocumentCreationType = 'pdf-signing' | 'write-up' | 'collect-uploads' | 'duplicate'

interface DocumentTypeSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (type: DocumentCreationType) => void
}

interface DocumentTypeOption {
  id: DocumentCreationType
  icon: React.ReactNode
  title: string
  description: string
  iconBgColor: string
}

const options: DocumentTypeOption[] = [
  {
    id: 'pdf-signing',
    icon: <FileSignature className="w-8 h-8" />,
    title: 'Upload a PDF for signing',
    description: 'Upload a document that requires signatures from team members.',
    iconBgColor: 'bg-blue-50 text-blue-600',
  },
  {
    id: 'write-up',
    icon: <PenLine className="w-8 h-8" />,
    title: 'Create a write up',
    description: 'Document employee performance issues, incidents, or recognition.',
    iconBgColor: 'bg-amber-50 text-amber-600',
  },
  {
    id: 'collect-uploads',
    icon: <Upload className="w-8 h-8" />,
    title: 'Collect uploads from team members',
    description: 'Request certificates, licenses, or other documents from employees.',
    iconBgColor: 'bg-emerald-50 text-emerald-600',
  },
  {
    id: 'duplicate',
    icon: <Copy className="w-8 h-8" />,
    title: 'Duplicate from existing document',
    description: 'Copy an existing template to create a new version quickly.',
    iconBgColor: 'bg-purple-50 text-purple-600',
  },
]

export default function DocumentTypeSelector({
  isOpen,
  onClose,
  onSelect,
}: DocumentTypeSelectorProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="xl">
      <div className="pb-2">
        <h2 className="text-xl font-bold text-text-primary mb-8">
          What would you like to create?
        </h2>

        <div className="grid grid-cols-2 gap-4">
          {options.map((option) => (
            <button
              key={option.id}
              onClick={() => onSelect(option.id)}
              className="group relative flex flex-col items-center p-6 bg-white border border-border-light rounded-container hover:border-primary-500 hover:shadow-card transition-all text-center"
            >
              {/* Icon */}
              <div
                className={`w-16 h-16 rounded-xl flex items-center justify-center mb-4 ${option.iconBgColor}`}
              >
                {option.icon}
              </div>

              {/* Title */}
              <h3 className="text-base font-semibold text-text-primary mb-2">
                {option.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-text-secondary leading-relaxed">
                {option.description}
              </p>

              {/* Hover indicator */}
              <div className="absolute inset-0 rounded-container border-2 border-transparent group-hover:border-primary-500 pointer-events-none transition-colors" />
            </button>
          ))}
        </div>
      </div>
    </Modal>
  )
}

