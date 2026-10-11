import React from 'react'
import { Activity, FlaskConical, Radio, Shield, Gauge } from 'lucide-react'
import type { SectionId } from '@/types'

interface NavItem {
  id: SectionId
  index: string
  label: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}

const NAV_ITEMS: NavItem[] = [
  {
    id: 'service-pulse',
    index: '01',
    label: 'Service Pulse',
    description: 'Health & Availability',
    icon: Activity,
  },
  {
    id: 'failure-lab',
    index: '02',
    label: 'Failure Lab',
    description: 'Endpoint Probes & Status',
    icon: FlaskConical,
  },
  {
    id: 'signal-inspector',
    index: '03',
    label: 'Signal Inspector',
    description: 'OTel Telemetry Pipeline',
    icon: Radio,
  },
  {
    id: 'sidecar-resilience',
    index: '04',
    label: 'Sidecar Resilience',
    description: 'Decoupling & Recovery',
    icon: Shield,
  },
  {
    id: 'resource-cost-guard',
    index: '05',
    label: 'Resource & Cost Guard',
    description: 'Limits & Volume Audit',
    icon: Gauge,
  },
]

interface SidebarProps {
  activeSection: SectionId
  onSectionChange: (section: SectionId) => void
  onClose?: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeSection,
  onSectionChange,
  onClose,
}) => {
  return (
    <nav
      className="flex flex-col h-full bg-[#10110F] border-r border-[rgba(162,166,155,0.12)] select-none"
      aria-label="Main Navigation"
    >
      {/* Navigation Header / Group Label */}
      <div className="px-5 pt-6 pb-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#A2A69B]/60">
          Investigation Modules
        </p>
      </div>

      {/* Nav items */}
      <div className="flex-1 px-3 space-y-1.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = activeSection === item.id
          const Icon = item.icon

          return (
            <button
              key={item.id}
              onClick={() => {
                onSectionChange(item.id)
                onClose?.()
              }}
              className={`w-full text-left group flex items-start gap-3.5 px-3 py-3 rounded-lg transition-all duration-150 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#D7FF64] ${
                isActive
                  ? 'bg-[#191B18] border-l-2 border-[#D7FF64] text-[#F4F4EC] shadow-sm'
                  : 'hover:bg-[#191B18]/60 text-[#A2A69B] hover:text-[#F4F4EC] border-l-2 border-transparent'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <div
                className={`mt-0.5 p-1 rounded transition-colors ${
                  isActive
                    ? 'text-[#D7FF64]'
                    : 'text-[#A2A69B] group-hover:text-[#F4F4EC]'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span
                    className={`font-display text-sm font-medium tracking-tight truncate ${
                      isActive ? 'text-[#F4F4EC]' : 'text-[#A2A69B] group-hover:text-[#F4F4EC]'
                    }`}
                  >
                    {item.label}
                  </span>
                  <span className="font-mono text-[10px] text-[#A2A69B]/50 ml-2">
                    {item.index}
                  </span>
                </div>
                <p className="font-body text-xs text-[#A2A69B]/70 truncate mt-0.5">
                  {item.description}
                </p>
              </div>
            </button>
          )
        })}
      </div>

      {/* Footer architecture note */}
      <div className="p-4 border-t border-[rgba(162,166,155,0.12)] bg-[#191B18]/30">
        <div className="flex items-center justify-between mb-1.5">
          <span className="font-mono text-[10px] text-[#A2A69B] uppercase tracking-wider">
            Architecture
          </span>
          <span className="font-mono text-[10px] text-[#77D9F7]">
            FastAPI + OTel
          </span>
        </div>
        <p className="font-body text-[11px] text-[#A2A69B]/70 leading-normal">
          Collector sidecar gRPC :4317 with debug exporter
        </p>
      </div>
    </nav>
  )
}

export default Sidebar
