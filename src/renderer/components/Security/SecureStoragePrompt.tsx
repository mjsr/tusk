import { useState } from 'react'

interface SecureStoragePromptProps {
  onAccept: () => void
  onDecline?: () => void
}

export function SecureStoragePrompt({ onAccept, onDecline }: SecureStoragePromptProps): JSX.Element {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return <></>

  const handleAccept = () => {
    setIsVisible(false)
    onAccept()
  }

  const handleDecline = () => {
    setIsVisible(false)
    onDecline?.()
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-db-darker border border-db-border rounded-xl max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-db-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-db-accent/20 rounded-full flex items-center justify-center">
              <svg
                className="w-5 h-5 text-db-accent"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-db-text">Secure Storage</h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-db-text">
            Tusk uses your Mac's Keychain to securely encrypt sensitive data like database passwords.
          </p>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-db-success shrink-0 mt-0.5"
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
              <span className="text-db-muted">Your passwords never leave your computer</span>
            </div>
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-db-success shrink-0 mt-0.5"
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
              <span className="text-db-muted">Tusk cannot access other apps' data</span>
            </div>
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-db-success shrink-0 mt-0.5"
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
              <span className="text-db-muted">Only Tusk can decrypt Tusk's data</span>
            </div>
          </div>

          <div className="bg-db-dark/50 border border-db-border rounded-lg p-4 mt-4">
            <p className="text-sm text-db-muted">
              <span className="text-db-text font-medium">Next step:</span> macOS will ask you to allow Tusk to access its Keychain storage. This is normal and safe to approve.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-db-border flex gap-3 justify-end">
          {onDecline && (
            <button
              onClick={handleDecline}
              className="px-4 py-2 text-db-muted hover:text-db-text transition-colors"
            >
              Not now
            </button>
          )}
          <button
            onClick={handleAccept}
            className="px-6 py-2 bg-db-accent hover:bg-db-accent/80 text-white rounded-lg font-medium transition-colors"
          >
            Got it, continue
          </button>
        </div>
      </div>
    </div>
  )
}
