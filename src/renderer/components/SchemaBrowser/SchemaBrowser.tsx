import { useState } from 'react'
import SchemaTree from './SchemaTree'
import TableDetails from './TableDetails'

interface Props {
  onPreviewTable: (schema: string, table: string) => void
}

export default function SchemaBrowser({ onPreviewTable }: Props) {
  const [selectedTable, setSelectedTable] = useState<{ schema: string; table: string } | null>(null)

  const handleTableSelect = (schema: string, table: string) => {
    setSelectedTable({ schema, table })
  }

  const handleTablePreview = (schema: string, table: string) => {
    onPreviewTable(schema, table)
  }

  const handleCloseDetails = () => {
    setSelectedTable(null)
  }

  return (
    <div className="h-full flex flex-col bg-db-darker">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-db-border bg-db-elevated">
        <svg className="w-4 h-4 text-db-text-muted" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 3C7.58 3 4 4.79 4 7v10c0 2.21 3.58 4 8 4s8-1.79 8-4V7c0-2.21-3.58-4-8-4zm0 2c3.87 0 6 1.5 6 2s-2.13 2-6 2-6-1.5-6-2 2.13-2 6-2zm6 12c0 .5-2.13 2-6 2s-6-1.5-6-2v-2.23c1.61.78 3.72 1.23 6 1.23s4.39-.45 6-1.23V17zm0-5c0 .5-2.13 2-6 2s-6-1.5-6-2V9.77c1.61.78 3.72 1.23 6 1.23s4.39-.45 6-1.23V12z" />
        </svg>
        <span className="text-xs font-medium text-db-text-secondary uppercase tracking-wide">
          Schema Browser
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Tree panel */}
        <div className={`overflow-auto ${selectedTable ? 'w-1/2' : 'w-full'}`}>
          <SchemaTree
            onTableSelect={handleTableSelect}
            onTablePreview={handleTablePreview}
          />
        </div>

        {/* Details panel */}
        {selectedTable && (
          <div className="w-1/2 overflow-hidden">
            <TableDetails
              schema={selectedTable.schema}
              table={selectedTable.table}
              onClose={handleCloseDetails}
            />
          </div>
        )}
      </div>
    </div>
  )
}
