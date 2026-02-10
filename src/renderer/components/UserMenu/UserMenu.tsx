import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'

export function UserMenu() {
  const { user, authSkipped, signOut } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const isGuest = authSkipped && !user
  const email = user?.email || ''
  const initials = getInitials(email)

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Close menu on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  const handleSignOut = async () => {
    setIsOpen(false)
    await signOut()
  }

  return (
    <div className="relative" ref={menuRef}>
      {/* Avatar button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          relative flex items-center justify-center w-8 h-8 rounded-full
          transition-all duration-150
          ${isGuest
            ? 'bg-db-elevated border border-db-border text-db-text-muted hover:border-db-text-muted/50'
            : 'bg-gradient-to-br from-db-accent to-purple-500 text-white shadow-md shadow-db-accent/20 hover:shadow-lg hover:shadow-db-accent/30'
          }
        `}
        title={isGuest ? 'Guest' : email}
      >
        {isGuest ? (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        ) : (
          <span className="text-xs font-semibold">{initials}</span>
        )}

        {/* Status indicator */}
        <span
          className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-db-surface ${
            isGuest ? 'bg-db-text-muted' : 'bg-db-success'
          }`}
        />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-db-surface border border-db-border rounded-xl shadow-xl shadow-black/20 overflow-hidden z-50">
          {/* User info header */}
          <div className="px-4 py-3 border-b border-db-border bg-db-elevated/50">
            <div className="flex items-center gap-3">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  isGuest
                    ? 'bg-db-border text-db-text-muted'
                    : 'bg-gradient-to-br from-db-accent to-purple-500 text-white'
                }`}
              >
                {isGuest ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                ) : (
                  <span className="text-sm font-semibold">{initials}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-db-text truncate">
                  {isGuest ? 'Guest' : user?.fullName || email.split('@')[0]}
                </p>
                {!isGuest && (
                  <p className="text-xs text-db-text-muted truncate">{email}</p>
                )}
                {isGuest && (
                  <p className="text-xs text-db-text-muted">Free tier</p>
                )}
              </div>
            </div>
          </div>

          {/* Menu items */}
          <div className="py-1">
            {isGuest ? (
              <>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-db-accent hover:bg-db-accent/10 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  <span className="font-medium">Sign in to unlock features</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setIsOpen(false)
                    // TODO: Open settings
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-db-text hover:bg-db-elevated transition-colors"
                >
                  <svg className="w-4 h-4 text-db-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Settings</span>
                </button>

                <button
                  onClick={() => {
                    setIsOpen(false)
                    // TODO: Open account/billing
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-db-text hover:bg-db-elevated transition-colors"
                >
                  <svg className="w-4 h-4 text-db-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  <span>Account & Billing</span>
                </button>

                <div className="my-1 border-t border-db-border" />

                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-db-text-muted hover:text-db-text hover:bg-db-elevated transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Sign out</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function getInitials(email: string): string {
  if (!email) return '?'

  const name = email.split('@')[0]
  // Handle emails like "john.doe" or "john_doe"
  const parts = name.split(/[._-]/)

  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }

  // Single name, take first two letters
  return name.slice(0, 2).toUpperCase()
}

export default UserMenu
