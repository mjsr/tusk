import type { TableContext, RowChange } from '../../shared/types'

/**
 * Generates SQL statements for pending changes.
 * Returns human-readable SQL for preview (with values inline).
 */
export function generateSQL(context: TableContext, changes: RowChange[]): string[] {
  const statements: string[] = []
  const { schema, table, primaryKeys } = context

  for (const change of changes) {
    switch (change.type) {
      case 'update':
        statements.push(generateUpdate(schema, table, primaryKeys, change))
        break
      case 'insert':
        statements.push(generateInsert(schema, table, change))
        break
      case 'delete':
        statements.push(generateDelete(schema, table, primaryKeys, change))
        break
    }
  }

  return statements
}

function generateUpdate(
  schema: string,
  table: string,
  primaryKeys: string[],
  change: RowChange
): string {
  if (!change.originalRow || !change.newRow || !change.changedColumns) {
    return '-- Invalid update change'
  }

  const setClauses = change.changedColumns
    .map(col => `  "${col}" = ${formatValue(change.newRow![col])}`)
    .join(',\n')

  const whereClauses = primaryKeys
    .map(pk => `"${pk}" = ${formatValue(change.originalRow![pk])}`)
    .join(' AND ')

  return `UPDATE "${schema}"."${table}"
SET
${setClauses}
WHERE ${whereClauses};`
}

function generateInsert(schema: string, table: string, change: RowChange): string {
  if (!change.newRow) {
    return '-- Invalid insert change'
  }

  const columns = Object.keys(change.newRow)
    .filter(col => change.newRow![col] !== null && change.newRow![col] !== undefined)

  if (columns.length === 0) {
    return '-- No columns to insert'
  }

  const columnList = columns.map(c => `"${c}"`).join(', ')
  const valueList = columns.map(c => formatValue(change.newRow![c])).join(', ')

  return `INSERT INTO "${schema}"."${table}" (${columnList})
VALUES (${valueList});`
}

function generateDelete(
  schema: string,
  table: string,
  primaryKeys: string[],
  change: RowChange
): string {
  if (!change.originalRow) {
    return '-- Invalid delete change'
  }

  const whereClauses = primaryKeys
    .map(pk => `"${pk}" = ${formatValue(change.originalRow![pk])}`)
    .join(' AND ')

  return `DELETE FROM "${schema}"."${table}"
WHERE ${whereClauses};`
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) {
    return 'NULL'
  }

  if (typeof value === 'number') {
    return String(value)
  }

  if (typeof value === 'boolean') {
    return value ? 'TRUE' : 'FALSE'
  }

  if (value instanceof Date) {
    return `'${value.toISOString()}'`
  }

  if (typeof value === 'object') {
    return `'${JSON.stringify(value).replace(/'/g, "''")}'`
  }

  // String - escape single quotes
  return `'${String(value).replace(/'/g, "''")}'`
}

/**
 * Generates parameterized SQL for safe execution.
 * Returns statements with $1, $2 placeholders and separate params array.
 */
export function generateParameterizedSQL(
  context: TableContext,
  changes: RowChange[]
): { sql: string; params: unknown[] }[] {
  const results: { sql: string; params: unknown[] }[] = []
  const { schema, table, primaryKeys } = context

  for (const change of changes) {
    switch (change.type) {
      case 'update':
        results.push(generateParameterizedUpdate(schema, table, primaryKeys, change))
        break
      case 'insert':
        results.push(generateParameterizedInsert(schema, table, change))
        break
      case 'delete':
        results.push(generateParameterizedDelete(schema, table, primaryKeys, change))
        break
    }
  }

  return results
}

function generateParameterizedUpdate(
  schema: string,
  table: string,
  primaryKeys: string[],
  change: RowChange
): { sql: string; params: unknown[] } {
  const params: unknown[] = []
  let paramIndex = 1

  const setClauses = change.changedColumns!
    .map(col => {
      params.push(change.newRow![col])
      return `"${col}" = $${paramIndex++}`
    })
    .join(', ')

  const whereClauses = primaryKeys
    .map(pk => {
      params.push(change.originalRow![pk])
      return `"${pk}" = $${paramIndex++}`
    })
    .join(' AND ')

  return {
    sql: `UPDATE "${schema}"."${table}" SET ${setClauses} WHERE ${whereClauses}`,
    params
  }
}

function generateParameterizedInsert(
  schema: string,
  table: string,
  change: RowChange
): { sql: string; params: unknown[] } {
  const columns = Object.keys(change.newRow!)
    .filter(col => change.newRow![col] !== null && change.newRow![col] !== undefined)

  const params = columns.map(c => change.newRow![c])
  const columnList = columns.map(c => `"${c}"`).join(', ')
  const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ')

  return {
    sql: `INSERT INTO "${schema}"."${table}" (${columnList}) VALUES (${placeholders})`,
    params
  }
}

function generateParameterizedDelete(
  schema: string,
  table: string,
  primaryKeys: string[],
  change: RowChange
): { sql: string; params: unknown[] } {
  const params = primaryKeys.map(pk => change.originalRow![pk])
  const whereClauses = primaryKeys
    .map((pk, i) => `"${pk}" = $${i + 1}`)
    .join(' AND ')

  return {
    sql: `DELETE FROM "${schema}"."${table}" WHERE ${whereClauses}`,
    params
  }
}
