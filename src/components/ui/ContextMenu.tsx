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
      const rect = menuRef.current?.getBoundingClientRect()
      if (rect) {
        const spaceBelow = window.innerHeight - rect.bottom
        const dropdownHeight = items.length * 44 + 4
        setOpenUpward(spaceBelow < dropdownHeight)
      }
    }
    setIsOpen(!isOpen)
  }, [isOpen, items.length])

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={handleToggle}
        className="w-8 h-8 flex items-center justify-center rounded-element hover:bg-gray-50 transition-colors"
      >
        {trigger || <MoreHorizontal className="w-5 h-5 text-text-secondary" />}
      </button>

      {isOpen && (
        <div
          className={`absolute z-50 min-w-[200px] bg-white rounded-container border border-border-light shadow-dropdown py-0.5 ${
            align === 'right' ? 'right-0' : 'left-0'
          } ${openUpward ? 'bottom-full mb-1' : 'top-full mt-0.5'}`}
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
                relative w-full flex items-center gap-2 px-4 min-h-[44px] py-3 text-body text-left transition-colors group
                ${item.disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                ${item.variant === 'danger' ? 'text-accent-red-500' : 'text-text-primary'}
              `}
            >
              <span
                className={`absolute inset-x-1 inset-y-0.5 rounded-element transition-colors ${
                  !item.disabled ? (item.variant === 'danger' ? 'group-hover:bg-red-50' : 'group-hover:bg-gray-50') : ''
                }`}
              />
              {item.icon && <span className="relative flex-shrink-0 w-5 h-5">{item.icon}</span>}
              <span className="relative">{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
