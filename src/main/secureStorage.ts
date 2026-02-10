import { ipcMain, safeStorage } from 'electron'
import Store from 'electron-store'

// Store for tracking user acknowledgment
const store = new Store<{
  secureStorageAcknowledged: boolean
  secureStorageAcknowledgedAt: string | null
}>({
  name: 'tusk-security',
  defaults: {
    secureStorageAcknowledged: false,
    secureStorageAcknowledgedAt: null,
  },
})

// In-memory storage for encrypted values (keyed by identifier)
const encryptedStore = new Store<Record<string, string>>({
  name: 'tusk-secure-data',
  defaults: {},
})

export function setupSecureStorageHandlers(): void {
  // Check if user has acknowledged the secure storage prompt
  ipcMain.handle('security:is-acknowledged', (): boolean => {
    return store.get('secureStorageAcknowledged')
  })

  // Mark that user has acknowledged the secure storage prompt
  ipcMain.handle('security:acknowledge', (): void => {
    store.set('secureStorageAcknowledged', true)
    store.set('secureStorageAcknowledgedAt', new Date().toISOString())
  })

  // Check if encryption is available
  ipcMain.handle('security:is-encryption-available', (): boolean => {
    return safeStorage.isEncryptionAvailable()
  })

  // Encrypt and store a value
  ipcMain.handle('security:store', (_, key: string, value: string): { success: boolean; error?: string } => {
    // Require encryption to be available - never store sensitive data in plaintext
    if (!safeStorage.isEncryptionAvailable()) {
      return {
        success: false,
        error: 'Secure storage is not available on this system. Cannot store sensitive data.',
      }
    }

    try {
      const encrypted = safeStorage.encryptString(value)
      encryptedStore.set(key, encrypted.toString('base64'))
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to encrypt'
      }
    }
  })

  // Retrieve and decrypt a value
  ipcMain.handle('security:retrieve', (_, key: string): { success: boolean; value?: string; error?: string } => {
    // Require encryption to be available
    if (!safeStorage.isEncryptionAvailable()) {
      return {
        success: false,
        error: 'Secure storage is not available on this system.',
      }
    }

    try {
      const stored = encryptedStore.get(key)
      if (!stored) {
        return { success: true, value: undefined }
      }

      const buffer = Buffer.from(stored, 'base64')
      const decrypted = safeStorage.decryptString(buffer)
      return { success: true, value: decrypted }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to decrypt'
      }
    }
  })

  // Delete a stored value
  ipcMain.handle('security:delete', (_, key: string): void => {
    encryptedStore.delete(key)
  })
}
