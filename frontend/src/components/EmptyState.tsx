import React from 'react'
import { ScanSearch } from 'lucide-react'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description: string
  action?: React.ReactNode
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
}) => {
  return (
    <div className="flex items-center justify-center w-full py-16 px-4">
      <div
        className="flex flex-col items-center text-center max-w-sm w-full
          border border-dashed border-[rgba(162,166,155,0.20)]
          bg-[#191B18] px-8 py-12 gap-4"
      >
        {/* Icon */}
        <div className="flex items-center justify-center w-12 h-12 border border-[rgba(162,166,155,0.15)] bg-[#10110F] text-[#A2A69B]">
          {icon ?? <ScanSearch size={22} strokeWidth={1.5} />}
        </div>

        {/* Title */}
        <h3 className="font-display text-base font-semibold text-[#A2A69B] leading-snug">
          {title}
        </h3>

        {/* Description */}
        <p className="font-body text-sm text-[#A2A69B] leading-relaxed opacity-70">
          {description}
        </p>

        {/* Optional action */}
        {action && <div className="mt-2">{action}</div>}
      </div>
    </div>
  )
}
