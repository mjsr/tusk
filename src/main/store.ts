import { ipcMain, safeStorage } from 'electron'
import Store from 'electron-store'
import type { SavedConnection, SavedQuery } from '../shared/types'
import { validateConnectionConfig, validateConnectionId, validateSavedQuery, validateQueryId } from './validation'

// Store connection metadata (without passwords)
type StoredConnection = Omit<SavedConnection, 'password'> & {
  encryptedPassword?: string // Base64 encoded encrypted password
}

interface StoreSchema {
  connections: StoredConnection[]
  savedQueries: SavedQuery[]
}

const store = new Store<StoreSchema>({
  defaults: {
    connections: [],
    savedQueries: []
  }
})

// Encrypt password using OS keychain (macOS Keychain, Windows Credential Manager, etc.)
function encryptPassword(password: string): string | undefined {
  if (!password) return undefined
  if (!safeStorage.isEncryptionAvailable()) {
    console.warn('safeStorage encryption not available, storing password in plain text')
    return Buffer.from(password).toString('base64')
  }
  return safeStorage.encryptString(password).toString('base64')
}

// Decrypt password from OS keychain
function decryptPassword(encryptedPassword: string | undefined): string {
  if (!encryptedPassword) return ''
  const buffer = Buffer.from(encryptedPassword, 'base64')
  if (!safeStorage.isEncryptionAvailable()) {
    return buffer.toString('utf-8')
  }
  try {
    return safeStorage.decryptString(buffer)
  } catch {
    // If decryption fails, password might be stored in plain base64 (migration case)
    return buffer.toString('utf-8')
  }
}

export function setupConnectionStore() {
  ipcMain.handle('store:get-connections', (): SavedConnection[] => {
    const connections = store.get('connections')
    // Decrypt passwords before sending to renderer
    return connections.map(conn => ({
      ...conn,
      password: decryptPassword(conn.encryptedPassword)
    }))
  })

  ipcMain.handle('store:save-connection', (_, rawConnection: unknown): void => {
    // Validate input from renderer
    const connection = validateConnectionConfig(rawConnection)
    const connections = store.get('connections')

    // Encrypt password before storing
    const storedConnection: StoredConnection = {
      id: connection.id,
      name: connection.name,
      host: connection.host,
      port: connection.port,
      database: connection.database,
      user: connection.user,
      ssl: connection.ssl,
      encryptedPassword: encryptPassword(connection.password)
    }

    const existingIndex = connections.findIndex(c => c.id === connection.id)

    if (existingIndex >= 0) {
      connections[existingIndex] = storedConnection
    } else {
      connections.push(storedConnection)
    }

    store.set('connections', connections)
  })

  ipcMain.handle('store:delete-connection', (_, rawId: unknown): void => {
    const id = validateConnectionId(rawId)
    const connections = store.get('connections')
    store.set('connections', connections.filter(c => c.id !== id))
  })

  ipcMain.handle('store:update-last-connected', (_, rawId: unknown): void => {
    const id = validateConnectionId(rawId)
    const connections = store.get('connections')
    const connection = connections.find(c => c.id === id)
    if (connection) {
      connection.lastConnected = new Date().toISOString()
      store.set('connections', connections)
    }
  })

  // Saved queries handlers
  ipcMain.handle('store:get-saved-queries', (): SavedQuery[] => {
    return store.get('savedQueries')
  })

  ipcMain.handle('store:save-query', (_, rawQuery: unknown): SavedQuery => {
    const query = validateSavedQuery(rawQuery)
    const queries = store.get('savedQueries')
    const now = new Date().toISOString()

    const existingIndex = queries.findIndex(q => q.id === query.id)

    const savedQuery: SavedQuery = {
      ...query,
      createdAt: existingIndex >= 0 ? queries[existingIndex].createdAt : now,
      updatedAt: now
    }

    if (existingIndex >= 0) {
      queries[existingIndex] = savedQuery
    } else {
      queries.push(savedQuery)
    }

    store.set('savedQueries', queries)
    return savedQuery
  })

  ipcMain.handle('store:delete-query', (_, rawId: unknown): void => {
    const id = validateQueryId(rawId)
    const queries = store.get('savedQueries')
    store.set('savedQueries', queries.filter(q => q.id !== id))
  })

  ipcMain.handle('store:get-query-folders', (): string[] => {
    const queries = store.get('savedQueries')
    const folders = new Set<string>()
    queries.forEach(q => {
      if (q.folder) folders.add(q.folder)
    })
    return Array.from(folders).sort()
  })
}
