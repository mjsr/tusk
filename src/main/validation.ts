/**
 * IPC Input Validation
 *
 * All data from the renderer process should be treated as untrusted.
 * These validators ensure data conforms to expected types and constraints.
 */

export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

// Type guard helpers
function isString(value: unknown): value is string {
  return typeof value === 'string'
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value)
}

function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean'
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

// Sanitize string to prevent injection in identifiers
// Only allows alphanumeric, underscore, and common safe characters
export function sanitizeIdentifier(value: string): string {
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(value)) {
    throw new ValidationError(`Invalid identifier: ${value}`)
  }
  return value
}

// Validate connection config from renderer
export function validateConnectionConfig(data: unknown): {
  id: string
  name: string
  host: string
  port: number
  database: string
  user: string
  password: string
  ssl?: boolean
} {
  if (!isObject(data)) {
    throw new ValidationError('Connection config must be an object')
  }

  const { id, name, host, port, database, user, password, ssl } = data

  if (!isString(id) || id.length === 0 || id.length > 100) {
    throw new ValidationError('Invalid connection id')
  }

  if (!isString(name) || name.length > 100) {
    throw new ValidationError('Invalid connection name')
  }

  if (!isString(host) || host.length === 0 || host.length > 255) {
    throw new ValidationError('Invalid host')
  }

  if (!isNumber(port) || port < 1 || port > 65535) {
    throw new ValidationError('Invalid port')
  }

  if (!isString(database) || database.length === 0 || database.length > 100) {
    throw new ValidationError('Invalid database name')
  }

  if (!isString(user) || user.length === 0 || user.length > 100) {
    throw new ValidationError('Invalid user')
  }

  if (!isString(password)) {
    throw new ValidationError('Invalid password')
  }

  if (ssl !== undefined && !isBoolean(ssl)) {
    throw new ValidationError('Invalid ssl flag')
  }

  return {
    id,
    name,
    host,
    port,
    database,
    user,
    password,
    ssl: ssl ?? false
  }
}

// Validate SQL query - basic checks (can't fully prevent injection in free-form SQL)
export function validateSQL(sql: unknown): string {
  if (!isString(sql)) {
    throw new ValidationError('SQL must be a string')
  }

  if (sql.length > 1_000_000) {
    throw new ValidationError('SQL query too large')
  }

  return sql
}

// Validate schema name
export function validateSchemaName(schema: unknown): string {
  if (!isString(schema) || schema.length === 0 || schema.length > 128) {
    throw new ValidationError('Invalid schema name')
  }

  // PostgreSQL identifier rules: start with letter or underscore, contain only safe chars
  // Allow quoted identifiers but validate they're reasonable
  if (!/^[a-zA-Z_][a-zA-Z0-9_$]*$/.test(schema)) {
    throw new ValidationError('Schema name contains invalid characters')
  }

  return schema
}

// Validate table name
export function validateTableName(table: unknown): string {
  if (!isString(table) || table.length === 0 || table.length > 128) {
    throw new ValidationError('Invalid table name')
  }

  if (!/^[a-zA-Z_][a-zA-Z0-9_$]*$/.test(table)) {
    throw new ValidationError('Table name contains invalid characters')
  }

  return table
}

// Validate limit for queries
export function validateLimit(limit: unknown): number {
  if (limit === undefined) return 100

  if (!isNumber(limit) || limit < 1 || limit > 10000) {
    throw new ValidationError('Invalid limit (must be 1-10000)')
  }

  return Math.floor(limit)
}

// Validate connection ID
export function validateConnectionId(id: unknown): string {
  if (!isString(id) || id.length === 0 || id.length > 100) {
    throw new ValidationError('Invalid connection id')
  }

  return id
}

// Validate saved query
export function validateSavedQuery(data: unknown): {
  id: string
  name: string
  sql: string
  folder?: string
} {
  if (!isObject(data)) {
    throw new ValidationError('Saved query must be an object')
  }

  const { id, name, sql, folder } = data

  if (!isString(id) || id.length === 0 || id.length > 100) {
    throw new ValidationError('Invalid query id')
  }

  if (!isString(name) || name.length === 0 || name.length > 200) {
    throw new ValidationError('Invalid query name')
  }

  if (!isString(sql) || sql.length === 0 || sql.length > 1_000_000) {
    throw new ValidationError('Invalid query SQL')
  }

  if (folder !== undefined && (!isString(folder) || folder.length > 100)) {
    throw new ValidationError('Invalid folder name')
  }

  return { id, name, sql, folder: folder as string | undefined }
}

// Validate query ID
export function validateQueryId(id: unknown): string {
  if (!isString(id) || id.length === 0 || id.length > 100) {
    throw new ValidationError('Invalid query id')
  }

  return id
}
