import React, { useEffect, useRef, useCallback } from 'react'
import { X, Hash, Clock, Globe, Tag } from 'lucide-react'
import type { ProbeResult } from '@/types'
import { ResultBadge } from '@/components/ResultBadge'
import { DurationPill } from '@/components/DurationPill'
import { CodeBlock } from '@/components/CodeBlock'
import { formatFullTimestamp } from '@/lib/utils'

interface DetailsDrawerProps {
  result: ProbeResult | null
  isOpen: boolean
  onClose: () => void
}

// ─── Info Row ─────────────────────────────────────────────────────────────────

interface InfoRowProps {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
}

const InfoRow: React.FC<InfoRowProps> = ({ icon, label, value }) => (
  <div className="flex items-start gap-3 py-2 border-b border-[rgba(162,166,155,0.08)] last:border-b-0">
    <span className="flex-shrink-0 mt-0.5 text-[#A2A69B]" aria-hidden="true">
      {icon}
    </span>
    <div className="flex-1 min-w-0">
      <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-[#A2A69B] mb-0.5">
        {label}
      </p>
      <div className="font-mono text-[12px] text-[#F4F4EC] break-all">{value}</div>
    </div>
  </div>
)

// ─── Section Block ────────────────────────────────────────────────────────────

interface SectionBlockProps {
  title: string
  children: React.ReactNode
}

const SectionBlock: React.FC<SectionBlockProps> = ({ title, children }) => (
  <div className="mb-5">
    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#A2A69B] mb-2 pb-1 border-b border-[rgba(162,166,155,0.12)]">
      {title}
    </p>
    <div>{children}</div>
  </div>
)

// ─── DetailsDrawer ────────────────────────────────────────────────────────────

export const DetailsDrawer: React.FC<DetailsDrawerProps> = ({
  result,
  isOpen,
  onClose,
}) => {
  const drawerRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  // Focus trap: focus close button when opened
  useEffect(() => {
    if (isOpen && closeButtonRef.current) {
      closeButtonRef.current.focus()
    }
  }, [isOpen])

  // Trap focus within drawer
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key !== 'Tab' || !drawerRef.current) return
      const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
      )
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last?.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first?.focus()
        }
      }
    },
    []
  )

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={[
          'fixed inset-0 z-40 bg-[#10110F]',
          'transition-opacity duration-300 motion-reduce:transition-none',
          isOpen ? 'opacity-60 pointer-events-auto' : 'opacity-0 pointer-events-none',
        ].join(' ')}
      />

      {/* Drawer panel */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label={result ? `Probe result for ${result.path}` : 'Probe result details'}
        onKeyDown={handleKeyDown}
        className={[
          'fixed top-0 right-0 z-50 h-full w-full max-w-[480px]',
          'bg-[#191B18] border-l border-[rgba(162,166,155,0.12)]',
          'flex flex-col overflow-hidden',
          'transition-transform duration-300 ease-out motion-reduce:transition-none',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        ].join(' ')}
      >
        {/* Header */}
        <div className="flex-shrink-0 flex items-start justify-between gap-3 px-5 py-4 border-b border-[rgba(162,166,155,0.12)] bg-[#191B18]">
          <div className="flex-1 min-w-0">
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#A2A69B] mb-1">
              Probe Result
            </p>
            {result ? (
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-mono text-[13px] text-[#F4F4EC] truncate max-w-[280px]">
                  {result.path}
                </p>
                <ResultBadge
                  status={result.status}
                  classification={result.classification}
                  size="sm"
                />
              </div>
            ) : (
              <p className="font-mono text-[13px] text-[#A2A69B]">No result selected</p>
            )}
          </div>

          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="
              flex-shrink-0 flex items-center justify-center w-8 h-8
              text-[#A2A69B] hover:text-[#F4F4EC]
              border border-[rgba(162,166,155,0.15)] hover:border-[rgba(162,166,155,0.3)]
              transition-colors duration-100
              focus:outline-none focus-visible:ring-1 focus-visible:ring-[#D7FF64]
            "
            aria-label="Close details"
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-1">
          {result ? (
            <>
              {/* REQUEST INFO */}
              <SectionBlock title="Request Info">
                <InfoRow
                  icon={<Hash size={13} strokeWidth={1.75} />}
                  label="ID"
                  value={result.id}
                />
                <InfoRow
                  icon={<Clock size={13} strokeWidth={1.75} />}
                  label="Timestamp"
                  value={formatFullTimestamp(result.timestamp)}
                />
                <InfoRow
                  icon={<Globe size={13} strokeWidth={1.75} />}
                  label="Path"
                  value={result.path}
                />
              </SectionBlock>

              {/* RESPONSE */}
              <SectionBlock title="Response">
                <div className="flex flex-wrap gap-4 pt-1">
                  <div>
                    <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-[#A2A69B] mb-1.5">
                      Status
                    </p>
                    <ResultBadge
                      status={result.status}
                      classification={result.classification}
                      size="md"
                    />
                  </div>
                  <div>
                    <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-[#A2A69B] mb-1.5">
                      Duration
                    </p>
                    <DurationPill duration={result.duration} />
                  </div>
                  <div>
                    <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-[#A2A69B] mb-1.5">
                      Classification
                    </p>
                    <span className="inline-flex items-center gap-1.5">
                      <Tag size={11} strokeWidth={1.75} className="text-[#A2A69B]" />
                      <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#A2A69B]">
                        {result.classification}
                      </span>
                    </span>
                  </div>
                </div>
              </SectionBlock>

              {/* RESPONSE BODY */}
              {result.body && (
                <SectionBlock title="Response Body">
                  <CodeBlock
                    content={result.body}
                    language="json"
                    maxHeight="280px"
                  />
                </SectionBlock>
              )}

              {/* ERROR */}
              {result.classification === 'network-failure' && result.error && (
                <SectionBlock title="Error">
                  <div className="border border-[rgba(255,107,94,0.20)] bg-[rgba(255,107,94,0.05)] px-3 py-3">
                    <p className="font-mono text-[12px] text-[#FF6B5E] leading-relaxed break-all">
                      {result.error}
                    </p>
                  </div>
                </SectionBlock>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-full py-20">
              <p className="font-mono text-[12px] text-[#A2A69B] text-center">
                Select a probe result to view details.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
