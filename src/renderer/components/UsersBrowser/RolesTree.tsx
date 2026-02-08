import { useState } from 'react'
import type { DatabaseRole } from '../../../shared/types'

type RoleFilter = 'all' | 'login' | 'group'

interface Props {
  roles: DatabaseRole[]
  selectedRole: DatabaseRole | null
  onRoleSelect: (role: DatabaseRole) => void
}

export default function RolesTree({ roles, selectedRole, onRoleSelect }: Props) {
  const [filter, setFilter] = useState<RoleFilter>('all')
  const [search, setSearch] = useState('')

  const filteredRoles = roles.filter(role => {
    if (filter === 'login' && !role.canLogin) return false
    if (filter === 'group' && role.canLogin) return false
    if (search && !role.name.toLowerCase().includes(search.toLowerCase())) {
      return false
    }
    return true
  })

  return (
    <div className="h-full flex flex-col">
      {/* Filter tabs */}
      <div className="flex gap-1 p-3 border-b border-db-border">
        <FilterPill active={filter === 'all'} onClick={() => setFilter('all')}>
          All <span className="text-db-text-muted ml-1">{roles.length}</span>
        </FilterPill>
        <FilterPill active={filter === 'login'} onClick={() => setFilter('login')}>
          Login <span className="text-db-text-muted ml-1">{roles.filter(r => r.canLogin).length}</span>
        </FilterPill>
        <FilterPill active={filter === 'group'} onClick={() => setFilter('group')}>
          Groups <span className="text-db-text-muted ml-1">{roles.filter(r => !r.canLogin).length}</span>
        </FilterPill>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-db-border">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-db-text-muted"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search roles..."
            className="w-full pl-10 pr-3 py-2.5 text-sm bg-db-surface border border-db-border rounded-lg text-db-text placeholder-db-text-muted focus:outline-none focus:border-db-accent focus:ring-1 focus:ring-db-accent/50 transition-all"
          />
        </div>
      </div>

      {/* Roles list */}
      <div className="flex-1 overflow-auto p-2">
        {filteredRoles.length === 0 ? (
          <div className="p-8 text-center text-db-text-muted text-sm">
            No roles found
          </div>
        ) : (
          <div className="space-y-1">
            {filteredRoles.map((role) => (
              <RoleItem
                key={role.oid}
                role={role}
                isSelected={selectedRole?.oid === role.oid}
                onClick={() => onRoleSelect(role)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function FilterPill({ active, onClick, children }: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
        active
          ? 'bg-db-accent text-white'
          : 'bg-db-surface text-db-text-muted hover:text-db-text hover:bg-db-elevated'
      }`}
    >
      {children}
    </button>
  )
}

function RoleItem({ role, isSelected, onClick }: {
  role: DatabaseRole
  isSelected: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3.5 rounded-lg transition-all ${
        isSelected
          ? 'bg-db-accent/10 border border-db-accent/30'
          : 'hover:bg-db-elevated border border-transparent'
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Icon */}
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
          role.isSuperuser
            ? 'bg-gradient-to-br from-db-warning/20 to-orange-500/20'
            : role.canLogin
              ? 'bg-gradient-to-br from-db-accent/20 to-blue-500/20'
              : 'bg-db-elevated'
        }`}>
          {role.isSuperuser ? (
            <svg className="w-5 h-5 text-db-warning" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
            </svg>
          ) : role.canLogin ? (
            <svg className="w-5 h-5 text-db-accent" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-db-text-muted" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
            </svg>
          )}
        </div>

        {/* Name and info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-db-text truncate">
              {role.name}
            </span>
            {role.isSuperuser && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-db-warning/20 text-db-warning font-semibold uppercase tracking-wide">
                Super
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            {role.canLogin && (
              <span className="text-xs text-db-text-muted flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-db-success"></span>
                Can login
              </span>
            )}
            {role.canCreateDb && (
              <span className="text-xs text-db-text-muted">CreateDB</span>
            )}
            {role.canCreateRole && (
              <span className="text-xs text-db-text-muted">CreateRole</span>
            )}
            {!role.canLogin && !role.canCreateDb && !role.canCreateRole && (
              <span className="text-xs text-db-text-muted">Group role</span>
            )}
          </div>
        </div>

        {/* Arrow */}
        <svg className={`w-4 h-4 transition-colors ${isSelected ? 'text-db-accent' : 'text-db-text-muted'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </div>
    </button>
  )
}
