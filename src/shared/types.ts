export interface ConnectionConfig {
  id: string
  name: string
  host: string
  port: number
  database: string
  user: string
  password: string
  ssl?: boolean
}

export interface ConnectionTestResult {
  success: boolean
  message: string
  serverVersion?: string
}

export interface QueryResult {
  rows: Record<string, unknown>[]
  fields: { name: string; dataTypeID: number }[]
  rowCount: number
  command: string
}

export interface SavedConnection extends ConnectionConfig {
  lastConnected?: string
}

export interface ColumnInfo {
  name: string
  type: string
  nullable: boolean
  defaultValue: string | null
  isPrimaryKey: boolean
}

export interface TableInfo {
  rowCount: number
  indexes: {
    name: string
    columns: string[]
    isUnique: boolean
    isPrimary: boolean
  }[]
  foreignKeys: {
    name: string
    columns: string[]
    referencedTable: string
    referencedColumns: string[]
  }[]
}

// Data editing types
export interface TableContext {
  schema: string
  table: string
  primaryKeys: string[]
}

export interface RowChange {
  type: 'update' | 'insert' | 'delete'
  rowIndex: number
  originalRow?: Record<string, unknown>
  newRow?: Record<string, unknown>
  changedColumns?: string[]
}

export interface PendingChanges {
  tableContext: TableContext
  changes: RowChange[]
}

export interface GeneratedSQL {
  statements: string[]
  params: unknown[][]
}

// Saved queries types
export interface SavedQuery {
  id: string
  name: string
  sql: string
  folder?: string
  createdAt: string
  updatedAt: string
}

// License types
export type LicenseTier = 'free' | 'pro' | 'team'

export interface License {
  key: string
  tier: LicenseTier
  email: string
  expiresAt: string | null
  maxSeats?: number
  createdAt: string
}

export interface LicenseState {
  tier: LicenseTier
  license: License | null
  lastValidated: string | null
}

// Feature flags
export type Feature =
  | 'basic_gui'
  | 'multiple_connections'
  | 'query_history'
  | 'autocomplete'
  | 'syntax_highlighting'
  | 'ai_queries'
  | 'natural_language_sql'
  | 'query_optimization'
  | 'csv_reports'
  | 'visualizations'
  | 'shared_dashboards'
  | 'team_collaboration'
  | 'action_triggers'
  | 'users_permissions'

// Database role types
export interface DatabaseRole {
  name: string
  isSuperuser: boolean
  canCreateDb: boolean
  canCreateRole: boolean
  canLogin: boolean
  hasReplication: boolean
  connectionLimit: number
  validUntil: string | null
  oid: number
}

export interface RoleMembership {
  roleName: string
  memberName: string
  adminOption: boolean
}

export interface TableGrant {
  schemaName: string
  tableName: string
  grantee: string
  privileges: string[]
}

export interface SchemaGrant {
  schemaName: string
  grantee: string
  privilegeType: 'USAGE' | 'CREATE'
}

// Auth types
export interface User {
  id: string
  email: string
  fullName?: string
  avatarUrl?: string
}

export interface AuthSession {
  user: User
  accessToken: string
  refreshToken: string
  expiresAt: number
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}
