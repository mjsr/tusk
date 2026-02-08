import { useState, FormEvent } from 'react'
import { useAuth } from '../../contexts/AuthContext'

interface LoginScreenProps {
  onSwitchToSignup: () => void
  onSwitchToForgotPassword: () => void
}

export function LoginScreen({ onSwitchToSignup, onSwitchToForgotPassword }: LoginScreenProps) {
  const { signIn, skipAuth, error, clearError } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!email || !password) return

    setIsSubmitting(true)
    try {
      await signIn(email, password)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSkip = async () => {
    await skipAuth()
  }

  return (
    <div className="min-h-screen bg-db-bg flex flex-col">
      {/* Draggable title bar area */}
      <div className="h-8 flex-shrink-0" style={{ WebkitAppRegion: 'drag' } as React.CSSProperties} />

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-db-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-db-accent"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-db-text">Welcome to Tusk</h1>
            <p className="text-db-muted mt-2">Sign in to your account</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-db-error/10 border border-db-error/30 rounded-lg p-3">
                <p className="text-sm text-db-error">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-db-text-muted mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (error) clearError()
                }}
                className="w-full px-3 py-2 bg-db-elevated border border-db-border rounded-lg text-db-text placeholder-db-muted focus:outline-none focus:ring-2 focus:ring-db-accent/50 focus:border-db-accent transition-colors"
                placeholder="you@example.com"
                autoFocus
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-db-text-muted mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (error) clearError()
                }}
                className="w-full px-3 py-2 bg-db-elevated border border-db-border rounded-lg text-db-text placeholder-db-muted focus:outline-none focus:ring-2 focus:ring-db-accent/50 focus:border-db-accent transition-colors"
                placeholder="Enter your password"
                disabled={isSubmitting}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !email || !password}
              className="w-full py-2.5 bg-db-accent hover:bg-db-accent/80 disabled:bg-db-accent/50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
            >
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          {/* Links */}
          <div className="mt-6 text-center space-y-3">
            <button
              onClick={onSwitchToForgotPassword}
              className="text-sm text-db-muted hover:text-db-text transition-colors"
            >
              Forgot your password?
            </button>

            <div className="text-sm text-db-muted">
              Don't have an account?{' '}
              <button
                onClick={onSwitchToSignup}
                className="text-db-accent hover:text-db-accent/80 transition-colors"
              >
                Create account
              </button>
            </div>
          </div>

          {/* Skip option */}
          <div className="mt-8 pt-6 border-t border-db-border">
            <button
              onClick={handleSkip}
              className="w-full py-2 text-db-muted hover:text-db-text border border-db-border hover:border-db-text/30 rounded-lg transition-colors"
            >
              Continue without account
            </button>
            <p className="text-xs text-db-muted text-center mt-2">
              Free tier features only. Sign in later to unlock more.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
