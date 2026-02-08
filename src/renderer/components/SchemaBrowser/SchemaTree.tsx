import { useState, useEffect, useCallback } from 'react'
import type { ColumnInfo } from '../../../shared/types'

interface TreeNodeData {
  id: string
  name: string
  type: 'schema' | 'table' | 'view' | 'column'
  schema?: string
  table?: string
  columnInfo?: ColumnInfo
  children?: TreeNodeData[]
  isLoading?: boolean
}

interface Props {
  onTableSelect: (schema: string, table: string) => void
  onTablePreview: (schema: string, table: string) => void
}

export default function SchemaTree({ onTableSelect, onTablePreview }: Props) {
  const [schemas, setSchemas] = useState<TreeNodeData[]>([])
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadSchemas = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const schemaNames = await window.api.getSchemas()
      setSchemas(schemaNames.map(name => ({
        id: `schema:${name}`,
        name,
        type: 'schema' as const
      })))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load schemas')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSchemas()
  }, [loadSchemas])

  const loadTables = async (schemaName: string) => {
    const nodeId = `schema:${schemaName}`

    setSchemas(prev => prev.map(s =>
      s.id === nodeId ? { ...s, isLoading: true } : s
    ))

    try {
      const tables = await window.api.getTables(schemaName)
      setSchemas(prev => prev.map(s =>
        s.id === nodeId
          ? {
              ...s,
              isLoading: false,
              children: tables.map(t => ({
                id: `table:${schemaName}.${t.name}`,
                name: t.name,
                type: t.type,
                schema: schemaName
              }))
            }
          : s
      ))
    } catch (err) {
      setSchemas(prev => prev.map(s =>
        s.id === nodeId ? { ...s, isLoading: false } : s
      ))
    }
  }

  const loadColumns = async (schemaName: string, tableName: string) => {
    const nodeId = `table:${schemaName}.${tableName}`

    setSchemas(prev => prev.map(s => ({
      ...s,
      children: s.children?.map(t =>
        t.id === nodeId ? { ...t, isLoading: true } : t
      )
    })))

    try {
      const columns = await window.api.getColumns(schemaName, tableName)
      setSchemas(prev => prev.map(s => ({
        ...s,
        children: s.children?.map(t =>
          t.id === nodeId
            ? {
                ...t,
                isLoading: false,
                children: columns.map(c => ({
                  id: `column:${schemaName}.${tableName}.${c.name}`,
                  name: c.name,
                  type: 'column' as const,
                  schema: schemaName,
                  table: tableName,
                  columnInfo: c
                }))
              }
            : t
        )
      })))
    } catch (err) {
      setSchemas(prev => prev.map(s => ({
        ...s,
        children: s.children?.map(t =>
          t.id === nodeId ? { ...t, isLoading: false } : t
        )
      })))
    }
  }

  const toggleNode = async (node: TreeNodeData) => {
    const isExpanded = expanded.has(node.id)

    if (isExpanded) {
      setExpanded(prev => {
        const next = new Set(prev)
        next.delete(node.id)
        return next
      })
    } else {
      setExpanded(prev => new Set(prev).add(node.id))

      if (node.type === 'schema' && !node.children) {
        await loadTables(node.name)
      } else if ((node.type === 'table' || node.type === 'view') && !node.children && node.schema) {
        await loadColumns(node.schema, node.name)
      }
    }
  }

  const handleDoubleClick = (node: TreeNodeData) => {
    if ((node.type === 'table' || node.type === 'view') && node.schema) {
      onTablePreview(node.schema, node.name)
    }
  }

  const renderNode = (node: TreeNodeData, level: number) => {
    const isExpanded = expanded.has(node.id)
    const hasChildren = node.type !== 'column'
    const paddingLeft = level * 16 + 8

    return (
      <div key={node.id}>
        <div
          className={`flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-db-elevated/50 text-db-text-secondary hover:text-db-text transition-colors group`}
          style={{ paddingLeft }}
          onClick={() => hasChildren ? toggleNode(node) : undefined}
          onDoubleClick={() => handleDoubleClick(node)}
        >
          {/* Expand/collapse icon */}
          {hasChildren && (
            <span className="w-4 h-4 flex items-center justify-center text-db-text-muted">
              {node.isLoading ? (
                <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg
                  className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z" />
                </svg>
              )}
            </span>
          )}
          {!hasChildren && <span className="w-4" />}

          {/* Icon based on type */}
          {getNodeIcon(node)}

          {/* Name */}
          <span className="text-sm truncate flex-1">{node.name}</span>

          {/* Column type badge */}
          {node.type === 'column' && node.columnInfo && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-db-surface text-db-text-muted font-mono">
              {node.columnInfo.type}
            </span>
          )}

          {/* Table actions */}
          {(node.type === 'table' || node.type === 'view') && node.schema && (
            <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onTableSelect(node.schema!, node.name)
                }}
                className="p-1 hover:bg-db-elevated rounded text-db-text-muted hover:text-db-text"
                title="View structure"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onTablePreview(node.schema!, node.name)
                }}
                className="p-1 hover:bg-db-elevated rounded text-db-text-muted hover:text-db-text"
                title="Preview data"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Render children */}
        {isExpanded && node.children && (
          <div>
            {node.children.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-db-text-muted">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm">Loading schemas...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 text-db-error text-sm">
        <p>{error}</p>
        <button
          onClick={loadSchemas}
          className="mt-2 text-db-accent hover:underline"
        >
          Retry
        </button>
      </div>
    )
  }

  if (schemas.length === 0) {
    return (
      <div className="p-4 text-db-text-muted text-sm">
        No schemas found
      </div>
    )
  }

  return (
    <div className="py-2">
      {schemas.map(schema => renderNode(schema, 0))}
    </div>
  )
}

function getNodeIcon(node: TreeNodeData) {
  const iconClass = "w-4 h-4"

  switch (node.type) {
    case 'schema':
      return (
        <svg className={`${iconClass} text-db-warning`} viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z" />
        </svg>
      )
    case 'table':
      return (
        <svg className={`${iconClass} text-db-accent`} viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 3h18v18H3V3zm16 4H5v2h14V7zm0 4H5v2h14v-2zm0 4H5v2h14v-2z" />
        </svg>
      )
    case 'view':
      return (
        <svg className={`${iconClass} text-purple-400`} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
        </svg>
      )
    case 'column':
      const isPK = node.columnInfo?.isPrimaryKey
      return (
        <svg className={`${iconClass} ${isPK ? 'text-db-warning' : 'text-db-text-muted'}`} viewBox="0 0 24 24" fill="currentColor">
          {isPK ? (
            <path d="M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
          ) : (
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
          )}
        </svg>
      )
  }
}
