import { forwardRef } from 'react'
import { ChevronDown } from 'lucide-react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  hasDropdown?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      hasDropdown,
      leftIcon,
      rightIcon,
      children,
      className = '',
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-element'

    const variants = {
      primary:
        'bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-500 shadow-sm',
      secondary:
        'bg-gray-100 text-text-primary hover:bg-gray-200 focus:ring-gray-300',
      outline:
        'border border-border bg-white text-text-primary hover:bg-gray-50 focus:ring-primary-500',
      ghost:
        'text-text-primary hover:bg-gray-100 focus:ring-primary-500',
    }

    const sizes = {
      sm: 'h-8 px-3 text-sm gap-1.5',
      md: 'h-10 px-4 text-sm gap-2',
      lg: 'h-12 px-6 text-base gap-2',
    }

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
        {children}
        {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
        {hasDropdown && <ChevronDown className="w-4 h-4 ml-1" />}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button

