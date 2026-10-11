import React, { useState, useCallback } from 'react'
import { Copy, Check } from 'lucide-react'

interface CodeBlockProps {
  content: string
  language?: string
  maxHeight?: string
  label?: string
}

function tryPrettyJson(content: string): string {
  try {
    const parsed = JSON.parse(content)
    return JSON.stringify(parsed, null, 2)
  } catch {
    return content
  }
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  content,
  language = 'text',
  maxHeight = '320px',
  label,
}) => {
  const [copied, setCopied] = useState(false)

  const displayContent =
    language === 'json' || language === 'text' ? tryPrettyJson(content) : content

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(displayContent)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard not available in this context
    }
  }, [displayContent])

  return (
    <div className="w-full">
      {/* Label */}
      {label && (
        <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#A2A69B] mb-1.5 select-none">
          {label}
        </p>
      )}

      {/* Code container */}
      <div className="relative group border border-[rgba(162,166,155,0.12)] bg-[#0E0F0D]">
        {/* Copy button */}
        <button
          onClick={handleCopy}
          className="
            absolute top-2 right-2 z-10
            flex items-center gap-1.5 px-2 py-1
            border border-[rgba(162,166,155,0.15)]
            bg-[#191B18] text-[#A2A69B]
            text-[11px] font-mono
            opacity-0 group-hover:opacity-100 focus:opacity-100
            transition-opacity duration-150
            hover:text-[#F4F4EC] hover:border-[rgba(162,166,155,0.3)]
            focus:outline-none focus-visible:ring-1 focus-visible:ring-[#D7FF64]
          "
          aria-label={copied ? 'Copied!' : 'Copy to clipboard'}
        >
          {copied ? (
            <Check size={12} className="text-[#D7FF64]" />
          ) : (
            <Copy size={12} />
          )}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>

        {/* Scrollable code area */}
        <div
          className="overflow-auto scrollbar-thin scrollbar-thumb-[rgba(162,166,155,0.15)] scrollbar-track-transparent"
          style={{ maxHeight }}
        >
          <pre
            className="text-[12.5px] leading-relaxed text-[#F4F4EC] p-4 whitespace-pre"
            style={{ fontFamily: "'JetBrains Mono', 'Fira Mono', monospace" }}
          >
            <code>{displayContent}</code>
          </pre>
        </div>
      </div>
    </div>
  )
}
