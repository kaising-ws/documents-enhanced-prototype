import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'

interface FilterOption {
  id: string
  label: string
}

interface FilterSelectProps {
  options: FilterOption[]
  value: string
  onChange: (value: string) => void
  allLabel?: string
  icon?: React.ReactNode
  className?: string
}

export default function FilterSelect({
  options,
  value,
  onChange,
  allLabel = 'All',
  icon,
  className = '',
}: FilterSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [openUpward, setOpenUpward] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const allOptions: FilterOption[] = [{ id: 'all', label: allLabel }, ...options]
  const selectedOption = allOptions.find((o) => o.id === value)
  const isActive = value !== 'all'

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleToggle = () => {
    if (!isOpen) {
      const rect = ref.current?.getBoundingClientRect()
      if (rect) {
        const spaceBelow = window.innerHeight - rect.bottom
        const dropdownHeight = allOptions.length * 44 + 8
        setOpenUpward(spaceBelow < dropdownHeight)
      }
    }
    setIsOpen(!isOpen)
  }

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        onClick={handleToggle}
        className={`
          inline-flex items-center gap-1.5 h-8 rounded-element border text-caption font-medium
          cursor-pointer transition-all
          ${icon ? 'pl-2 pr-2.5' : 'px-2.5'}
          ${isActive
            ? 'bg-primary-50 border-primary-500/30 text-primary-700'
            : 'bg-white border-border text-text-secondary hover:border-border-medium hover:text-text-primary'
          }
        `}
      >
        {icon && <span className="flex-shrink-0 w-3.5 h-3.5 flex items-center justify-center">{icon}</span>}
        <span>{selectedOption?.label || allLabel}</span>
        <ChevronDown className={`w-2.5 h-2.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          className={`absolute z-50 min-w-[180px] bg-white rounded-container border border-border-light shadow-dropdown py-0.5 left-0
            ${openUpward ? 'bottom-full mb-1' : 'top-full mt-1'}`}
        >
          <div className="max-h-[280px] overflow-auto">
            {allOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => {
                  onChange(option.id)
                  setIsOpen(false)
                }}
                className="relative flex items-center justify-between w-full px-4 min-h-[40px] py-2.5 text-body text-left transition-colors group"
              >
                <span className="absolute inset-x-1 inset-y-0.5 rounded-element group-hover:bg-gray-50 transition-colors" />
                <span className={`relative ${option.id === value ? 'text-text-primary font-medium' : 'text-text-primary'}`}>
                  {option.label}
                </span>
                {option.id === value && (
                  <Check className="relative w-4 h-4 text-primary-500 flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
