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
      <div className="flex items-center justify-between px-4 py-3 bg-db-elevated border-b border-db-border">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded flex items-center justify-center ${
            role.isSuperuser
              ? 'bg-db-warning/20'
              : role.canLogin
                ? 'bg-db-accent/20'
                : 'bg-db-surface'
          }`}>
            {role.isSuperuser ? (
              <svg className="w-4 h-4 text-db-warning" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-db-accent" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            )}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-db-text">{role.name}</h3>
            <p className="text-xs text-db-text-muted">
              {role.isSuperuser ? 'Superuser' : role.canLogin ? 'Login Role' : 'Group Role'}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-db-surface rounded text-db-text-muted hover:text-db-text"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-db-border">
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
          <div className="p-4 flex items-center justify-center">
            <div className="flex items-center gap-2 text-db-text-muted">
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="text-sm">Loading...</span>
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
      className={`px-3 py-2 text-xs font-medium transition-colors relative ${
        active
          ? 'text-db-accent'
          : 'text-db-text-muted hover:text-db-text'
      }`}
    >
      {children}
      {count !== undefined && (
        <span className="ml-1 text-db-text-faint">({count})</span>
      )}
      {active && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-db-accent" />
      )}
    </button>
  )
}

function AttributesTab({ role }: { role: DatabaseRole }) {
  const attributes = [
    { label: 'Superuser', value: role.isSuperuser, type: 'boolean' as const },
    { label: 'Can Login', value: role.canLogin, type: 'boolean' as const },
    { label: 'Create Database', value: role.canCreateDb, type: 'boolean' as const },
    { label: 'Create Role', value: role.canCreateRole, type: 'boolean' as const },
    { label: 'Replication', value: role.hasReplication, type: 'boolean' as const },
    { label: 'Connection Limit', value: role.connectionLimit === -1 ? 'Unlimited' : role.connectionLimit, type: 'text' as const },
    { label: 'Valid Until', value: role.validUntil ? new Date(role.validUntil).toLocaleDateString() : 'Never expires', type: 'text' as const },
    { label: 'OID', value: role.oid, type: 'text' as const },
  ]

  return (
    <div className="divide-y divide-db-border">
      {attributes.map((attr) => (
        <div key={attr.label} className="px-4 py-3 flex items-center justify-between hover:bg-db-elevated/30">
          <span className="text-sm text-db-text-muted">{attr.label}</span>
          {attr.type === 'boolean' ? (
            <span className={`text-xs font-medium px-2 py-0.5 rounded ${
              attr.value
                ? 'bg-db-success/20 text-db-success'
                : 'bg-db-surface text-db-text-muted'
            }`}>
              {attr.value ? 'Yes' : 'No'}
            </span>
          ) : (
            <span className="text-sm text-db-text font-mono">{String(attr.value)}</span>
          )}
        </div>
      ))}
    </div>
  )
}

function MembershipsTab({ memberOf, hasMembers }: {
  memberOf: RoleMembership[]
  hasMembers: RoleMembership[]
}) {
  if (memberOf.length === 0 && hasMembers.length === 0) {
    return <EmptyState>No role memberships</EmptyState>
  }

  return (
    <div className="divide-y divide-db-border">
      {memberOf.length > 0 && (
        <div className="p-4">
          <h4 className="text-xs font-medium text-db-text-muted uppercase tracking-wide mb-2">
            Member Of
          </h4>
          <div className="space-y-1.5">
            {memberOf.map((m, i) => (
              <div key={i} className="flex items-center gap-2 px-2 py-1.5 bg-db-elevated rounded">
                <svg className="w-3.5 h-3.5 text-db-accent" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                </svg>
                <span className="text-sm text-db-text">{m.roleName}</span>
                {m.adminOption && (
                  <span className="text-[10px] px-1 py-0.5 rounded bg-db-warning/20 text-db-warning font-medium">
                    ADMIN
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {hasMembers.length > 0 && (
        <div className="p-4">
          <h4 className="text-xs font-medium text-db-text-muted uppercase tracking-wide mb-2">
            Has Members
          </h4>
          <div className="space-y-1.5">
            {hasMembers.map((m, i) => (
              <div key={i} className="flex items-center gap-2 px-2 py-1.5 bg-db-elevated rounded">
                <svg className="w-3.5 h-3.5 text-db-text-muted" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
                <span className="text-sm text-db-text">{m.memberName}</span>
                {m.adminOption && (
                  <span className="text-[10px] px-1 py-0.5 rounded bg-db-warning/20 text-db-warning font-medium">
                    ADMIN
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
    return <EmptyState>No table grants</EmptyState>
  }

  // Group by schema
  const bySchema = grants.reduce((acc, grant) => {
    if (!acc[grant.schemaName]) acc[grant.schemaName] = []
    acc[grant.schemaName].push(grant)
    return acc
  }, {} as Record<string, TableGrant[]>)

  return (
    <div className="divide-y divide-db-border">
      {Object.entries(bySchema).map(([schema, schemaGrants]) => (
        <div key={schema} className="p-4">
          <h4 className="text-xs font-medium text-db-text-muted uppercase tracking-wide mb-2">
            {schema}
          </h4>
          <div className="space-y-2">
            {schemaGrants.map((grant, i) => (
              <div key={i} className="px-2 py-2 bg-db-elevated rounded">
                <div className="text-sm font-medium text-db-text">{grant.tableName}</div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {grant.privileges.map((priv) => (
                    <span
                      key={priv}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-db-accent/20 text-db-accent font-medium"
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
    return <EmptyState>No schema grants</EmptyState>
  }

  // Group by schema
  const bySchema = grants.reduce((acc, grant) => {
    if (!acc[grant.schemaName]) acc[grant.schemaName] = []
    acc[grant.schemaName].push(grant.privilegeType)
    return acc
  }, {} as Record<string, string[]>)

  return (
    <div className="divide-y divide-db-border">
      {Object.entries(bySchema).map(([schema, privileges]) => (
        <div key={schema} className="px-4 py-3 hover:bg-db-elevated/30">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-db-text">{schema}</span>
            <div className="flex gap-1">
              {privileges.map((priv) => (
                <span
                  key={priv}
                  className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                    priv === 'CREATE'
                      ? 'bg-db-warning/20 text-db-warning'
                      : 'bg-db-accent/20 text-db-accent'
                  }`}
                >
                  {priv}
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-8 text-center text-db-text-muted text-sm">
      {children}
    </div>
  )
}
