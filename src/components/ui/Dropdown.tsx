import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'

interface DropdownOption {
  id: string
  label: string
}

interface DropdownProps {
  options: DropdownOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export default function Dropdown({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  className = '',
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find((opt) => opt.id === value)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full h-10 px-3 rounded-element border border-border bg-white text-body text-text-primary hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
      >
        <span className={selectedOption ? '' : 'text-text-placeholder'}>
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown
          className={`w-[10px] h-[6px] text-text-secondary transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-0.5 bg-white rounded-container border border-border-light shadow-dropdown py-0.5 overflow-hidden">
          <div className="max-h-60 overflow-auto">
            {options.map((option) => (
              <button
                key={option.id}
                onClick={() => {
                  onChange(option.id)
                  setIsOpen(false)
                }}
                className="relative flex items-center justify-between w-full px-4 min-h-[44px] py-3 text-body text-text-primary text-left transition-colors group"
              >
                <span className="absolute inset-x-1 inset-y-0.5 rounded-element group-hover:bg-gray-50 transition-colors" />
                <span className="relative">{option.label}</span>
                {option.id === value && (
                  <Check className="relative w-4 h-4 text-primary-500" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
