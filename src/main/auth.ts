import { ipcMain, safeStorage, BrowserWindow } from 'electron'
import Store from 'electron-store'
import { supabase } from './supabase'
import { validateEmail, validatePassword, validateFullName, ValidationError } from './validation'
import type { User, AuthSession } from '../shared/types'

// For accessing main window from deep link handler
let getMainWindowFn: (() => BrowserWindow | null) | null = null

export function setMainWindowGetter(fn: () => BrowserWindow | null): void {
  getMainWindowFn = fn
}

// Secure store for auth tokens
const authStore = new Store<{
  encryptedSession: string | null
}>({
  name: 'tusk-auth',
  defaults: {
    encryptedSession: null,
  },
})

// Encrypt session data for storage
function encryptSession(session: AuthSession): { encrypted: string } | { error: string } {
  const data = JSON.stringify(session)
  if (!safeStorage.isEncryptionAvailable()) {
    // Reject storing sensitive auth data without encryption
    return { error: 'Secure storage is not available' }
  }
  return { encrypted: safeStorage.encryptString(data).toString('base64') }
}

// Decrypt session data from storage
function decryptSession(encrypted: string): AuthSession | null {
  // Require encryption to be available
  if (!safeStorage.isEncryptionAvailable()) {
    return null
  }

  try {
    const buffer = Buffer.from(encrypted, 'base64')
    const data = safeStorage.decryptString(buffer)
    return JSON.parse(data) as AuthSession
  } catch {
    return null
  }
}

// Store session securely
function storeSession(session: AuthSession): boolean {
  const result = encryptSession(session)
  if ('error' in result) {
    console.error('Cannot store session:', result.error)
    return false
  }
  authStore.set('encryptedSession', result.encrypted)
  return true
}

// Retrieve stored session
function getStoredSession(): AuthSession | null {
  const encrypted = authStore.get('encryptedSession')
  if (!encrypted) return null
  return decryptSession(encrypted)
}

// Clear stored session
function clearStoredSession(): void {
  authStore.set('encryptedSession', null)
}

// Convert Supabase user to our User type
function toUser(supabaseUser: { id: string; email?: string; user_metadata?: Record<string, unknown> }): User {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    fullName: supabaseUser.user_metadata?.full_name as string | undefined,
    avatarUrl: supabaseUser.user_metadata?.avatar_url as string | undefined,
  }
}

// Emit auth state change to all windows
function emitAuthStateChange(user: User | null): void {
  const windows = BrowserWindow.getAllWindows()
  for (const window of windows) {
    window.webContents.send('auth:state-change', { user })
  }
}

export function setupAuthHandlers(): void {
  // Sign up with email and password
  ipcMain.handle('auth:signup', async (_, rawEmail: unknown, rawPassword: unknown, rawFullName?: unknown): Promise<{
    success: boolean
    user?: User
    error?: string
  }> => {
    try {
      const email = validateEmail(rawEmail)
      const password = validatePassword(rawPassword)
      const fullName = validateFullName(rawFullName)

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: fullName ? { full_name: fullName } : undefined,
        },
      })

      if (error) {
        return { success: false, error: error.message }
      }

      if (!data.user || !data.session) {
        return { success: false, error: 'Signup failed. Please check your email to confirm your account.' }
      }

      const user = toUser(data.user)
      const session: AuthSession = {
        user,
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresAt: data.session.expires_at || 0,
      }

      storeSession(session)
      emitAuthStateChange(user)

      return { success: true, user }
    } catch (err) {
      if (err instanceof ValidationError) {
        return { success: false, error: err.message }
      }
      return { success: false, error: 'Signup failed' }
    }
  })

  // Sign in with email and password
  ipcMain.handle('auth:signin', async (_, rawEmail: unknown, rawPassword: unknown): Promise<{
    success: boolean
    user?: User
    error?: string
  }> => {
    try {
      const email = validateEmail(rawEmail)
      const password = validatePassword(rawPassword)

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { success: false, error: error.message }
      }

      if (!data.user || !data.session) {
        return { success: false, error: 'Sign in failed' }
      }

      const user = toUser(data.user)
      const session: AuthSession = {
        user,
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresAt: data.session.expires_at || 0,
      }

      storeSession(session)
      emitAuthStateChange(user)

      return { success: true, user }
    } catch (err) {
      if (err instanceof ValidationError) {
        return { success: false, error: err.message }
      }
      return { success: false, error: 'Sign in failed' }
    }
  })

  // Sign out
  ipcMain.handle('auth:signout', async (): Promise<{ success: boolean; error?: string }> => {
    try {
      await supabase.auth.signOut()
      clearStoredSession()
      emitAuthStateChange(null)
      return { success: true }
    } catch {
      // Clear local session even if remote signout fails
      clearStoredSession()
      emitAuthStateChange(null)
      return { success: true }
    }
  })

  // Get current session
  ipcMain.handle('auth:get-session', async (): Promise<{
    user: User | null
    isAuthenticated: boolean
  }> => {
    const stored = getStoredSession()

    if (!stored) {
      return { user: null, isAuthenticated: false }
    }

    // Check if token is expired
    const now = Math.floor(Date.now() / 1000)
    if (stored.expiresAt && stored.expiresAt < now) {
      // Try to refresh the token
      try {
        const { data, error } = await supabase.auth.refreshSession({
          refresh_token: stored.refreshToken,
        })

        if (error || !data.session) {
          clearStoredSession()
          return { user: null, isAuthenticated: false }
        }

        const user = toUser(data.user!)
        const session: AuthSession = {
          user,
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
          expiresAt: data.session.expires_at || 0,
        }

        storeSession(session)
        return { user, isAuthenticated: true }
      } catch {
        clearStoredSession()
        return { user: null, isAuthenticated: false }
      }
    }

    return { user: stored.user, isAuthenticated: true }
  })

  // Refresh session
  ipcMain.handle('auth:refresh', async (): Promise<{
    success: boolean
    user?: User
    error?: string
  }> => {
    const stored = getStoredSession()

    if (!stored) {
      return { success: false, error: 'No session to refresh' }
    }

    try {
      const { data, error } = await supabase.auth.refreshSession({
        refresh_token: stored.refreshToken,
      })

      if (error || !data.session) {
        clearStoredSession()
        return { success: false, error: error?.message || 'Session refresh failed' }
      }

      const user = toUser(data.user!)
      const session: AuthSession = {
        user,
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresAt: data.session.expires_at || 0,
      }

      storeSession(session)
      emitAuthStateChange(user)

      return { success: true, user }
    } catch {
      clearStoredSession()
      return { success: false, error: 'Session refresh failed' }
    }
  })

  // Reset password (send email)
  ipcMain.handle('auth:reset-password', async (_, rawEmail: unknown): Promise<{
    success: boolean
    error?: string
  }> => {
    try {
      const email = validateEmail(rawEmail)

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'tusk://reset-password', // Deep link for desktop app
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (err) {
      if (err instanceof ValidationError) {
        return { success: false, error: err.message }
      }
      return { success: false, error: 'Password reset failed' }
    }
  })

  // Skip auth (continue without account - free tier only)
  ipcMain.handle('auth:skip', async (): Promise<{ success: boolean }> => {
    clearStoredSession()
    emitAuthStateChange(null)
    return { success: true }
  })

  // Send magic link (passwordless sign in)
  ipcMain.handle('auth:send-magic-link', async (_, rawEmail: unknown): Promise<{
    success: boolean
    error?: string
  }> => {
    try {
      const email = validateEmail(rawEmail)

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: 'tusk://auth/callback',
        },
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (err) {
      if (err instanceof ValidationError) {
        return { success: false, error: err.message }
      }
      return { success: false, error: 'Failed to send magic link' }
    }
  })
}

// Validate deep link URL for security
function isValidDeepLink(url: string): { valid: boolean; urlObj?: URL; error?: string } {
  try {
    const urlObj = new URL(url)

    // Must use our protocol
    if (urlObj.protocol !== 'tusk:') {
      return { valid: false, error: 'Invalid protocol' }
    }

    // Only allow specific known paths
    const allowedPaths = ['/auth/callback', '/reset-password']
    const path = urlObj.pathname || urlObj.hostname // URL parsing quirk with custom protocols

    // Normalize path - handle both tusk://auth/callback and tusk:auth/callback formats
    const normalizedPath = path.startsWith('/') ? path : `/${path}`

    if (!allowedPaths.some(p => normalizedPath.startsWith(p))) {
      return { valid: false, error: 'Unknown deep link path' }
    }

    return { valid: true, urlObj }
  } catch {
    return { valid: false, error: 'Invalid URL format' }
  }
}

// Handle deep link callback from magic link
export async function handleAuthDeepLink(url: string): Promise<void> {
  try {
    // Validate the deep link URL
    const validation = isValidDeepLink(url)
    if (!validation.valid || !validation.urlObj) {
      console.error('Invalid deep link:', validation.error)
      return
    }

    const urlObj = validation.urlObj

    // Supabase puts tokens in the hash fragment
    const hashParams = new URLSearchParams(urlObj.hash.substring(1))
    const accessToken = hashParams.get('access_token')
    const refreshToken = hashParams.get('refresh_token')

    if (!accessToken || !refreshToken) {
      console.error('Missing tokens in auth callback URL')
      return
    }

    // Set the session in Supabase
    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    })

    if (error || !data.session || !data.user) {
      console.error('Failed to set session from magic link:', error)
      return
    }

    // Store session securely
    const user = toUser(data.user)
    const session: AuthSession = {
      user,
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresAt: data.session.expires_at || 0,
    }

    storeSession(session)
    emitAuthStateChange(user)

    // Focus the main window
    if (getMainWindowFn) {
      const mainWindow = getMainWindowFn()
      if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore()
        mainWindow.focus()
      }
    }
  } catch (err) {
    console.error('Error handling auth deep link:', err)
  }
}
