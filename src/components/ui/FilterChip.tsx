interface FilterChipProps {
  label: string
  count?: number
  isActive: boolean
  onClick: () => void
  dotColor?: string
  showDot?: boolean
}

export default function FilterChip({
  label,
  count,
  isActive,
  onClick,
  dotColor = 'bg-gray-400',
  showDot = false,
}: FilterChipProps) {
  return (
    <button
      onClick={onClick}
      className={`
        inline-flex items-center gap-1.5 h-8 px-3 rounded-element text-caption font-medium transition-all
        ${isActive
          ? 'bg-text-primary text-white shadow-card'
          : 'bg-white text-text-secondary border border-border-light hover:border-border-medium hover:text-text-primary'
        }
      `}
    >
      {showDot && (
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isActive ? 'bg-white/60' : dotColor}`} />
      )}
      {label}
      {count !== undefined && (
        <span className={isActive ? 'text-white/60' : 'text-text-placeholder'}>
          {count}
        </span>
      )}
    </button>
  )
}
