import { useState, useEffect, useCallback } from 'react'

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

interface UseSchemaCache {
  metadata: SchemaMetadata | null
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useSchemaCache(): UseSchemaCache {
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

      // Fetch tables and columns for each schema
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

          // Fetch columns for each table (limit to avoid overwhelming)
          for (const table of schemaTables.slice(0, 100)) {
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

  return {
    metadata,
    isLoading,
    error,
    refresh: fetchSchemaMetadata
  }
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
