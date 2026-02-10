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
    <div className="inline-flex rounded-element border border-border-light overflow-hidden">
      {segments.map((segment, index) => (
        <button
          key={segment.id}
          onClick={() => onChange(segment.id)}
          className={`
            h-10 px-4 text-sm font-semibold transition-all
            ${segment.id === activeSegment
              ? 'bg-nav text-white'
              : 'bg-white text-text-primary hover:bg-gray-50'
            }
            ${index > 0 ? 'border-l border-border-light' : ''}
          `}
        >
          {segment.label}
        </button>
      ))}
    </div>
  )
}

