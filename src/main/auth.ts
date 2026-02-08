import { ipcMain, safeStorage, BrowserWindow } from 'electron'
import Store from 'electron-store'
import { supabase } from './supabase'
import { validateEmail, validatePassword, validateFullName, ValidationError } from './validation'
import type { User, AuthSession } from '../shared/types'

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
function encryptSession(session: AuthSession): string {
  const data = JSON.stringify(session)
  if (safeStorage.isEncryptionAvailable()) {
    return safeStorage.encryptString(data).toString('base64')
  }
  // Fallback to base64 (not ideal but better than plaintext)
  return Buffer.from(data).toString('base64')
}

// Decrypt session data from storage
function decryptSession(encrypted: string): AuthSession | null {
  try {
    const buffer = Buffer.from(encrypted, 'base64')
    let data: string
    if (safeStorage.isEncryptionAvailable()) {
      data = safeStorage.decryptString(buffer)
    } else {
      data = buffer.toString()
    }
    return JSON.parse(data) as AuthSession
  } catch {
    return null
  }
}

// Store session securely
function storeSession(session: AuthSession): void {
  const encrypted = encryptSession(session)
  authStore.set('encryptedSession', encrypted)
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
}
