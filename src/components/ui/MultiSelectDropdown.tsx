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
        className="flex items-center justify-between w-full h-10 px-3 rounded-element border border-border bg-white text-sm text-text-primary hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        <span className={selected.length === 0 ? 'text-text-placeholder' : ''}>
          {selected.length === 0
            ? placeholder
            : `${selected.length} selected`}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded-element border border-border shadow-dropdown max-h-64 overflow-auto">
          {/* All toggle */}
          <button
            type="button"
            onClick={toggleAll}
            className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-text-primary hover:bg-gray-50 text-left border-b border-border-light"
          >
            <span
              className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-all flex-shrink-0 ${
                allSelected
                  ? 'bg-primary-500 border-primary-500'
                  : someSelected
                    ? 'bg-primary-500 border-primary-500'
                    : 'bg-white border-gray-300'
              }`}
            >
              {allSelected && <Check className="w-3 h-3 text-white stroke-[3]" />}
              {someSelected && !allSelected && <Minus className="w-3 h-3 text-white stroke-[3]" />}
            </span>
            {allLabel}
          </button>

          {/* Options */}
          {options.map((option) => {
            const checked = selected.includes(option.id)
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => toggleOption(option.id)}
                className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-text-primary hover:bg-gray-50 text-left"
              >
                <span
                  className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-all flex-shrink-0 ${
                    checked
                      ? 'bg-primary-500 border-primary-500'
                      : 'bg-white border-gray-300'
                  }`}
                >
                  {checked && <Check className="w-3 h-3 text-white stroke-[3]" />}
                </span>
                {option.label}
              </button>
            )
          })}

          {/* Clear */}
          {selected.length > 0 && (
            <button
              type="button"
              onClick={() => {
                onChange([])
              }}
              className="w-full px-3 py-2.5 text-sm font-medium text-primary-500 hover:bg-gray-50 text-left border-t border-border-light"
            >
              Clear
            </button>
          )}
        </div>
      )}

      {/* Chips */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selected.map((id) => {
            const option = options.find((o) => o.id === id)
            if (!option) return null
            return (
              <span
                key={id}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-500 text-white text-xs font-medium rounded-full"
              >
                {option.label}
                <button
                  type="button"
                  onClick={() => removeChip(id)}
                  className="hover:bg-primary-600 rounded-full p-0.5 transition-colors"
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
