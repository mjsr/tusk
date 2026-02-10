import { ipcMain, safeStorage } from 'electron'
import Store from 'electron-store'

// License tier type (matches backend)
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

// API base URL - hardcoded for security, env var only for development
const PRODUCTION_API_URL = 'https://api.tusk.dev'

function getApiBaseUrl(): string {
  // Only allow override in development mode
  if (process.env.NODE_ENV === 'development' && process.env.TUSK_API_URL) {
    const devUrl = process.env.TUSK_API_URL
    // Validate it's a valid URL
    try {
      const parsed = new URL(devUrl)
      // Allow localhost in dev only
      if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
        return devUrl
      }
    } catch {
      // Fall through to production URL
    }
  }
  return PRODUCTION_API_URL
}

const API_BASE_URL = getApiBaseUrl()

// Store for license data
const store = new Store<{
  encryptedLicenseKey: string | null
  licenseCache: License | null
  lastValidated: string | null
}>({
  name: 'tusk-license',
  defaults: {
    encryptedLicenseKey: null,
    licenseCache: null,
    lastValidated: null,
  },
})

// Get machine ID for license binding
function getMachineId(): string {
  // In production, use a proper machine fingerprint
  // For now, use a simple identifier
  const os = require('os')
  return Buffer.from(`${os.hostname()}-${os.platform()}-${os.arch()}`).toString('base64')
}

// Validate license key format (basic format check)
function isValidLicenseKeyFormat(key: string): boolean {
  // License key format: TUSK-TIER-XXXXXXXX-XXXX (e.g., TUSK-PRO-DEMO1234-ABCD)
  const pattern = /^TUSK-(FREE|PRO|TEAM)-[A-Z0-9]{8}-[A-Z0-9]{4}$/
  return pattern.test(key.toUpperCase())
}

// Encrypt and store license key
function storeLicenseKey(key: string): { success: boolean; error?: string } {
  if (!safeStorage.isEncryptionAvailable()) {
    // Reject storing sensitive data without encryption
    return {
      success: false,
      error: 'Secure storage is not available. Cannot store license key securely.',
    }
  }

  try {
    const encrypted = safeStorage.encryptString(key)
    store.set('encryptedLicenseKey', encrypted.toString('base64'))
    return { success: true }
  } catch (err) {
    return {
      success: false,
      error: 'Failed to encrypt license key',
    }
  }
}

// Retrieve stored license key
function getLicenseKey(): string | null {
  const encrypted = store.get('encryptedLicenseKey')
  if (!encrypted) return null

  // Require encryption to be available
  if (!safeStorage.isEncryptionAvailable()) {
    // Clear any potentially insecure data
    store.set('encryptedLicenseKey', null)
    return null
  }

  try {
    const buffer = Buffer.from(encrypted, 'base64')
    return safeStorage.decryptString(buffer)
  } catch {
    return null
  }
}

// Validate license with the server
async function validateLicense(key: string): Promise<{ valid: boolean; license?: License; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/license/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        licenseKey: key,
        machineId: getMachineId(),
      }),
    })

    const data = await response.json()
    return data
  } catch (error) {
    // If offline, use cached license (grace period)
    const cached = store.get('licenseCache')
    const lastValidated = store.get('lastValidated')

    if (cached && lastValidated) {
      const daysSinceValidation = (Date.now() - new Date(lastValidated).getTime()) / (1000 * 60 * 60 * 24)
      if (daysSinceValidation < 7) {
        // Allow 7-day offline grace period
        return { valid: true, license: cached }
      }
    }

    return { valid: false, error: 'Unable to validate license. Please check your internet connection.' }
  }
}

// Get current license state
function getLicenseState(): LicenseState {
  const cached = store.get('licenseCache')
  return {
    tier: cached?.tier || 'free',
    license: cached,
    lastValidated: store.get('lastValidated'),
  }
}

export function setupLicenseHandlers(): void {
  // Get current license state
  ipcMain.handle('license:get-state', async (): Promise<LicenseState> => {
    return getLicenseState()
  })

  // Activate a license key
  ipcMain.handle('license:activate', async (_, rawKey: unknown): Promise<{ success: boolean; license?: License; error?: string }> => {
    // Validate input type
    if (typeof rawKey !== 'string') {
      return { success: false, error: 'Invalid license key format' }
    }

    const key = rawKey.trim().toUpperCase()

    // Validate license key format before sending to server
    if (!isValidLicenseKeyFormat(key)) {
      return { success: false, error: 'Invalid license key format. Expected format: TUSK-TIER-XXXXXXXX-XXXX' }
    }

    const result = await validateLicense(key)

    if (result.valid && result.license) {
      const storeResult = storeLicenseKey(key)
      if (!storeResult.success) {
        return { success: false, error: storeResult.error }
      }
      store.set('licenseCache', result.license)
      store.set('lastValidated', new Date().toISOString())
      return { success: true, license: result.license }
    }

    return { success: false, error: result.error }
  })

  // Validate current license (refresh)
  ipcMain.handle('license:validate', async (): Promise<{ valid: boolean; license?: License; error?: string }> => {
    const key = getLicenseKey()
    if (!key) {
      return { valid: true, license: undefined } // Free tier is always valid
    }

    const result = await validateLicense(key)

    if (result.valid && result.license) {
      store.set('licenseCache', result.license)
      store.set('lastValidated', new Date().toISOString())
    }

    return result
  })

  // Deactivate license (revert to free)
  ipcMain.handle('license:deactivate', async (): Promise<void> => {
    store.set('encryptedLicenseKey', null)
    store.set('licenseCache', null)
    store.set('lastValidated', null)
  })

  // Check if a feature is available
  ipcMain.handle('license:has-feature', async (_, feature: string): Promise<boolean> => {
    const state = getLicenseState()
    return hasFeature(state.tier, feature)
  })
}

// Feature availability per tier
const TIER_FEATURES: Record<LicenseTier, string[]> = {
  free: [
    'basic_gui',
    'multiple_connections',
    'query_history',
    'autocomplete',
    'syntax_highlighting',
  ],
  pro: [
    'basic_gui',
    'multiple_connections',
    'query_history',
    'autocomplete',
    'syntax_highlighting',
    'ai_queries',
    'natural_language_sql',
    'query_optimization',
    'csv_reports',
    'users_permissions',
  ],
  team: [
    'basic_gui',
    'multiple_connections',
    'query_history',
    'autocomplete',
    'syntax_highlighting',
    'ai_queries',
    'natural_language_sql',
    'query_optimization',
    'csv_reports',
    'users_permissions',
    'visualizations',
    'shared_dashboards',
    'team_collaboration',
    'action_triggers',
  ],
}

function hasFeature(tier: LicenseTier, feature: string): boolean {
  return TIER_FEATURES[tier].includes(feature)
}
