import React from 'react'

interface SectionHeaderProps {
  icon: React.ReactNode
  title: string
  description: string
  actions?: React.ReactNode
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  icon,
  title,
  description,
  actions,
}) => {
  return (
    <div className="mb-6">
      {/* Overline label */}
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#A2A69B] mb-3 select-none">
        TraceForge · Diagnostics
      </p>

      {/* Main row */}
      <div className="flex items-start justify-between gap-4">
        {/* Left: icon + text */}
        <div className="flex items-start gap-4">
          {/* Icon box */}
          <div
            className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded border border-[rgba(162,166,155,0.20)] bg-[#191B18] text-[#A2A69B]"
            aria-hidden="true"
          >
            {icon}
          </div>

          {/* Text */}
          <div className="min-w-0">
            <h2 className="font-display text-xl font-semibold text-[#F4F4EC] leading-tight tracking-tight">
              {title}
            </h2>
            <p className="font-body text-sm text-[#A2A69B] mt-0.5 leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        {/* Right: actions */}
        {actions && (
          <div className="flex-shrink-0 flex items-center gap-2 mt-0.5">
            {actions}
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="mt-4 border-b border-[rgba(162,166,155,0.12)]" />
    </div>
  )
}
