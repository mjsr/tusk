import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import type { User } from '../../shared/types'

export type AuthScreen = 'login' | 'signup' | 'forgot-password'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  authSkipped: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signUp: (email: string, password: string, fullName?: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>
  sendMagicLink: (email: string) => Promise<{ success: boolean; error?: string }>
  skipAuth: () => Promise<void>
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [authSkipped, setAuthSkipped] = useState(false)

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Check if auth was previously skipped
        const skipped = localStorage.getItem('tusk-auth-skipped') === 'true'
        if (skipped) {
          setAuthSkipped(true)
          setIsLoading(false)
          return
        }

        const result = await window.api.authGetSession()
        if (result.isAuthenticated && result.user) {
          setUser(result.user)
        }
      } catch (err) {
        console.error('Failed to check session:', err)
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()

    // Listen for auth state changes from main process
    const unsubscribe = window.api.onAuthStateChange((event) => {
      setUser(event.user)
    })

    return () => {
      unsubscribe()
    }
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    setError(null)
    try {
      const result = await window.api.authSignIn(email, password)
      if (result.success && result.user) {
        setUser(result.user)
        setAuthSkipped(false)
        localStorage.removeItem('tusk-auth-skipped')
        return { success: true }
      }
      const errorMsg = result.error || 'Sign in failed'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign in failed'
      setError(message)
      return { success: false, error: message }
    }
  }, [])

  const signUp = useCallback(async (email: string, password: string, fullName?: string) => {
    setError(null)
    try {
      const result = await window.api.authSignUp(email, password, fullName)
      if (result.success && result.user) {
        setUser(result.user)
        setAuthSkipped(false)
        localStorage.removeItem('tusk-auth-skipped')
        return { success: true }
      }
      const errorMsg = result.error || 'Sign up failed'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign up failed'
      setError(message)
      return { success: false, error: message }
    }
  }, [])

  const signOut = useCallback(async () => {
    try {
      await window.api.authSignOut()
      setUser(null)
      setAuthSkipped(false)
      localStorage.removeItem('tusk-auth-skipped')
      setError(null)
    } catch (err) {
      console.error('Sign out failed:', err)
    }
  }, [])

  const resetPassword = useCallback(async (email: string) => {
    setError(null)
    try {
      const result = await window.api.authResetPassword(email)
      if (result.success) {
        return { success: true }
      }
      const errorMsg = result.error || 'Password reset failed'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Password reset failed'
      setError(message)
      return { success: false, error: message }
    }
  }, [])

  const sendMagicLink = useCallback(async (email: string) => {
    setError(null)
    try {
      const result = await window.api.authSendMagicLink(email)
      if (result.success) {
        return { success: true }
      }
      const errorMsg = result.error || 'Failed to send magic link'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send magic link'
      setError(message)
      return { success: false, error: message }
    }
  }, [])

  const skipAuth = useCallback(async () => {
    try {
      await window.api.authSkip()
      setAuthSkipped(true)
      localStorage.setItem('tusk-auth-skipped', 'true')
      setError(null)
    } catch (err) {
      console.error('Skip auth failed:', err)
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const isAuthenticated = user !== null || authSkipped

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        error,
        authSkipped,
        signIn,
        signUp,
        signOut,
        resetPassword,
        sendMagicLink,
        skipAuth,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
