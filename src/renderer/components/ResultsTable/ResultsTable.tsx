import { useState } from 'react'
import type { QueryResult } from '../../../shared/types'

interface Props {
  result: QueryResult | null
  error: string | null
  isLoading: boolean
}

type ExportFormat = 'csv' | 'json'

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

  const [isExporting, setIsExporting] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)

  const handleExport = async (format: ExportFormat) => {
    setShowExportMenu(false)
    setIsExporting(true)
    try {
      const response = await window.api.exportResults({
        result,
        format,
        filename: `query-results-${new Date().toISOString().slice(0, 10)}`
      })
      if (!response.success && response.error !== 'Export canceled') {
        console.error('Export failed:', response.error)
      }
    } catch (err) {
      console.error('Export error:', err)
    } finally {
      setIsExporting(false)
    }
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

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-db-text-faint">{result.command}</span>

          {/* Export dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-db-text-secondary hover:text-db-text hover:bg-db-surface rounded-md transition-colors disabled:opacity-50"
            >
              {isExporting ? (
                <>
                  <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Exporting...</span>
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>Export</span>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </>
              )}
            </button>

            {showExportMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowExportMenu(false)} />
                <div className="absolute right-0 mt-1 w-36 bg-db-surface border border-db-border rounded-lg shadow-xl z-20 py-1">
                  <button
                    onClick={() => handleExport('csv')}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-db-text hover:bg-db-elevated transition-colors"
                  >
                    <svg className="w-4 h-4 text-db-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>CSV</span>
                  </button>
                  <button
                    onClick={() => handleExport('json')}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-db-text hover:bg-db-elevated transition-colors"
                  >
                    <svg className="w-4 h-4 text-db-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <span>JSON</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
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
