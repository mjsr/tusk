import { useState, useEffect } from 'react'
import type { DatabaseRole, RoleMembership, TableGrant, SchemaGrant } from '../../../shared/types'

type DetailsTab = 'attributes' | 'memberships' | 'tables' | 'schemas'

interface Props {
  role: DatabaseRole
  onClose: () => void
}

export default function RoleDetails({ role, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<DetailsTab>('attributes')
  const [memberships, setMemberships] = useState<RoleMembership[]>([])
  const [tableGrants, setTableGrants] = useState<TableGrant[]>([])
  const [schemaGrants, setSchemaGrants] = useState<SchemaGrant[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadRoleData()
  }, [role.name])

  const loadRoleData = async () => {
    setIsLoading(true)
    try {
      const [membershipData, tableData, schemaData] = await Promise.all([
        window.api.getRoleMemberships(role.name),
        window.api.getTableGrants(role.name),
        window.api.getSchemaGrants(role.name)
      ])
      setMemberships(membershipData)
      setTableGrants(tableData)
      setSchemaGrants(schemaData)
    } catch (err) {
      console.error('Failed to load role details:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const memberOf = memberships.filter(m => m.memberName === role.name)
  const hasMembers = memberships.filter(m => m.roleName === role.name)

  return (
    <div className="h-full flex flex-col bg-db-surface border-l border-db-border">
      {/* Header */}
      <div className="p-4 bg-db-elevated border-b border-db-border">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
              role.isSuperuser
                ? 'bg-gradient-to-br from-db-warning/20 to-orange-500/20'
                : role.canLogin
                  ? 'bg-gradient-to-br from-db-accent/20 to-blue-500/20'
                  : 'bg-db-surface'
            }`}>
              {role.isSuperuser ? (
                <svg className="w-7 h-7 text-db-warning" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
                </svg>
              ) : (
                <svg className="w-7 h-7 text-db-accent" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-db-text">{role.name}</h3>
              <p className="text-sm text-db-text-muted mt-0.5">
                {role.isSuperuser ? 'Superuser' : role.canLogin ? 'Login Role' : 'Group Role'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-db-surface rounded-lg text-db-text-muted hover:text-db-text transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-4 py-3 border-b border-db-border bg-db-darker">
        <TabButton active={activeTab === 'attributes'} onClick={() => setActiveTab('attributes')}>
          Attributes
        </TabButton>
        <TabButton
          active={activeTab === 'memberships'}
          onClick={() => setActiveTab('memberships')}
          count={memberships.length}
        >
          Memberships
        </TabButton>
        <TabButton
          active={activeTab === 'tables'}
          onClick={() => setActiveTab('tables')}
          count={tableGrants.length}
        >
          Tables
        </TabButton>
        <TabButton
          active={activeTab === 'schemas'}
          onClick={() => setActiveTab('schemas')}
          count={schemaGrants.length}
        >
          Schemas
        </TabButton>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="p-8 flex items-center justify-center">
            <div className="flex items-center gap-3 text-db-text-muted">
              <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="text-sm">Loading details...</span>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'attributes' && <AttributesTab role={role} />}
            {activeTab === 'memberships' && (
              <MembershipsTab memberOf={memberOf} hasMembers={hasMembers} />
            )}
            {activeTab === 'tables' && <TableGrantsTab grants={tableGrants} />}
            {activeTab === 'schemas' && <SchemaGrantsTab grants={schemaGrants} />}
          </>
        )}
      </div>
    </div>
  )
}

function TabButton({ active, onClick, count, children }: {
  active: boolean
  onClick: () => void
  count?: number
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
        active
          ? 'bg-db-accent text-white'
          : 'text-db-text-muted hover:text-db-text hover:bg-db-elevated'
      }`}
    >
      {children}
      {count !== undefined && count > 0 && (
        <span className={`ml-1.5 ${active ? 'text-white/70' : 'text-db-text-faint'}`}>
          {count}
        </span>
      )}
    </button>
  )
}

function AttributesTab({ role }: { role: DatabaseRole }) {
  const attributes = [
    { label: 'Superuser', value: role.isSuperuser, icon: '🛡️' },
    { label: 'Can Login', value: role.canLogin, icon: '🔑' },
    { label: 'Create Database', value: role.canCreateDb, icon: '🗄️' },
    { label: 'Create Role', value: role.canCreateRole, icon: '👤' },
    { label: 'Replication', value: role.hasReplication, icon: '🔄' },
  ]

  return (
    <div className="p-4 space-y-3">
      {/* Boolean attributes */}
      <div className="grid grid-cols-2 gap-3">
        {attributes.map((attr) => (
          <div
            key={attr.label}
            className={`p-4 rounded-xl border transition-colors ${
              attr.value
                ? 'bg-db-success/5 border-db-success/20'
                : 'bg-db-surface border-db-border'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-lg">{attr.icon}</span>
                <span className="text-sm font-medium text-db-text">{attr.label}</span>
              </div>
              <div className={`w-3 h-3 rounded-full ${
                attr.value ? 'bg-db-success' : 'bg-db-border'
              }`} />
            </div>
          </div>
        ))}
      </div>

      {/* Other attributes */}
      <div className="mt-6 space-y-4">
        <div className="p-4 rounded-xl bg-db-elevated border border-db-border">
          <div className="text-xs font-medium text-db-text-muted uppercase tracking-wide mb-2">
            Connection Limit
          </div>
          <div className="text-lg font-semibold text-db-text">
            {role.connectionLimit === -1 ? 'Unlimited' : role.connectionLimit}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-db-elevated border border-db-border">
          <div className="text-xs font-medium text-db-text-muted uppercase tracking-wide mb-2">
            Valid Until
          </div>
          <div className="text-lg font-semibold text-db-text">
            {role.validUntil ? new Date(role.validUntil).toLocaleDateString() : 'Never expires'}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-db-elevated border border-db-border">
          <div className="text-xs font-medium text-db-text-muted uppercase tracking-wide mb-2">
            OID
          </div>
          <div className="text-lg font-mono text-db-text">
            {role.oid}
          </div>
        </div>
      </div>
    </div>
  )
}

function MembershipsTab({ memberOf, hasMembers }: {
  memberOf: RoleMembership[]
  hasMembers: RoleMembership[]
}) {
  if (memberOf.length === 0 && hasMembers.length === 0) {
    return <EmptyState icon="👥" message="No role memberships" />
  }

  return (
    <div className="p-4 space-y-6">
      {memberOf.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-db-text-muted uppercase tracking-wide mb-3 px-1">
            Member Of
          </h4>
          <div className="space-y-2">
            {memberOf.map((m, i) => (
              <div key={i} className="flex items-center gap-3 p-4 bg-db-elevated rounded-xl border border-db-border">
                <div className="w-10 h-10 rounded-xl bg-db-accent/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-db-accent" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <span className="text-sm font-medium text-db-text">{m.roleName}</span>
                </div>
                {m.adminOption && (
                  <span className="text-xs px-2.5 py-1 rounded-full bg-db-warning/10 text-db-warning font-medium">
                    Admin
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {hasMembers.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-db-text-muted uppercase tracking-wide mb-3 px-1">
            Has Members
          </h4>
          <div className="space-y-2">
            {hasMembers.map((m, i) => (
              <div key={i} className="flex items-center gap-3 p-4 bg-db-elevated rounded-xl border border-db-border">
                <div className="w-10 h-10 rounded-xl bg-db-surface flex items-center justify-center">
                  <svg className="w-5 h-5 text-db-text-muted" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <span className="text-sm font-medium text-db-text">{m.memberName}</span>
                </div>
                {m.adminOption && (
                  <span className="text-xs px-2.5 py-1 rounded-full bg-db-warning/10 text-db-warning font-medium">
                    Admin
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function TableGrantsTab({ grants }: { grants: TableGrant[] }) {
  if (grants.length === 0) {
    return <EmptyState icon="📋" message="No table grants" />
  }

  // Group by schema
  const bySchema = grants.reduce((acc, grant) => {
    if (!acc[grant.schemaName]) acc[grant.schemaName] = []
    acc[grant.schemaName].push(grant)
    return acc
  }, {} as Record<string, TableGrant[]>)

  return (
    <div className="p-4 space-y-6">
      {Object.entries(bySchema).map(([schema, schemaGrants]) => (
        <div key={schema}>
          <h4 className="text-xs font-semibold text-db-text-muted uppercase tracking-wide mb-3 px-1 flex items-center gap-2">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3C7.58 3 4 4.79 4 7v10c0 2.21 3.58 4 8 4s8-1.79 8-4V7c0-2.21-3.58-4-8-4z" />
            </svg>
            {schema}
          </h4>
          <div className="space-y-2">
            {schemaGrants.map((grant, i) => (
              <div key={i} className="p-4 bg-db-elevated rounded-xl border border-db-border">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-db-surface flex items-center justify-center">
                    <svg className="w-4 h-4 text-db-text-muted" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3 3h18v18H3V3zm16 16V5H5v14h14z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-db-text">{grant.tableName}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {grant.privileges.map((priv) => (
                    <span
                      key={priv}
                      className="text-xs px-2.5 py-1 rounded-full bg-db-accent/10 text-db-accent font-medium"
                    >
                      {priv}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function SchemaGrantsTab({ grants }: { grants: SchemaGrant[] }) {
  if (grants.length === 0) {
    return <EmptyState icon="🗂️" message="No schema grants" />
  }

  // Group by schema
  const bySchema = grants.reduce((acc, grant) => {
    if (!acc[grant.schemaName]) acc[grant.schemaName] = []
    acc[grant.schemaName].push(grant.privilegeType)
    return acc
  }, {} as Record<string, string[]>)

  return (
    <div className="p-4 space-y-2">
      {Object.entries(bySchema).map(([schema, privileges]) => (
        <div key={schema} className="flex items-center justify-between p-4 bg-db-elevated rounded-xl border border-db-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-db-surface flex items-center justify-center">
              <svg className="w-5 h-5 text-db-text-muted" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3C7.58 3 4 4.79 4 7v10c0 2.21 3.58 4 8 4s8-1.79 8-4V7c0-2.21-3.58-4-8-4zm0 2c3.87 0 6 1.5 6 2s-2.13 2-6 2-6-1.5-6-2 2.13-2 6-2z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-db-text">{schema}</span>
          </div>
          <div className="flex gap-1.5">
            {privileges.map((priv) => (
              <span
                key={priv}
                className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  priv === 'CREATE'
                    ? 'bg-db-warning/10 text-db-warning'
                    : 'bg-db-accent/10 text-db-accent'
                }`}
              >
                {priv}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyState({ icon, message }: { icon: string; message: string }) {
  return (
    <div className="p-12 text-center">
      <div className="text-4xl mb-3">{icon}</div>
      <p className="text-sm text-db-text-muted">{message}</p>
    </div>
  )
}
