import { useState, useRef, useEffect } from 'react'
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

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation()
          setIsOpen(!isOpen)
        }}
        className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100 transition-colors"
      >
        {trigger || <MoreHorizontal className="w-5 h-5 text-gray-500" />}
      </button>

      {isOpen && (
        <div
          className={`absolute z-50 mt-1 min-w-[180px] bg-white rounded-element border border-border-light shadow-dropdown py-1 ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
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

