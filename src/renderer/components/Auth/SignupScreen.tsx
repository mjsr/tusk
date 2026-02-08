import { useState, FormEvent } from 'react'
import { useAuth } from '../../contexts/AuthContext'

interface SignupScreenProps {
  onSwitchToLogin: () => void
}

export function SignupScreen({ onSwitchToLogin }: SignupScreenProps) {
  const { signUp, error, clearError } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLocalError(null)

    if (!email || !password) return

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match')
      return
    }

    if (password.length < 8) {
      setLocalError('Password must be at least 8 characters')
      return
    }

    setIsSubmitting(true)
    try {
      await signUp(email, password, fullName || undefined)
    } finally {
      setIsSubmitting(false)
    }
  }

  const displayError = localError || error

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
            <h1 className="text-2xl font-bold text-db-text">Create your account</h1>
            <p className="text-db-muted mt-2">Get started with Tusk</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {displayError && (
              <div className="bg-db-error/10 border border-db-error/30 rounded-lg p-3">
                <p className="text-sm text-db-error">{displayError}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-db-text-muted mb-1">
                Name <span className="text-db-muted">(optional)</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 bg-db-elevated border border-db-border rounded-lg text-db-text placeholder-db-muted focus:outline-none focus:ring-2 focus:ring-db-accent/50 focus:border-db-accent transition-colors"
                placeholder="Your name"
                autoFocus
                disabled={isSubmitting}
              />
            </div>

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
                  setLocalError(null)
                }}
                className="w-full px-3 py-2 bg-db-elevated border border-db-border rounded-lg text-db-text placeholder-db-muted focus:outline-none focus:ring-2 focus:ring-db-accent/50 focus:border-db-accent transition-colors"
                placeholder="you@example.com"
                disabled={isSubmitting}
                required
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
                  setLocalError(null)
                }}
                className="w-full px-3 py-2 bg-db-elevated border border-db-border rounded-lg text-db-text placeholder-db-muted focus:outline-none focus:ring-2 focus:ring-db-accent/50 focus:border-db-accent transition-colors"
                placeholder="At least 8 characters"
                disabled={isSubmitting}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-db-text-muted mb-1">
                Confirm password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value)
                  setLocalError(null)
                }}
                className="w-full px-3 py-2 bg-db-elevated border border-db-border rounded-lg text-db-text placeholder-db-muted focus:outline-none focus:ring-2 focus:ring-db-accent/50 focus:border-db-accent transition-colors"
                placeholder="Confirm your password"
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="text-xs text-db-muted">
              By creating an account, you agree to our Terms of Service and Privacy Policy.
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !email || !password || !confirmPassword}
              className="w-full py-2.5 bg-db-accent hover:bg-db-accent/80 disabled:bg-db-accent/50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
            >
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          {/* Links */}
          <div className="mt-6 text-center">
            <div className="text-sm text-db-muted">
              Already have an account?{' '}
              <button
                onClick={onSwitchToLogin}
                className="text-db-accent hover:text-db-accent/80 transition-colors"
              >
                Sign in
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
