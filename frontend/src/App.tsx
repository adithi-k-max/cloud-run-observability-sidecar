import { useState } from 'react'
import { ToastProvider } from '@/contexts/ToastContext'
import { Shell } from '@/components/Shell'
import { ServicePulse } from '@/pages/ServicePulse'
import { FailureLab } from '@/pages/FailureLab'
import { SignalInspector } from '@/pages/SignalInspector'
import { SidecarResilience } from '@/pages/SidecarResilience'
import { ResourceCostGuard } from '@/pages/ResourceCostGuard'
import type { SectionId, ServiceStatus } from '@/types'

export default function App() {
  const [activeSection, setActiveSection] = useState<SectionId>('service-pulse')
  const [serviceStatus, setServiceStatus] = useState<ServiceStatus>('unknown')

  function handleStatusUpdate(status: ServiceStatus) {
    setServiceStatus(status)
  }

  function renderSection() {
    switch (activeSection) {
      case 'service-pulse':
        return <ServicePulse onStatusUpdate={handleStatusUpdate} />
      case 'failure-lab':
        return <FailureLab />
      case 'signal-inspector':
        return <SignalInspector />
      case 'sidecar-resilience':
        return <SidecarResilience />
      case 'resource-cost-guard':
        return <ResourceCostGuard />
      default:
        return <ServicePulse onStatusUpdate={handleStatusUpdate} />
    }
  }

  return (
    <ToastProvider>
      <Shell
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        serviceStatus={serviceStatus}
      >
        {renderSection()}
      </Shell>
    </ToastProvider>
  )
}
