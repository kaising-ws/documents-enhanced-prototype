import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check, Minus, X } from 'lucide-react'

interface MultiSelectOption {
  id: string
  label: string
}

interface MultiSelectDropdownProps {
  options: MultiSelectOption[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
  className?: string
  allLabel?: string
}

export default function MultiSelectDropdown({
  options,
  selected,
  onChange,
  placeholder = 'Select...',
  className = '',
  allLabel = 'All',
}: MultiSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const allSelected = options.length > 0 && selected.length === options.length
  const someSelected = selected.length > 0 && selected.length < options.length

  const toggleOption = (id: string) => {
    onChange(
      selected.includes(id)
        ? selected.filter((s) => s !== id)
        : [...selected, id]
    )
  }

  const toggleAll = () => {
    onChange(allSelected ? [] : options.map((o) => o.id))
  }

  const removeChip = (id: string) => {
    onChange(selected.filter((s) => s !== id))
  }

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full h-10 px-3 rounded-element border border-border bg-white text-body text-text-primary hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
      >
        <span className={selected.length === 0 ? 'text-text-placeholder' : ''}>
          {selected.length === 0
            ? placeholder
            : `${selected.length} selected`}
        </span>
        <ChevronDown
          className={`w-[10px] h-[6px] text-text-secondary transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-0.5 bg-white rounded-container border border-border-light shadow-dropdown py-0.5 overflow-hidden">
          <div className="max-h-64 overflow-auto">
            {/* All toggle */}
            <button
              type="button"
              onClick={toggleAll}
              className="relative flex items-center gap-3 w-full px-4 min-h-[44px] py-3 text-body text-text-primary text-left group"
            >
              <span className="absolute inset-x-1 inset-y-0.5 rounded-element group-hover:bg-gray-50 transition-colors" />
              <span
                className={`relative w-[18px] h-[18px] rounded flex items-center justify-center border transition-all flex-shrink-0 ${
                  allSelected || someSelected
                    ? 'bg-primary-500 border-primary-500'
                    : 'bg-white border-border-medium'
                }`}
              >
                {allSelected && <Check className="w-3 h-3 text-white stroke-[3]" />}
                {someSelected && !allSelected && <Minus className="w-3 h-3 text-white stroke-[3]" />}
              </span>
              <span className="relative font-bold">{allLabel}</span>
            </button>

            <div className="mx-4 h-px bg-border-light" />

            {/* Options */}
            {options.map((option) => {
              const checked = selected.includes(option.id)
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => toggleOption(option.id)}
                  className="relative flex items-center gap-3 w-full px-4 min-h-[44px] py-3 text-body text-text-primary text-left group"
                >
                  <span className="absolute inset-x-1 inset-y-0.5 rounded-element group-hover:bg-gray-50 transition-colors" />
                  <span
                    className={`relative w-[18px] h-[18px] rounded flex items-center justify-center border transition-all flex-shrink-0 ${
                      checked
                        ? 'bg-primary-500 border-primary-500'
                        : 'bg-white border-border-medium'
                    }`}
                  >
                    {checked && <Check className="w-3 h-3 text-white stroke-[3]" />}
                  </span>
                  <span className="relative">{option.label}</span>
                </button>
              )
            })}

            {/* Clear */}
            {selected.length > 0 && (
              <>
                <div className="mx-4 h-px bg-border-light" />
                <button
                  type="button"
                  onClick={() => onChange([])}
                  className="relative w-full px-4 min-h-[44px] py-3 text-body font-semibold text-primary-500 text-left group"
                >
                  <span className="absolute inset-x-1 inset-y-0.5 rounded-element group-hover:bg-gray-50 transition-colors" />
                  <span className="relative">Clear</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Chips */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {selected.map((id) => {
            const option = options.find((o) => o.id === id)
            if (!option) return null
            return (
              <span
                key={id}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-500 text-white text-caption rounded-full"
              >
                {option.label}
                <button
                  type="button"
                  onClick={() => removeChip(id)}
                  className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )
          })}
        </div>
      )}
    </div>
  )
}
