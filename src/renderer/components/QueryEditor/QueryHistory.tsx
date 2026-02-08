interface HistoryEntry {
  id: string
  query: string
  timestamp: Date
  success: boolean
  rowCount?: number
}

interface Props {
  history: HistoryEntry[]
  onSelect: (query: string) => void
  onClear: () => void
  onClose: () => void
}

export default function QueryHistory({ history, onSelect, onClear, onClose }: Props) {
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-db-border bg-db-elevated">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-db-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm font-semibold text-db-text">History</span>
          {history.length > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] font-medium text-db-text-muted bg-db-surface rounded">
              {history.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {history.length > 0 && (
            <button
              onClick={onClear}
              className="text-xs text-db-text-muted hover:text-db-error transition-colors"
            >
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 text-db-text-muted hover:text-db-text hover:bg-db-surface rounded transition-colors"
            title="Close history"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <div className="w-10 h-10 mb-3 rounded-lg bg-db-elevated flex items-center justify-center">
              <svg className="w-5 h-5 text-db-text-faint" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <p className="text-sm text-db-text-muted mb-1">No history yet</p>
            <p className="text-xs text-db-text-faint">
              Executed queries will appear here
            </p>
          </div>
        ) : (
          <div className="divide-y divide-db-border-subtle">
            {history.map(entry => (
              <button
                key={entry.id}
                onClick={() => onSelect(entry.query)}
                className="w-full px-4 py-3 text-left hover:bg-db-elevated/50 transition-colors group"
              >
                {/* Header row */}
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] text-db-text-faint uppercase tracking-wide">
                    {formatTime(entry.timestamp)}
                  </span>
                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium rounded ${
                    entry.success
                      ? 'text-db-success bg-db-success-muted'
                      : 'text-db-error bg-db-error-muted'
                  }`}>
                    {entry.success ? (
                      <>
                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {entry.rowCount !== undefined && `${entry.rowCount} rows`}
                      </>
                    ) : (
                      <>
                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Error
                      </>
                    )}
                  </span>
                </div>

                {/* Query preview */}
                <pre className="text-xs text-db-text-secondary font-mono line-clamp-2 group-hover:text-db-text transition-colors">
                  {entry.query.trim()}
                </pre>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer hint */}
      {history.length > 0 && (
        <div className="px-4 py-2 border-t border-db-border-subtle">
          <p className="text-[10px] text-db-text-faint text-center">
            Click to load query into editor
          </p>
        </div>
      )}
    </div>
  )
}

function formatTime(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export type { HistoryEntry }
