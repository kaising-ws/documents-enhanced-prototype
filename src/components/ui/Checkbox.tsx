import { Check } from 'lucide-react'

interface CheckboxProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  className?: string
}

export default function Checkbox({
  checked,
  onChange,
  label,
  className = '',
}: CheckboxProps) {
  return (
    <label className={`flex items-center gap-2 cursor-pointer ${className}`}>
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`
          w-[18px] h-[18px] rounded flex items-center justify-center border transition-all flex-shrink-0
          ${checked
            ? 'bg-primary-500 border-primary-500'
            : 'bg-white border-border-medium hover:border-primary-500'
          }
        `}
      >
        {checked && <Check className="w-3 h-3 text-white stroke-[3]" />}
      </button>
      {label && (
        <span className="text-body text-text-primary select-none">{label}</span>
      )}
    </label>
  )
}
