interface SegmentedControlProps {
  segments: { id: string; label: string }[]
  activeSegment: string
  onChange: (segmentId: string) => void
}

export default function SegmentedControl({
  segments,
  activeSegment,
  onChange,
}: SegmentedControlProps) {
  return (
    <div className="inline-flex bg-surface-gray rounded-element px-1">
      {segments.map((segment) => (
        <button
          key={segment.id}
          onClick={() => onChange(segment.id)}
          className={`
            relative h-10 px-4 text-body font-semibold transition-all
            ${segment.id === activeSegment
              ? 'text-text-primary'
              : 'text-text-secondary hover:text-text-primary'
            }
          `}
        >
          {segment.label}
          {segment.id === activeSegment && (
            <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-primary-500 rounded-t-full" />
          )}
        </button>
      ))}
    </div>
  )
}
