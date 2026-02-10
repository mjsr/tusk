import { useState, FormEvent } from 'react'
import { useAuth } from '../../contexts/AuthContext'

interface LoginScreenProps {
  onSwitchToSignup: () => void
  onSwitchToForgotPassword: () => void
}

type LoginMode = 'magic-link' | 'password'

export function LoginScreen({ onSwitchToSignup, onSwitchToForgotPassword }: LoginScreenProps) {
  const { signIn, sendMagicLink, skipAuth, error, clearError } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loginMode, setLoginMode] = useState<LoginMode>('magic-link')
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!email) return
    if (loginMode === 'password' && !password) return

    setIsSubmitting(true)
    try {
      if (loginMode === 'magic-link') {
        const result = await sendMagicLink(email)
        if (result.success) {
          setMagicLinkSent(true)
        }
      } else {
        await signIn(email, password)
      }
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
      <div
        className="h-10 flex-shrink-0 bg-db-surface/50"
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      />

      {/* Background gradient decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-db-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="flex-1 flex items-center justify-center p-6 relative">
        <div className="w-full max-w-[420px]">
          {/* Card container */}
          <div className="bg-db-surface/80 backdrop-blur-xl border border-db-border/50 rounded-2xl shadow-2xl shadow-black/20 p-8">
            {/* Logo/Header */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-db-accent to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-db-accent/20">
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-semibold text-db-text tracking-tight">Welcome to Tusk</h1>
              <p className="text-db-text-muted mt-2 text-sm">Sign in to access your databases</p>
            </div>

            {/* Magic Link Sent State */}
            {magicLinkSent ? (
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-db-success/10 border border-db-success/20 rounded-full flex items-center justify-center mx-auto mb-5">
                  <svg className="w-8 h-8 text-db-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-db-text mb-2">Check your email</h2>
                <p className="text-db-text-muted mb-2 text-sm">
                  We sent a magic link to
                </p>
                <p className="text-db-text font-medium mb-6">{email}</p>
                <p className="text-sm text-db-text-muted mb-6">
                  Click the link in the email to sign in.
                </p>
                <button
                  onClick={() => {
                    setMagicLinkSent(false)
                    setEmail('')
                  }}
                  className="text-sm text-db-accent hover:text-db-accent-hover transition-colors"
                >
                  Use a different email
                </button>
              </div>
            ) : (
              <>
                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  {error && (
                    <div className="bg-db-error/10 border border-db-error/20 rounded-xl p-4">
                      <p className="text-sm text-db-error">{error}</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-db-text mb-2">
                      Email address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        if (error) clearError()
                      }}
                      className="w-full h-12 px-4 bg-db-elevated/50 border border-db-border rounded-xl text-db-text placeholder-db-text-muted focus:outline-none focus:ring-2 focus:ring-db-accent/40 focus:border-db-accent transition-all"
                      placeholder="you@example.com"
                      autoFocus
                      disabled={isSubmitting}
                    />
                  </div>

                  {loginMode === 'password' && (
                    <div>
                      <label className="block text-sm font-medium text-db-text mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value)
                            if (error) clearError()
                          }}
                          className="w-full h-12 px-4 pr-12 bg-db-elevated/50 border border-db-border rounded-xl text-db-text placeholder-db-text-muted focus:outline-none focus:ring-2 focus:ring-db-accent/40 focus:border-db-accent transition-all"
                          placeholder="Enter your password"
                          disabled={isSubmitting}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-db-text-muted hover:text-db-text rounded-lg hover:bg-db-border/30 transition-colors"
                          tabIndex={-1}
                        >
                          {showPassword ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting || !email || (loginMode === 'password' && !password)}
                    className="w-full h-12 bg-gradient-to-r from-db-accent to-blue-500 hover:from-db-accent-hover hover:to-blue-400 disabled:from-db-accent/50 disabled:to-blue-500/50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all shadow-lg shadow-db-accent/20 hover:shadow-db-accent/30"
                  >
                    {isSubmitting
                      ? (loginMode === 'magic-link' ? 'Sending link...' : 'Signing in...')
                      : (loginMode === 'magic-link' ? 'Send magic link' : 'Sign in')
                    }
                  </button>
                </form>

                {/* Toggle login mode */}
                <div className="mt-5 text-center">
                  <button
                    onClick={() => {
                      setLoginMode(loginMode === 'magic-link' ? 'password' : 'magic-link')
                      clearError()
                    }}
                    className="text-sm text-db-text-muted hover:text-db-text transition-colors"
                  >
                    {loginMode === 'magic-link' ? 'Sign in with password instead' : 'Sign in with magic link instead'}
                  </button>
                </div>

                {/* Links */}
                {loginMode === 'password' && (
                  <div className="mt-4 text-center">
                    <button
                      onClick={onSwitchToForgotPassword}
                      className="text-sm text-db-text-muted hover:text-db-text transition-colors"
                    >
                      Forgot your password?
                    </button>
                  </div>
                )}

                {/* Divider */}
                <div className="flex items-center gap-4 my-6">
                  <div className="flex-1 h-px bg-db-border" />
                  <span className="text-xs text-db-text-muted uppercase tracking-wider">or</span>
                  <div className="flex-1 h-px bg-db-border" />
                </div>

                {/* Skip option */}
                <button
                  onClick={handleSkip}
                  className="w-full h-11 text-db-text-muted hover:text-db-text border border-db-border hover:border-db-text-muted/30 hover:bg-db-elevated/30 rounded-xl transition-all text-sm font-medium"
                >
                  Continue without account
                </button>
                <p className="text-xs text-db-text-faint text-center mt-3">
                  Free tier features only. Sign in later to unlock more.
                </p>
              </>
            )}
          </div>

          {/* Create account link - outside card */}
          {!magicLinkSent && (
            <div className="text-center mt-6">
              <span className="text-sm text-db-text-muted">
                Don't have an account?{' '}
              </span>
              <button
                onClick={onSwitchToSignup}
                className="text-sm text-db-accent hover:text-db-accent-hover font-medium transition-colors"
              >
                Create account
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
