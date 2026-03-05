import { forwardRef } from 'react'
import { ChevronDown, Loader2 } from 'lucide-react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'accent-blue' | 'plain-gray' | 'plain-blue' | 'plain-red' | 'clear'
  size?: 'sm' | 'md' | 'lg'
  hasDropdown?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'accent-blue',
      size = 'md',
      hasDropdown,
      leftIcon,
      rightIcon,
      loading,
      children,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-semibold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 rounded-element'

    const variants = {
      'accent-blue':
        'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 focus:ring-primary-500 disabled:bg-primary-500/50 disabled:text-white/70',
      'plain-gray':
        'bg-gray-100 text-text-primary hover:bg-gray-200 active:bg-gray-300 focus:ring-gray-400 disabled:bg-gray-100/60 disabled:text-text-disabled',
      'plain-blue':
        'bg-primary-50 text-primary-500 hover:bg-primary-100 active:bg-primary-100 focus:ring-primary-500 disabled:bg-primary-50/50 disabled:text-primary-500/50',
      'plain-red':
        'bg-red-50 text-accent-red-500 hover:bg-red-100 active:bg-red-100 focus:ring-accent-red-400 disabled:bg-red-50/50 disabled:text-accent-red-500/50',
      'clear':
        'bg-transparent text-text-primary hover:bg-gray-50 active:bg-gray-100 focus:ring-primary-500 disabled:text-text-disabled',
    }

    const sizes = {
      sm: 'h-8 px-2 text-caption gap-1',
      md: 'h-10 px-[10px] text-body gap-1',
      lg: 'h-12 px-3 text-body gap-1.5',
    }

    const isDisabled = disabled || loading

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={isDisabled}
        {...props}
      >
        {loading ? (
          <Loader2 className={`animate-spin ${size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'}`} />
        ) : (
          <>
            {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
            {hasDropdown && <ChevronDown className="w-[10px] h-[6px] ml-0.5" />}
          </>
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button
