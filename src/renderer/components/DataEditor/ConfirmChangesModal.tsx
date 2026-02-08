import { useState } from 'react'

interface Props {
  statements: string[]
  isExecuting: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmChangesModal({
  statements,
  isExecuting,
  onConfirm,
  onCancel
}: Props) {
  const [copied, setCopied] = useState(false)

  const allSQL = statements.join('\n\n')

  const handleCopy = async () => {
    await navigator.clipboard.writeText(allSQL)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative bg-db-surface border border-db-border rounded-lg shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-db-border">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-db-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="text-lg font-semibold text-db-text">Review Changes</h2>
          </div>
          <span className="text-sm text-db-text-muted">
            {statements.length} statement{statements.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* SQL Preview */}
        <div className="flex-1 overflow-auto p-4">
          <div className="text-xs text-db-text-muted mb-2 flex items-center justify-between">
            <span>The following SQL will be executed:</span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-2 py-1 text-db-text-muted hover:text-db-text hover:bg-db-elevated rounded transition-colors"
            >
              {copied ? (
                <>
                  <svg className="w-3.5 h-3.5 text-db-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          <div className="bg-db-bg rounded-lg border border-db-border overflow-hidden">
            {statements.map((sql, index) => (
              <div key={index} className={index > 0 ? 'border-t border-db-border' : ''}>
                <pre className="p-3 text-sm font-mono text-db-text whitespace-pre-wrap overflow-x-auto">
                  <code>{highlightSQL(sql)}</code>
                </pre>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-4 py-3 border-t border-db-border bg-db-elevated">
          <button
            onClick={onCancel}
            disabled={isExecuting}
            className="px-4 py-2 text-sm font-medium text-db-text-secondary hover:text-db-text hover:bg-db-surface rounded-md transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isExecuting}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-db-accent hover:bg-db-accent-hover rounded-md transition-colors disabled:opacity-50"
          >
            {isExecuting ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>Executing...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Execute Changes</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// Simple SQL syntax highlighting
function highlightSQL(sql: string): React.ReactNode {
  const keywords = /\b(SELECT|INSERT|UPDATE|DELETE|FROM|INTO|VALUES|SET|WHERE|AND|OR|NULL|TRUE|FALSE|LIMIT|ORDER BY|GROUP BY|JOIN|LEFT|RIGHT|INNER|OUTER|ON|AS|IN|NOT|IS|LIKE|BETWEEN)\b/gi

  const parts = sql.split(/('(?:[^']|'')*')/g)

  return parts.map((part, i) => {
    // String literals
    if (part.startsWith("'")) {
      return <span key={i} className="text-green-400">{part}</span>
    }

    // Keywords
    const withKeywords = part.split(keywords)
    return withKeywords.map((segment, j) => {
      if (keywords.test(segment)) {
        return <span key={`${i}-${j}`} className="text-purple-400 font-semibold">{segment}</span>
      }
      // Numbers
      const withNumbers = segment.split(/(\b\d+\b)/g)
      return withNumbers.map((s, k) => {
        if (/^\d+$/.test(s)) {
          return <span key={`${i}-${j}-${k}`} className="text-orange-400">{s}</span>
        }
        return <span key={`${i}-${j}-${k}`}>{s}</span>
      })
    })
  })
}
