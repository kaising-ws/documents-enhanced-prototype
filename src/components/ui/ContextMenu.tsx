import { useState, useRef, useEffect, useCallback } from 'react'
import { MoreHorizontal } from 'lucide-react'

export interface ContextMenuItem {
  id: string
  label: string
  icon?: React.ReactNode
  onClick: () => void
  variant?: 'default' | 'danger'
  disabled?: boolean
}

interface ContextMenuProps {
  items: ContextMenuItem[]
  trigger?: React.ReactNode
  align?: 'left' | 'right'
}

export default function ContextMenu({ items, trigger, align = 'right' }: ContextMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [openUpward, setOpenUpward] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isOpen) {
      // Check if the dropdown would overflow below the viewport
      const rect = menuRef.current?.getBoundingClientRect()
      if (rect) {
        const spaceBelow = window.innerHeight - rect.bottom
        // rough estimate: ~40px per item + 8px padding
        const dropdownHeight = items.length * 40 + 8
        setOpenUpward(spaceBelow < dropdownHeight)
      }
    }
    setIsOpen(!isOpen)
  }, [isOpen, items.length])

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={handleToggle}
        className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100 transition-colors"
      >
        {trigger || <MoreHorizontal className="w-5 h-5 text-gray-500" />}
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className={`absolute z-50 min-w-[180px] bg-white rounded-element border border-border-light shadow-dropdown py-1 ${
            align === 'right' ? 'right-0' : 'left-0'
          } ${openUpward ? 'bottom-full mb-1' : 'top-full mt-1'}`}
        >
          {items.map((item) => (
            <button
              key={item.id}
              onClick={(e) => {
                e.stopPropagation()
                if (!item.disabled) {
                  item.onClick()
                  setIsOpen(false)
                }
              }}
              disabled={item.disabled}
              className={`
                w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors
                ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                ${item.variant === 'danger'
                  ? 'text-red-600 hover:bg-red-50'
                  : 'text-text-primary hover:bg-gray-50'
                }
              `}
            >
              {item.icon && <span className="flex-shrink-0 w-4 h-4">{item.icon}</span>}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
