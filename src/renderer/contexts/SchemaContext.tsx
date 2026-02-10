import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'

export interface SchemaMetadata {
  schemas: string[]
  tables: Map<string, TableInfo[]>  // schema -> tables
  columns: Map<string, ColumnInfo[]>  // "schema.table" -> columns
}

export interface TableInfo {
  name: string
  type: 'table' | 'view'
  schema: string
}

export interface ColumnInfo {
  name: string
  dataType: string
  isNullable: boolean
  isPrimaryKey?: boolean
}

interface SchemaContextType {
  metadata: SchemaMetadata | null
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
}

const SchemaContext = createContext<SchemaContextType | null>(null)

export function SchemaProvider({ children }: { children: ReactNode }) {
  const [metadata, setMetadata] = useState<SchemaMetadata | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSchemaMetadata = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Fetch all schemas
      const schemas = await window.api.getSchemas()

      const tables = new Map<string, TableInfo[]>()
      const columns = new Map<string, ColumnInfo[]>()

      // Focus on common schemas, skip system schemas for performance
      const relevantSchemas = schemas.filter(s =>
        !['pg_catalog', 'information_schema', 'pg_toast'].includes(s)
      )

      for (const schema of relevantSchemas) {
        try {
          const schemaTables = await window.api.getTables(schema)
          const tableInfos: TableInfo[] = schemaTables.map(t => ({
            name: t.name,
            type: t.type,
            schema
          }))
          tables.set(schema, tableInfos)

          // Fetch columns for each table (limit to first 50 per schema for performance)
          for (const table of schemaTables.slice(0, 50)) {
            try {
              const tableColumns = await window.api.getColumns(schema, table.name)
              columns.set(`${schema}.${table.name}`, tableColumns.map(c => ({
                name: c.name,
                dataType: c.type,
                isNullable: c.nullable,
                isPrimaryKey: c.isPrimaryKey
              })))
            } catch {
              // Skip tables we can't read
            }
          }
        } catch {
          // Skip schemas we can't read
        }
      }

      setMetadata({ schemas: relevantSchemas, tables, columns })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch schema')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Fetch on mount
  useEffect(() => {
    fetchSchemaMetadata()
  }, [fetchSchemaMetadata])

  return (
    <SchemaContext.Provider
      value={{
        metadata,
        isLoading,
        error,
        refresh: fetchSchemaMetadata
      }}
    >
      {children}
    </SchemaContext.Provider>
  )
}

export function useSchema(): SchemaContextType {
  const context = useContext(SchemaContext)
  if (!context) {
    throw new Error('useSchema must be used within a SchemaProvider')
  }
  return context
}

// Helper to get all tables as a flat list
export function getAllTables(metadata: SchemaMetadata): TableInfo[] {
  const allTables: TableInfo[] = []
  metadata.tables.forEach(tables => {
    allTables.push(...tables)
  })
  return allTables
}

// Helper to get columns for a specific table
export function getTableColumns(
  metadata: SchemaMetadata,
  schema: string,
  table: string
): ColumnInfo[] {
  return metadata.columns.get(`${schema}.${table}`) || []
}

// Helper to find a table by name (searches all schemas)
export function findTable(
  metadata: SchemaMetadata,
  tableName: string
): TableInfo | undefined {
  for (const [, tables] of metadata.tables) {
    const found = tables.find(t => t.name.toLowerCase() === tableName.toLowerCase())
    if (found) return found
  }
  return undefined
}
