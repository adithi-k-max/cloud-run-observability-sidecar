import React, { useState } from 'react'
import { Menu, X, Server, Layers } from 'lucide-react'
import { Sidebar } from '@/components/Sidebar'
import { StatusDot } from '@/components/StatusDot'
import type { SectionId, ServiceStatus } from '@/types'

interface ShellProps {
  activeSection: SectionId
  onSectionChange: (section: SectionId) => void
  serviceStatus: ServiceStatus
  children: React.ReactNode
}

const SECTION_TITLES: Record<SectionId, { title: string; subtitle: string }> = {
  'service-pulse': {
    title: 'Service Pulse',
    subtitle: 'Live health status & client-measured latency',
  },
  'failure-lab': {
    title: 'Failure Lab',
    subtitle: 'Endpoint probe diagnostics & real response inspect',
  },
  'signal-inspector': {
    title: 'Signal Inspector',
    subtitle: 'OTel SDK → Sidecar → Cloud pipeline verification',
  },
  'sidecar-resilience': {
    title: 'Sidecar Resilience',
    subtitle: 'Collector failure isolation & decoupling audit',
  },
  'resource-cost-guard': {
    title: 'Resource & Cost Guard',
    subtitle: 'Container limits & telemetry cost containment',
  },
}

export const Shell: React.FC<ShellProps> = ({
  activeSection,
  onSectionChange,
  serviceStatus,
  children,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const currentSection = SECTION_TITLES[activeSection]

  return (
    <div className="min-h-screen bg-[#10110F] text-[#F4F4EC] font-body flex flex-col antialiased selection:bg-[#D7FF64] selection:text-[#10110F]">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 h-14 bg-[#10110F]/95 backdrop-blur-sm border-b border-[rgba(162,166,155,0.12)] flex items-center justify-between px-4 sm:px-6">
        {/* Left: Brand + Status */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded text-[#A2A69B] hover:text-[#F4F4EC] hover:bg-[#191B18] focus:outline-none focus-visible:ring-1 focus-visible:ring-[#D7FF64]"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2.5">
            <span className="font-display font-bold text-base sm:text-lg tracking-[0.12em] text-[#D7FF64] select-none">
              TRACEFORGE
            </span>
            <div className="h-3 w-px bg-[rgba(162,166,155,0.2)] hidden sm:block" />
            <div className="flex items-center gap-2 px-2 py-0.5 rounded bg-[#191B18] border border-[rgba(162,166,155,0.12)]">
              <StatusDot status={serviceStatus} size="sm" />
              <span className="font-mono text-[10px] uppercase text-[#A2A69B]">
                {serviceStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Module Title (Desktop) */}
        <div className="hidden lg:flex items-center gap-2 font-display text-xs text-[#A2A69B]">
          <span className="text-[#F4F4EC] font-medium">{currentSection.title}</span>
          <span className="opacity-40">/</span>
          <span className="text-[#A2A69B]/70">{currentSection.subtitle}</span>
        </div>

        {/* Right: Environment & Deployment Indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-[#191B18] border border-[rgba(162,166,155,0.15)] text-xs">
            <Server className="w-3.5 h-3.5 text-[#77D9F7]" />
            <span className="font-mono text-[11px] font-medium text-[#77D9F7]">
              LOCAL DEV
            </span>
            <span className="text-[#A2A69B] font-mono text-[10px] hidden sm:inline">
              (:8080)
            </span>
          </div>

          <div className="hidden xl:flex items-center gap-1.5 px-2 py-1 rounded border border-[rgba(162,166,155,0.08)] text-[11px] font-mono text-[#A2A69B]/80">
            <Layers className="w-3 h-3 text-[#A2A69B]" />
            <span>PROXY: /api</span>
          </div>
        </div>
      </header>

      {/* Main Layout Area */}
      <div className="flex-1 flex">
        {/* Desktop Sidebar (Fixed width) */}
        <aside className="hidden md:block w-64 flex-shrink-0 sticky top-14 h-[calc(100vh-3.5rem)]">
          <Sidebar
            activeSection={activeSection}
            onSectionChange={onSectionChange}
          />
        </aside>

        {/* Mobile Sidebar Overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            <div
              className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative w-72 max-w-[85vw] h-full z-10 animate-slide-in-right">
              <Sidebar
                activeSection={activeSection}
                onSectionChange={onSectionChange}
                onClose={() => setMobileMenuOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Workspace Content */}
        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  )
}

export default Shell
