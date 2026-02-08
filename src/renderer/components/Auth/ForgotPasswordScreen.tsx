import { useState, FormEvent } from 'react'
import { useAuth } from '../../contexts/AuthContext'

interface ForgotPasswordScreenProps {
  onSwitchToLogin: () => void
}

export function ForgotPasswordScreen({ onSwitchToLogin }: ForgotPasswordScreenProps) {
  const { resetPassword, error, clearError } = useAuth()
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsSubmitting(true)
    try {
      const result = await resetPassword(email)
      if (result.success) {
        setIsSuccess(true)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-db-bg flex flex-col">
        {/* Draggable title bar area */}
        <div className="h-8 flex-shrink-0" style={{ WebkitAppRegion: 'drag' } as React.CSSProperties} />

        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md text-center">
            <div className="w-16 h-16 bg-db-success/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-db-success"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-db-text">Check your email</h1>
            <p className="text-db-muted mt-2">
              We've sent a password reset link to <span className="text-db-text">{email}</span>
            </p>
            <button
              onClick={onSwitchToLogin}
              className="mt-6 px-6 py-2.5 bg-db-accent hover:bg-db-accent/80 text-white rounded-lg font-medium transition-colors"
            >
              Back to sign in
            </button>
          </div>
        </div>
      </div>
    )
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
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-db-text">Reset your password</h1>
            <p className="text-db-muted mt-2">
              Enter your email and we'll send you a reset link
            </p>
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
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !email}
              className="w-full py-2.5 bg-db-accent hover:bg-db-accent/80 disabled:bg-db-accent/50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
            >
              {isSubmitting ? 'Sending...' : 'Send reset link'}
            </button>
          </form>

          {/* Links */}
          <div className="mt-6 text-center">
            <button
              onClick={onSwitchToLogin}
              className="text-sm text-db-muted hover:text-db-text transition-colors inline-flex items-center gap-1"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
