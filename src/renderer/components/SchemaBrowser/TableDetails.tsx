import { useState, useEffect } from 'react'
import type { ColumnInfo, TableInfo } from '../../../shared/types'

interface Props {
  schema: string
  table: string
  onClose: () => void
}

export default function TableDetails({ schema, table, onClose }: Props) {
  const [columns, setColumns] = useState<ColumnInfo[]>([])
  const [tableInfo, setTableInfo] = useState<TableInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'columns' | 'indexes' | 'foreignKeys'>('columns')

  useEffect(() => {
    loadTableDetails()
  }, [schema, table])

  const loadTableDetails = async () => {
    setIsLoading(true)
    try {
      const [cols, info] = await Promise.all([
        window.api.getColumns(schema, table),
        window.api.getTableInfo(schema, table)
      ])
      setColumns(cols)
      setTableInfo(info)
    } catch (err) {
      console.error('Failed to load table details:', err)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="p-4 flex items-center justify-center">
        <div className="flex items-center gap-2 text-db-text-muted">
          <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm">Loading table details...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-db-surface border-l border-db-border">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-db-elevated border-b border-db-border">
        <div>
          <h3 className="text-sm font-semibold text-db-text">{table}</h3>
          <p className="text-xs text-db-text-muted">{schema}</p>
        </div>
        <div className="flex items-center gap-3">
          {tableInfo && (
            <span className="text-xs text-db-text-muted">
              ~{tableInfo.rowCount.toLocaleString()} rows
            </span>
          )}
          <button
            onClick={onClose}
            className="p-1 hover:bg-db-surface rounded text-db-text-muted hover:text-db-text"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-db-border">
        <TabButton
          active={activeTab === 'columns'}
          onClick={() => setActiveTab('columns')}
          count={columns.length}
        >
          Columns
        </TabButton>
        <TabButton
          active={activeTab === 'indexes'}
          onClick={() => setActiveTab('indexes')}
          count={tableInfo?.indexes.length ?? 0}
        >
          Indexes
        </TabButton>
        <TabButton
          active={activeTab === 'foreignKeys'}
          onClick={() => setActiveTab('foreignKeys')}
          count={tableInfo?.foreignKeys.length ?? 0}
        >
          Foreign Keys
        </TabButton>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'columns' && (
          <ColumnsTab columns={columns} />
        )}
        {activeTab === 'indexes' && tableInfo && (
          <IndexesTab indexes={tableInfo.indexes} />
        )}
        {activeTab === 'foreignKeys' && tableInfo && (
          <ForeignKeysTab foreignKeys={tableInfo.foreignKeys} />
        )}
      </div>
    </div>
  )
}

function TabButton({ active, onClick, count, children }: {
  active: boolean
  onClick: () => void
  count: number
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium transition-colors relative ${
        active
          ? 'text-db-accent'
          : 'text-db-text-muted hover:text-db-text'
      }`}
    >
      {children}
      <span className="ml-1.5 text-xs text-db-text-faint">({count})</span>
      {active && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-db-accent" />
      )}
    </button>
  )
}

function ColumnsTab({ columns }: { columns: ColumnInfo[] }) {
  if (columns.length === 0) {
    return <EmptyState>No columns found</EmptyState>
  }

  return (
    <div className="divide-y divide-db-border">
      {columns.map((col) => (
        <div key={col.name} className="px-4 py-3 hover:bg-db-elevated/30">
          <div className="flex items-center gap-2">
            {col.isPrimaryKey && (
              <svg className="w-3.5 h-3.5 text-db-warning" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
              </svg>
            )}
            <span className="text-sm font-medium text-db-text">{col.name}</span>
            <span className="text-xs px-1.5 py-0.5 rounded bg-db-darker text-db-text-muted font-mono">
              {col.type}
            </span>
            {!col.nullable && (
              <span className="text-[10px] px-1 py-0.5 rounded bg-db-error/20 text-db-error font-medium">
                NOT NULL
              </span>
            )}
          </div>
          {col.defaultValue && (
            <p className="mt-1 text-xs text-db-text-muted font-mono">
              Default: {col.defaultValue}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}

function IndexesTab({ indexes }: { indexes: TableInfo['indexes'] }) {
  if (indexes.length === 0) {
    return <EmptyState>No indexes found</EmptyState>
  }

  return (
    <div className="divide-y divide-db-border">
      {indexes.map((idx) => (
        <div key={idx.name} className="px-4 py-3 hover:bg-db-elevated/30">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-db-text">{idx.name}</span>
            {idx.isPrimary && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-db-warning/20 text-db-warning font-medium">
                PRIMARY
              </span>
            )}
            {idx.isUnique && !idx.isPrimary && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-db-accent/20 text-db-accent font-medium">
                UNIQUE
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-db-text-muted font-mono">
            ({idx.columns.join(', ')})
          </p>
        </div>
      ))}
    </div>
  )
}

function ForeignKeysTab({ foreignKeys }: { foreignKeys: TableInfo['foreignKeys'] }) {
  if (foreignKeys.length === 0) {
    return <EmptyState>No foreign keys found</EmptyState>
  }

  return (
    <div className="divide-y divide-db-border">
      {foreignKeys.map((fk) => (
        <div key={fk.name} className="px-4 py-3 hover:bg-db-elevated/30">
          <div className="text-sm font-medium text-db-text">{fk.name}</div>
          <div className="mt-1 text-xs text-db-text-muted">
            <span className="font-mono">{fk.columns.join(', ')}</span>
            <span className="mx-2 text-db-text-faint">→</span>
            <span className="font-mono text-db-accent">{fk.referencedTable}</span>
            <span className="font-mono">({fk.referencedColumns.join(', ')})</span>
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-8 text-center text-db-text-muted text-sm">
      {children}
    </div>
  )
}
