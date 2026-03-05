import { Search } from 'lucide-react'

interface SearchBoxProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export default function SearchBox({
  value,
  onChange,
  placeholder = 'Search',
  className = '',
}: SearchBoxProps) {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center">
        <Search className="w-5 h-5 text-text-secondary" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-10 pl-10 pr-3 rounded-element border border-border bg-white text-body text-text-primary placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
      />
    </div>
  )
}
