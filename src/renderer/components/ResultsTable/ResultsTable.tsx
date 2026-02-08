import type { QueryResult } from '../../../shared/types'

interface Props {
  result: QueryResult | null
  error: string | null
  isLoading: boolean
}

export default function ResultsTable({ result, error, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-db-bg">
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 border-2 border-db-border rounded-full" />
            <div className="absolute inset-0 w-10 h-10 border-2 border-db-accent border-t-transparent rounded-full animate-spin" />
          </div>
          <span className="text-sm text-db-text-muted">Executing query...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full p-4 bg-db-bg overflow-auto">
        <div className="p-4 bg-db-error-muted border border-db-error/30 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-db-error/20">
              <svg className="w-4 h-4 text-db-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-db-error mb-1">Query Error</h3>
              <pre className="text-sm text-db-text-secondary whitespace-pre-wrap break-words font-mono">{error}</pre>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="h-full flex items-center justify-center bg-db-bg">
        <div className="text-center max-w-xs">
          <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-db-surface flex items-center justify-center">
            <svg className="w-6 h-6 text-db-text-faint" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
            </svg>
          </div>
          <p className="text-sm text-db-text-muted mb-1">No results yet</p>
          <p className="text-xs text-db-text-faint">
            Write a query and press <kbd className="px-1.5 py-0.5 bg-db-surface rounded text-db-text-muted">⌘ Enter</kbd> to execute
          </p>
        </div>
      </div>
    )
  }

  if (result.rows.length === 0) {
    return (
      <div className="h-full p-4 bg-db-bg overflow-auto">
        <div className="p-4 bg-db-success-muted border border-db-success/30 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-db-success/20">
              <svg className="w-4 h-4 text-db-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-db-success mb-1">Query Successful</h3>
              <p className="text-sm text-db-text-secondary">
                <span className="font-mono text-db-text-muted">{result.command}</span>
                {' · '}
                {result.rowCount} row{result.rowCount !== 1 ? 's' : ''} affected
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-db-bg">
      {/* Results header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-db-elevated border-b border-db-border">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-db-success" />
            <span className="text-xs font-medium text-db-text-secondary uppercase tracking-wide">
              Results
            </span>
          </div>
          <span className="text-xs text-db-text-muted">
            {result.rowCount.toLocaleString()} row{result.rowCount !== 1 ? 's' : ''}
          </span>
        </div>
        <span className="text-xs font-mono text-db-text-faint">{result.command}</span>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 z-10">
            <tr className="bg-db-surface">
              {result.fields.map((field, i) => (
                <th
                  key={i}
                  className="px-4 py-2.5 text-left text-xs font-semibold text-db-text-secondary uppercase tracking-wide border-b border-db-border whitespace-nowrap"
                >
                  {field.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-db-border-subtle">
            {result.rows.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="group hover:bg-db-surface/50 transition-colors duration-75"
              >
                {result.fields.map((field, colIndex) => (
                  <td
                    key={colIndex}
                    className="px-4 py-2 text-sm text-db-text whitespace-nowrap max-w-[400px] truncate"
                  >
                    <CellValue value={row[field.name]} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2 bg-db-surface border-t border-db-border text-xs text-db-text-muted">
        <span>{result.fields.length} column{result.fields.length !== 1 ? 's' : ''}</span>
        <span>Showing {result.rows.length} of {result.rowCount} rows</span>
      </div>
    </div>
  )
}

function CellValue({ value }: { value: unknown }) {
  if (value === null) {
    return (
      <span className="px-1.5 py-0.5 text-xs font-medium text-db-text-faint bg-db-surface rounded">
        NULL
      </span>
    )
  }

  if (typeof value === 'boolean') {
    return (
      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-xs font-medium rounded ${
        value
          ? 'text-db-success bg-db-success-muted'
          : 'text-db-error bg-db-error-muted'
      }`}>
        {value ? (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
        {String(value)}
      </span>
    )
  }

  if (typeof value === 'number') {
    return <span className="font-mono text-db-warning">{String(value)}</span>
  }

  if (value instanceof Date) {
    return <span className="font-mono text-db-accent">{value.toISOString()}</span>
  }

  if (typeof value === 'object') {
    return (
      <span className="font-mono text-xs text-db-text-muted bg-db-surface px-1.5 py-0.5 rounded">
        {JSON.stringify(value)}
      </span>
    )
  }

  return <>{String(value)}</>
}
