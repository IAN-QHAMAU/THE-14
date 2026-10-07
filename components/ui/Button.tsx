import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => {
    const base =
      'inline-flex items-center justify-center font-medium transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed select-none'

    const variants = {
      primary: 'bg-stone-900 text-stone-50 hover:bg-stone-700 active:scale-[0.98]',
      secondary: 'border border-stone-300 text-stone-700 hover:bg-stone-100 active:scale-[0.98]',
      ghost: 'text-stone-500 hover:text-stone-900 hover:bg-stone-100',
      danger: 'bg-red-700 text-white hover:bg-red-600 active:scale-[0.98]',
    }

    const sizes = {
      sm: 'px-3 py-1.5 text-xs tracking-wide',
      md: 'px-5 py-2.5 text-sm tracking-wide',
      lg: 'px-6 py-3.5 text-base tracking-wide w-full',
    }

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            {children}
          </span>
        ) : (
          children
        )}
      </button>
    )
  }
)
Button.displayName = 'Button'
