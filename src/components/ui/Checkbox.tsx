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
    <label className={`flex items-center gap-2.5 cursor-pointer ${className}`}>
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`
          w-5 h-5 rounded flex items-center justify-center border-2 transition-all
          ${checked
            ? 'bg-primary-500 border-primary-500'
            : 'bg-white border-gray-300 hover:border-primary-500'
          }
        `}
      >
        {checked && <Check className="w-3 h-3 text-white stroke-[3]" />}
      </button>
      {label && (
        <span className="text-sm text-text-primary select-none">{label}</span>
      )}
    </label>
  )
}

