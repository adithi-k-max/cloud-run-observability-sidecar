import React from 'react'
import { Loader2 } from 'lucide-react'

interface ProbeButtonProps {
  label: string
  onClick: () => void
  isLoading?: boolean
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'secondary'
  className?: string
}

const SIZE_CLASSES: Record<NonNullable<ProbeButtonProps['size']>, string> = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-6 py-2.5 text-sm gap-2',
}

const ICON_SIZE: Record<NonNullable<ProbeButtonProps['size']>, number> = {
  sm: 12,
  md: 14,
  lg: 14,
}

export const ProbeButton: React.FC<ProbeButtonProps> = ({
  label,
  onClick,
  isLoading = false,
  disabled = false,
  size = 'md',
  variant = 'primary',
  className = '',
}) => {
  const isDisabled = disabled || isLoading

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      aria-busy={isLoading}
      aria-label={isLoading ? 'Running probe...' : label}
      className={[
        // Base
        'inline-flex items-center justify-center font-display font-medium',
        'rounded-none select-none',
        'transition-all duration-150',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D7FF64] focus-visible:ring-offset-1 focus-visible:ring-offset-[#10110F]',
        SIZE_CLASSES[size ?? 'md'],
        // Variant
        variant === 'primary'
          ? 'bg-[#D7FF64] text-[#10110F] hover:brightness-110 active:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:brightness-75'
          : 'bg-[#191B18] text-[#F4F4EC] border border-[rgba(162,166,155,0.25)] hover:border-[rgba(162,166,155,0.45)] active:bg-[#0E0F0D] disabled:opacity-40 disabled:cursor-not-allowed',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {isLoading ? (
        <>
          <Loader2
            size={ICON_SIZE[size ?? 'md']}
            className="animate-spin flex-shrink-0"
            aria-hidden="true"
          />
          <span>Running...</span>
        </>
      ) : (
        <span>{label}</span>
      )}
    </button>
  )
}
