import { useState, useCallback, useMemo } from 'react'
import type { QueryResult, TableContext, RowChange } from '../../../shared/types'
import EditableCell from './EditableCell'
import ConfirmChangesModal from './ConfirmChangesModal'
import { generateSQL } from '../../utils/sqlGenerator'

interface Props {
  result: QueryResult
  tableContext: TableContext | null
  onRefresh: () => void
}

export default function DataEditor({ result, tableContext, onRefresh }: Props) {
  const [editingCell, setEditingCell] = useState<{ row: number; col: string } | null>(null)
  const [changes, setChanges] = useState<Map<number, RowChange>>(new Map())
  const [deletedRows, setDeletedRows] = useState<Set<number>>(new Set())
  const [newRows, setNewRows] = useState<Record<string, unknown>[]>([])
  const [showConfirm, setShowConfirm] = useState(false)
  const [isExecuting, setIsExecuting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)

  const canEdit = tableContext !== null && tableContext.primaryKeys.length > 0

  const handleCellEdit = useCallback((rowIndex: number, column: string, newValue: unknown) => {
    const originalRow = result.rows[rowIndex]
    const originalValue = originalRow[column]

    // No change
    if (newValue === originalValue) {
      setEditingCell(null)
      return
    }

    setChanges(prev => {
      const next = new Map(prev)
      const existing = next.get(rowIndex)

      if (existing) {
        // Add to existing change
        const changedColumns = new Set(existing.changedColumns || [])
        changedColumns.add(column)

        next.set(rowIndex, {
          ...existing,
          newRow: { ...existing.newRow, [column]: newValue },
          changedColumns: Array.from(changedColumns)
        })
      } else {
        // New change
        next.set(rowIndex, {
          type: 'update',
          rowIndex,
          originalRow,
          newRow: { ...originalRow, [column]: newValue },
          changedColumns: [column]
        })
      }

      return next
    })

    setEditingCell(null)
  }, [result.rows])

  const handleDeleteRow = useCallback((rowIndex: number) => {
    setDeletedRows(prev => {
      const next = new Set(prev)
      if (next.has(rowIndex)) {
        next.delete(rowIndex)
      } else {
        next.add(rowIndex)
      }
      return next
    })
  }, [])

  const handleAddRow = useCallback(() => {
    const emptyRow: Record<string, unknown> = {}
    result.fields.forEach(f => {
      emptyRow[f.name] = null
    })
    setNewRows(prev => [...prev, emptyRow])
  }, [result.fields])

  const handleNewRowChange = useCallback((index: number, column: string, value: unknown) => {
    setNewRows(prev => {
      const next = [...prev]
      next[index] = { ...next[index], [column]: value }
      return next
    })
    setEditingCell(null)
  }, [])

  const handleRemoveNewRow = useCallback((index: number) => {
    setNewRows(prev => prev.filter((_, i) => i !== index))
  }, [])

  const computedChanges = useMemo((): RowChange[] => {
    const changeList: RowChange[] = []

    // Updates
    changes.forEach(change => {
      if (!deletedRows.has(change.rowIndex)) {
        changeList.push(change)
      }
    })

    // Deletes
    deletedRows.forEach(rowIndex => {
      changeList.push({
        type: 'delete',
        rowIndex,
        originalRow: result.rows[rowIndex]
      })
    })

    // Inserts
    newRows.forEach((newRow, index) => {
      changeList.push({
        type: 'insert',
        rowIndex: -1 - index,
        newRow
      })
    })

    return changeList
  }, [changes, deletedRows, newRows, result.rows])

  const sqlStatements = useMemo(() => {
    if (!tableContext) return []
    return generateSQL(tableContext, computedChanges)
  }, [tableContext, computedChanges])

  const hasChanges = computedChanges.length > 0

  const handleDiscard = useCallback(() => {
    setChanges(new Map())
    setDeletedRows(new Set())
    setNewRows([])
    setError(null)
  }, [])

  const handleExecute = async () => {
    if (!tableContext) return

    setIsExecuting(true)
    setError(null)

    try {
      // Execute each SQL statement
      // Note: In a production app, you'd want parameterized queries via a dedicated IPC handler
      for (const sql of sqlStatements) {
        await window.api.query(sql.replace(/;$/, ''))
      }

      handleDiscard()
      setShowConfirm(false)
      onRefresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to execute changes')
    } finally {
      setIsExecuting(false)
    }
  }

  const isCellModified = (rowIndex: number, column: string): boolean => {
    const change = changes.get(rowIndex)
    return change?.changedColumns?.includes(column) ?? false
  }

  const handleExport = async (format: 'csv' | 'json') => {
    setShowExportMenu(false)
    setIsExporting(true)
    try {
      const tableName = tableContext?.table || 'data'
      const response = await window.api.exportResults({
        result,
        format,
        filename: `${tableName}-${new Date().toISOString().slice(0, 10)}`
      })
      if (!response.success && response.error !== 'Export canceled') {
        setError(`Export failed: ${response.error}`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="h-full flex flex-col bg-db-bg">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-db-elevated border-b border-db-border">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${hasChanges ? 'bg-db-warning animate-pulse' : 'bg-db-success'}`} />
            <span className="text-xs font-medium text-db-text-secondary uppercase tracking-wide">
              {canEdit ? 'Edit Mode' : 'Read Only'}
            </span>
          </div>

          {hasChanges && (
            <>
              <span className="text-xs text-db-warning font-medium">
                {computedChanges.length} pending change{computedChanges.length !== 1 ? 's' : ''}
              </span>
              <div className="w-px h-4 bg-db-border" />
              <button
                onClick={handleDiscard}
                className="px-3 py-1.5 text-xs font-medium text-db-error bg-db-error-muted hover:bg-db-error/20 rounded-md transition-colors"
              >
                Discard
              </button>
              <button
                onClick={() => setShowConfirm(true)}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-db-success hover:bg-db-success/80 rounded-md transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Save Changes
              </button>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {canEdit && (
            <button
              onClick={handleAddRow}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-db-text-secondary hover:text-db-text hover:bg-db-surface rounded-md transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Row
            </button>
          )}

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

      {/* Error */}
      {error && (
        <div className="px-4 py-2 bg-db-error-muted border-b border-db-error/30 text-db-error text-sm">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 z-10">
            <tr className="bg-db-surface">
              {canEdit && (
                <th className="w-10 px-2 py-2.5 text-left text-xs font-semibold text-db-text-secondary border-b border-db-border" />
              )}
              {result.fields.map((field, i) => (
                <th
                  key={i}
                  className="px-4 py-2.5 text-left text-xs font-semibold text-db-text-secondary uppercase tracking-wide border-b border-db-border whitespace-nowrap"
                >
                  {field.name}
                  {tableContext?.primaryKeys.includes(field.name) && (
                    <span className="ml-1 text-db-warning" title="Primary Key">
                      <svg className="w-3 h-3 inline" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
                      </svg>
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-db-border-subtle">
            {/* Existing rows */}
            {result.rows.map((row, rowIndex) => {
              const isDeleted = deletedRows.has(rowIndex)

              return (
                <tr
                  key={rowIndex}
                  className={`group transition-colors duration-75 ${
                    isDeleted
                      ? 'bg-db-error-muted/50 line-through opacity-60'
                      : 'hover:bg-db-surface/50'
                  }`}
                >
                  {canEdit && (
                    <td className="px-2 py-2">
                      <button
                        onClick={() => handleDeleteRow(rowIndex)}
                        className={`p-1 rounded transition-colors ${
                          isDeleted
                            ? 'text-db-success hover:bg-db-success-muted'
                            : 'text-db-text-muted hover:text-db-error hover:bg-db-error-muted opacity-0 group-hover:opacity-100'
                        }`}
                        title={isDeleted ? 'Restore row' : 'Delete row'}
                      >
                        {isDeleted ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        )}
                      </button>
                    </td>
                  )}
                  {result.fields.map((field, colIndex) => (
                    <td
                      key={colIndex}
                      className="px-4 py-2 text-sm whitespace-nowrap max-w-[400px]"
                    >
                      {canEdit && !isDeleted ? (
                        <EditableCell
                          value={changes.get(rowIndex)?.newRow?.[field.name] ?? row[field.name]}
                          isEditing={editingCell?.row === rowIndex && editingCell?.col === field.name}
                          isModified={isCellModified(rowIndex, field.name)}
                          onStartEdit={() => setEditingCell({ row: rowIndex, col: field.name })}
                          onSave={(value) => handleCellEdit(rowIndex, field.name, value)}
                          onCancel={() => setEditingCell(null)}
                        />
                      ) : (
                        <CellValue value={row[field.name]} />
                      )}
                    </td>
                  ))}
                </tr>
              )
            })}

            {/* New rows */}
            {newRows.map((newRow, index) => (
              <tr key={`new-${index}`} className="bg-db-success-muted/30 hover:bg-db-success-muted/50">
                {canEdit && (
                  <td className="px-2 py-2">
                    <button
                      onClick={() => handleRemoveNewRow(index)}
                      className="p-1 rounded text-db-text-muted hover:text-db-error hover:bg-db-error-muted transition-colors"
                      title="Remove new row"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </td>
                )}
                {result.fields.map((field, colIndex) => (
                  <td
                    key={colIndex}
                    className="px-4 py-2 text-sm whitespace-nowrap max-w-[400px]"
                  >
                    <EditableCell
                      value={newRow[field.name]}
                      isEditing={editingCell?.row === -1 - index && editingCell?.col === field.name}
                      isModified={newRow[field.name] !== null}
                      onStartEdit={() => setEditingCell({ row: -1 - index, col: field.name })}
                      onSave={(value) => handleNewRowChange(index, field.name, value)}
                      onCancel={() => setEditingCell(null)}
                    />
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
        <span>
          {result.rows.length} row{result.rows.length !== 1 ? 's' : ''}
          {newRows.length > 0 && ` + ${newRows.length} new`}
          {deletedRows.size > 0 && ` - ${deletedRows.size} deleted`}
        </span>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <ConfirmChangesModal
          statements={sqlStatements}
          isExecuting={isExecuting}
          onConfirm={handleExecute}
          onCancel={() => setShowConfirm(false)}
        />
      )}
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
        value ? 'text-db-success bg-db-success-muted' : 'text-db-error bg-db-error-muted'
      }`}>
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

  return <span className="text-db-text">{String(value)}</span>
}
