import { useState, useEffect } from 'react'
import { FeatureGate } from '../../contexts/LicenseContext'
import { UpgradePrompt } from '../License/UpgradePrompt'
import RolesTree from './RolesTree'
import RoleDetails from './RoleDetails'
import type { DatabaseRole } from '../../../shared/types'

export default function UsersBrowser() {
  const [roles, setRoles] = useState<DatabaseRole[]>([])
  const [selectedRole, setSelectedRole] = useState<DatabaseRole | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadRoles()
  }, [])

  const loadRoles = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await window.api.getRoles()
      setRoles(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load roles')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRoleSelect = (role: DatabaseRole) => {
    setSelectedRole(role)
  }

  const handleCloseDetails = () => {
    setSelectedRole(null)
  }

  return (
    <FeatureGate
      feature="users_permissions"
      fallback={<UpgradePrompt feature="users_permissions" />}
    >
      <div className="h-full flex flex-col bg-db-darker">
        {/* Header */}
        <div className="flex items-center gap-2 px-3 py-2 border-b border-db-border bg-db-elevated">
          <svg className="w-4 h-4 text-db-text-muted" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
          <span className="text-xs font-medium text-db-text-secondary uppercase tracking-wide">
            Users & Permissions
          </span>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex items-center gap-2 text-db-text-muted">
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="text-sm">Loading roles...</span>
            </div>
          </div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center p-4">
              <p className="text-db-error text-sm">{error}</p>
              <button
                onClick={loadRoles}
                className="mt-2 text-xs text-db-accent hover:text-db-accent/80"
              >
                Try again
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex overflow-hidden">
            {/* Roles tree panel */}
            <div className={`overflow-auto ${selectedRole ? 'w-1/2' : 'w-full'}`}>
              <RolesTree
                roles={roles}
                selectedRole={selectedRole}
                onRoleSelect={handleRoleSelect}
              />
            </div>

            {/* Role details panel */}
            {selectedRole && (
              <div className="w-1/2 overflow-hidden">
                <RoleDetails
                  role={selectedRole}
                  onClose={handleCloseDetails}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </FeatureGate>
  )
}
