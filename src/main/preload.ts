import { contextBridge, ipcRenderer } from 'electron'
import type { ConnectionConfig, ConnectionTestResult, QueryResult, SavedConnection, ColumnInfo, TableInfo, SavedQuery } from '../shared/types'

const api = {
  // Database operations
  testConnection: (config: ConnectionConfig): Promise<ConnectionTestResult> =>
    ipcRenderer.invoke('db:test-connection', config),

  connect: (config: ConnectionConfig): Promise<ConnectionTestResult> =>
    ipcRenderer.invoke('db:connect', config),

  disconnect: (): Promise<void> =>
    ipcRenderer.invoke('db:disconnect'),

  query: (sql: string): Promise<QueryResult> =>
    ipcRenderer.invoke('db:query', sql),

  // Schema browser
  getSchemas: (): Promise<string[]> =>
    ipcRenderer.invoke('db:get-schemas'),

  getTables: (schema: string): Promise<{ name: string; type: 'table' | 'view' }[]> =>
    ipcRenderer.invoke('db:get-tables', schema),

  getColumns: (schema: string, table: string): Promise<ColumnInfo[]> =>
    ipcRenderer.invoke('db:get-columns', schema, table),

  getTableInfo: (schema: string, table: string): Promise<TableInfo> =>
    ipcRenderer.invoke('db:get-table-info', schema, table),

  previewTable: (schema: string, table: string, limit?: number): Promise<QueryResult> =>
    ipcRenderer.invoke('db:preview-table', schema, table, limit),

  getPrimaryKeys: (schema: string, table: string): Promise<string[]> =>
    ipcRenderer.invoke('db:get-primary-keys', schema, table),

  // Connection store
  getConnections: (): Promise<SavedConnection[]> =>
    ipcRenderer.invoke('store:get-connections'),

  saveConnection: (connection: SavedConnection): Promise<void> =>
    ipcRenderer.invoke('store:save-connection', connection),

  deleteConnection: (id: string): Promise<void> =>
    ipcRenderer.invoke('store:delete-connection', id),

  updateLastConnected: (id: string): Promise<void> =>
    ipcRenderer.invoke('store:update-last-connected', id),

  // Saved queries
  getSavedQueries: (): Promise<SavedQuery[]> =>
    ipcRenderer.invoke('store:get-saved-queries'),

  saveQuery: (query: Omit<SavedQuery, 'createdAt' | 'updatedAt'>): Promise<SavedQuery> =>
    ipcRenderer.invoke('store:save-query', query),

  deleteQuery: (id: string): Promise<void> =>
    ipcRenderer.invoke('store:delete-query', id),

  getQueryFolders: (): Promise<string[]> =>
    ipcRenderer.invoke('store:get-query-folders'),

  // Auto-updater
  checkForUpdates: (): Promise<void> =>
    ipcRenderer.invoke('updater:check'),

  downloadUpdate: (): Promise<void> =>
    ipcRenderer.invoke('updater:download'),

  installUpdate: (): Promise<void> =>
    ipcRenderer.invoke('updater:install'),

  onUpdateStatus: (callback: (event: { status: string; data?: unknown }) => void) => {
    const listener = (_: unknown, data: { status: string; data?: unknown }) => callback(data)
    ipcRenderer.on('updater:status', listener)
    return () => ipcRenderer.removeListener('updater:status', listener)
  }
}

contextBridge.exposeInMainWorld('api', api)

export type ElectronAPI = typeof api
