import { useState } from 'react'
import ConnectionManager from './components/ConnectionManager/ConnectionManager'
import Layout from './components/Layout/Layout'
import { LoginScreen, SignupScreen, ForgotPasswordScreen } from './components/Auth'
import { ThemeProvider } from './contexts/ThemeContext'
import { LicenseProvider } from './contexts/LicenseContext'
import { AuthProvider, useAuth, AuthScreen } from './contexts/AuthContext'
import { SchemaProvider } from './contexts/SchemaContext'

function AuthGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  const [authScreen, setAuthScreen] = useState<AuthScreen>('login')

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-db-bg flex flex-col">
        <div className="h-8 flex-shrink-0" style={{ WebkitAppRegion: 'drag' } as React.CSSProperties} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-2 border-db-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-db-muted">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  // Show auth screens if not authenticated
  if (!isAuthenticated) {
    switch (authScreen) {
      case 'signup':
        return <SignupScreen onSwitchToLogin={() => setAuthScreen('login')} />
      case 'forgot-password':
        return <ForgotPasswordScreen onSwitchToLogin={() => setAuthScreen('login')} />
      default:
        return (
          <LoginScreen
            onSwitchToSignup={() => setAuthScreen('signup')}
            onSwitchToForgotPassword={() => setAuthScreen('forgot-password')}
          />
        )
    }
  }

  // User is authenticated, show main app
  return <>{children}</>
}

function MainApp() {
  const [isConnected, setIsConnected] = useState(false)
  const [connectionName, setConnectionName] = useState<string>('')

  const handleConnect = (name: string) => {
    setConnectionName(name)
    setIsConnected(true)
  }

  const handleDisconnect = async () => {
    await window.api.disconnect()
    setIsConnected(false)
    setConnectionName('')
  }

  return (
    <>
      {!isConnected ? (
        <ConnectionManager onConnect={handleConnect} />
      ) : (
        <SchemaProvider>
          <Layout connectionName={connectionName} onDisconnect={handleDisconnect} />
        </SchemaProvider>
      )}
    </>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <LicenseProvider>
        <AuthProvider>
          <AuthGate>
            <MainApp />
          </AuthGate>
        </AuthProvider>
      </LicenseProvider>
    </ThemeProvider>
  )
}
