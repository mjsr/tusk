import { useState, useEffect, useCallback } from 'react'

interface UseSecureStorageResult {
  isReady: boolean
  needsAcknowledgment: boolean
  isEncryptionAvailable: boolean
  acknowledge: () => Promise<void>
  store: (key: string, value: string) => Promise<{ success: boolean; error?: string }>
  retrieve: (key: string) => Promise<string | undefined>
  remove: (key: string) => Promise<void>
}

export function useSecureStorage(): UseSecureStorageResult {
  const [isReady, setIsReady] = useState(false)
  const [needsAcknowledgment, setNeedsAcknowledgment] = useState(false)
  const [isEncryptionAvailable, setIsEncryptionAvailable] = useState(false)

  useEffect(() => {
    const checkStatus = async () => {
      const [acknowledged, encryptionAvailable] = await Promise.all([
        window.api.isSecureStorageAcknowledged(),
        window.api.isEncryptionAvailable(),
      ])

      setIsEncryptionAvailable(encryptionAvailable)
      setNeedsAcknowledgment(!acknowledged)
      setIsReady(acknowledged)
    }

    checkStatus()
  }, [])

  const acknowledge = useCallback(async () => {
    await window.api.acknowledgeSecureStorage()
    setNeedsAcknowledgment(false)
    setIsReady(true)
  }, [])

  const store = useCallback(async (key: string, value: string) => {
    if (!isReady) {
      return { success: false, error: 'Secure storage not ready' }
    }
    return window.api.secureStore(key, value)
  }, [isReady])

  const retrieve = useCallback(async (key: string): Promise<string | undefined> => {
    if (!isReady) {
      return undefined
    }
    const result = await window.api.secureRetrieve(key)
    return result.success ? result.value : undefined
  }, [isReady])

  const remove = useCallback(async (key: string) => {
    await window.api.secureDelete(key)
  }, [])

  return {
    isReady,
    needsAcknowledgment,
    isEncryptionAvailable,
    acknowledge,
    store,
    retrieve,
    remove,
  }
}
