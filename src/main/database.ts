import { ipcMain } from 'electron'
import { Client } from 'pg'
import type { ConnectionTestResult, QueryResult, DatabaseRole, RoleMembership, TableGrant, SchemaGrant } from '../shared/types'
import {
  validateConnectionConfig,
  validateSQL,
  validateSchemaName,
  validateTableName,
  validateLimit,
  validateRoleName
} from './validation'

let activeClient: Client | null = null

export function setupDatabaseHandlers() {
  ipcMain.handle('db:test-connection', async (_, rawConfig: unknown): Promise<ConnectionTestResult> => {
    const config = validateConnectionConfig(rawConfig)

    const client = new Client({
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.user,
      password: config.password,
      ssl: config.ssl ? { rejectUnauthorized: false } : false,
      connectionTimeoutMillis: 5000
    })

    try {
      await client.connect()
      const result = await client.query('SELECT version()')
      const version = result.rows[0]?.version as string
      await client.end()

      return {
        success: true,
        message: 'Connection successful',
        serverVersion: version
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  })

  ipcMain.handle('db:connect', async (_, rawConfig: unknown): Promise<ConnectionTestResult> => {
    const config = validateConnectionConfig(rawConfig)

    if (activeClient) {
      try {
        await activeClient.end()
      } catch {
        // Ignore errors when closing existing connection
      }
    }

    activeClient = new Client({
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.user,
      password: config.password,
      ssl: config.ssl ? { rejectUnauthorized: false } : false
    })

    try {
      await activeClient.connect()
      const result = await activeClient.query('SELECT version()')
      const version = result.rows[0]?.version as string

      return {
        success: true,
        message: 'Connected successfully',
        serverVersion: version
      }
    } catch (error) {
      activeClient = null
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  })

  ipcMain.handle('db:disconnect', async (): Promise<void> => {
    if (activeClient) {
      await activeClient.end()
      activeClient = null
    }
  })

  ipcMain.handle('db:query', async (_, rawSql: unknown): Promise<QueryResult> => {
    if (!activeClient) {
      throw new Error('Not connected to database')
    }

    const sql = validateSQL(rawSql)
    const result = await activeClient.query(sql)
    return {
      rows: result.rows,
      fields: result.fields.map(f => ({ name: f.name, dataTypeID: f.dataTypeID })),
      rowCount: result.rowCount ?? 0,
      command: result.command
    }
  })

  // Schema browser handlers
  ipcMain.handle('db:get-schemas', async (): Promise<string[]> => {
    if (!activeClient) {
      throw new Error('Not connected to database')
    }

    const result = await activeClient.query(`
      SELECT schema_name
      FROM information_schema.schemata
      WHERE schema_name NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
        AND schema_name NOT LIKE 'pg_temp_%'
        AND schema_name NOT LIKE 'pg_toast_temp_%'
      ORDER BY schema_name
    `)
    return result.rows.map(row => row.schema_name)
  })

  ipcMain.handle('db:get-tables', async (_, rawSchema: unknown): Promise<{ name: string; type: 'table' | 'view' }[]> => {
    if (!activeClient) {
      throw new Error('Not connected to database')
    }

    const schema = validateSchemaName(rawSchema)
    const result = await activeClient.query(`
      SELECT table_name, table_type
      FROM information_schema.tables
      WHERE table_schema = $1
      ORDER BY table_name
    `, [schema])

    return result.rows.map(row => ({
      name: row.table_name,
      type: row.table_type === 'VIEW' ? 'view' : 'table'
    }))
  })

  ipcMain.handle('db:get-columns', async (_, rawSchema: unknown, rawTable: unknown): Promise<{
    name: string
    type: string
    nullable: boolean
    defaultValue: string | null
    isPrimaryKey: boolean
  }[]> => {
    if (!activeClient) {
      throw new Error('Not connected to database')
    }

    const schema = validateSchemaName(rawSchema)
    const table = validateTableName(rawTable)

    // Get columns with primary key info
    const result = await activeClient.query(`
      SELECT
        c.column_name,
        c.data_type,
        c.is_nullable,
        c.column_default,
        CASE WHEN pk.column_name IS NOT NULL THEN true ELSE false END as is_primary_key
      FROM information_schema.columns c
      LEFT JOIN (
        SELECT ku.column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage ku
          ON tc.constraint_name = ku.constraint_name
          AND tc.table_schema = ku.table_schema
        WHERE tc.constraint_type = 'PRIMARY KEY'
          AND tc.table_schema = $1
          AND tc.table_name = $2
      ) pk ON c.column_name = pk.column_name
      WHERE c.table_schema = $1 AND c.table_name = $2
      ORDER BY c.ordinal_position
    `, [schema, table])

    return result.rows.map(row => ({
      name: row.column_name,
      type: row.data_type,
      nullable: row.is_nullable === 'YES',
      defaultValue: row.column_default,
      isPrimaryKey: row.is_primary_key
    }))
  })

  ipcMain.handle('db:get-table-info', async (_, rawSchema: unknown, rawTable: unknown): Promise<{
    rowCount: number
    indexes: { name: string; columns: string[]; isUnique: boolean; isPrimary: boolean }[]
    foreignKeys: { name: string; columns: string[]; referencedTable: string; referencedColumns: string[] }[]
  }> => {
    if (!activeClient) {
      throw new Error('Not connected to database')
    }

    const schema = validateSchemaName(rawSchema)
    const table = validateTableName(rawTable)

    // Get approximate row count
    const countResult = await activeClient.query(`
      SELECT reltuples::bigint AS estimate
      FROM pg_class
      WHERE oid = $1::regclass
    `, [`"${schema}"."${table}"`])
    const rowCount = Number(countResult.rows[0]?.estimate ?? 0)

    // Get indexes
    const indexResult = await activeClient.query(`
      SELECT
        i.relname as index_name,
        array_agg(a.attname ORDER BY array_position(ix.indkey, a.attnum)) as columns,
        ix.indisunique as is_unique,
        ix.indisprimary as is_primary
      FROM pg_index ix
      JOIN pg_class t ON t.oid = ix.indrelid
      JOIN pg_class i ON i.oid = ix.indexrelid
      JOIN pg_namespace n ON n.oid = t.relnamespace
      JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(ix.indkey)
      WHERE n.nspname = $1 AND t.relname = $2
      GROUP BY i.relname, ix.indisunique, ix.indisprimary
      ORDER BY i.relname
    `, [schema, table])

    const indexes = indexResult.rows.map(row => ({
      name: row.index_name,
      columns: row.columns,
      isUnique: row.is_unique,
      isPrimary: row.is_primary
    }))

    // Get foreign keys
    const fkResult = await activeClient.query(`
      SELECT
        tc.constraint_name,
        array_agg(kcu.column_name ORDER BY kcu.ordinal_position) as columns,
        ccu.table_schema || '.' || ccu.table_name as referenced_table,
        array_agg(ccu.column_name ORDER BY kcu.ordinal_position) as referenced_columns
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = $1
        AND tc.table_name = $2
      GROUP BY tc.constraint_name, ccu.table_schema, ccu.table_name
    `, [schema, table])

    const foreignKeys = fkResult.rows.map(row => ({
      name: row.constraint_name,
      columns: row.columns,
      referencedTable: row.referenced_table,
      referencedColumns: row.referenced_columns
    }))

    return { rowCount, indexes, foreignKeys }
  })

  ipcMain.handle('db:preview-table', async (_, rawSchema: unknown, rawTable: unknown, rawLimit?: unknown): Promise<QueryResult> => {
    if (!activeClient) {
      throw new Error('Not connected to database')
    }

    const schema = validateSchemaName(rawSchema)
    const table = validateTableName(rawTable)
    const limit = validateLimit(rawLimit)

    // Use pg's identifier escaping for safe quoting
    // Since we validated the names only contain safe characters, this is safe
    const result = await activeClient.query(
      `SELECT * FROM "${schema}"."${table}" LIMIT $1`,
      [limit]
    )

    return {
      rows: result.rows,
      fields: result.fields.map(f => ({ name: f.name, dataTypeID: f.dataTypeID })),
      rowCount: result.rowCount ?? 0,
      command: result.command
    }
  })

  ipcMain.handle('db:get-primary-keys', async (_, rawSchema: unknown, rawTable: unknown): Promise<string[]> => {
    if (!activeClient) {
      throw new Error('Not connected to database')
    }

    const schema = validateSchemaName(rawSchema)
    const table = validateTableName(rawTable)

    const result = await activeClient.query(`
      SELECT a.attname as column_name
      FROM pg_index i
      JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
      JOIN pg_class c ON c.oid = i.indrelid
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE i.indisprimary
        AND n.nspname = $1
        AND c.relname = $2
      ORDER BY array_position(i.indkey, a.attnum)
    `, [schema, table])

    return result.rows.map(row => row.column_name)
  })

  // Users & Permissions handlers
  ipcMain.handle('db:get-roles', async (): Promise<DatabaseRole[]> => {
    if (!activeClient) {
      throw new Error('Not connected to database')
    }

    const result = await activeClient.query(`
      SELECT
        rolname as name,
        rolsuper as is_superuser,
        rolcreatedb as can_create_db,
        rolcreaterole as can_create_role,
        rolcanlogin as can_login,
        rolreplication as has_replication,
        rolconnlimit as connection_limit,
        rolvaliduntil as valid_until,
        oid
      FROM pg_roles
      ORDER BY rolname
    `)

    return result.rows.map(row => ({
      name: row.name,
      isSuperuser: row.is_superuser,
      canCreateDb: row.can_create_db,
      canCreateRole: row.can_create_role,
      canLogin: row.can_login,
      hasReplication: row.has_replication,
      connectionLimit: row.connection_limit,
      validUntil: row.valid_until ? row.valid_until.toISOString() : null,
      oid: row.oid
    }))
  })

  ipcMain.handle('db:get-role-memberships', async (_, rawRole: unknown): Promise<RoleMembership[]> => {
    if (!activeClient) {
      throw new Error('Not connected to database')
    }

    const role = validateRoleName(rawRole)

    const result = await activeClient.query(`
      SELECT
        r.rolname as role_name,
        m.rolname as member_name,
        am.admin_option
      FROM pg_auth_members am
      JOIN pg_roles r ON r.oid = am.roleid
      JOIN pg_roles m ON m.oid = am.member
      WHERE r.rolname = $1 OR m.rolname = $1
      ORDER BY r.rolname, m.rolname
    `, [role])

    return result.rows.map(row => ({
      roleName: row.role_name,
      memberName: row.member_name,
      adminOption: row.admin_option
    }))
  })

  ipcMain.handle('db:get-table-grants', async (_, rawRole: unknown): Promise<TableGrant[]> => {
    if (!activeClient) {
      throw new Error('Not connected to database')
    }

    const role = validateRoleName(rawRole)

    const result = await activeClient.query(`
      SELECT
        table_schema as schema_name,
        table_name,
        grantee,
        array_agg(privilege_type ORDER BY privilege_type) as privileges
      FROM information_schema.role_table_grants
      WHERE grantee = $1
        AND table_schema NOT IN ('pg_catalog', 'information_schema')
      GROUP BY table_schema, table_name, grantee
      ORDER BY table_schema, table_name
    `, [role])

    return result.rows.map(row => ({
      schemaName: row.schema_name,
      tableName: row.table_name,
      grantee: row.grantee,
      privileges: row.privileges
    }))
  })

  ipcMain.handle('db:get-schema-grants', async (_, rawRole: unknown): Promise<SchemaGrant[]> => {
    if (!activeClient) {
      throw new Error('Not connected to database')
    }

    const role = validateRoleName(rawRole)

    // Get all non-system schemas and check privileges
    const result = await activeClient.query(`
      SELECT
        n.nspname as schema_name,
        $1::text as grantee,
        CASE WHEN has_schema_privilege($1, n.nspname, 'USAGE') THEN 'USAGE' ELSE NULL END as usage_priv,
        CASE WHEN has_schema_privilege($1, n.nspname, 'CREATE') THEN 'CREATE' ELSE NULL END as create_priv
      FROM pg_namespace n
      WHERE n.nspname NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
        AND n.nspname NOT LIKE 'pg_temp_%'
        AND n.nspname NOT LIKE 'pg_toast_temp_%'
        AND (has_schema_privilege($1, n.nspname, 'USAGE') OR has_schema_privilege($1, n.nspname, 'CREATE'))
      ORDER BY n.nspname
    `, [role])

    const grants: SchemaGrant[] = []
    for (const row of result.rows) {
      if (row.usage_priv) {
        grants.push({
          schemaName: row.schema_name,
          grantee: row.grantee,
          privilegeType: 'USAGE'
        })
      }
      if (row.create_priv) {
        grants.push({
          schemaName: row.schema_name,
          grantee: row.grantee,
          privilegeType: 'CREATE'
        })
      }
    }

    return grants
  })
}
