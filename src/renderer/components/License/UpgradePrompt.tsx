import { useLicense } from '../../contexts/LicenseContext'
import type { Feature } from '../../../shared/types'

interface UpgradePromptProps {
  feature: Feature
  title?: string
  description?: string
}

const FEATURE_INFO: Record<Feature, { name: string; tier: 'pro' | 'team'; description: string }> = {
  basic_gui: { name: 'Basic GUI', tier: 'pro', description: '' },
  multiple_connections: { name: 'Multiple Connections', tier: 'pro', description: '' },
  query_history: { name: 'Query History', tier: 'pro', description: '' },
  autocomplete: { name: 'Autocomplete', tier: 'pro', description: '' },
  syntax_highlighting: { name: 'Syntax Highlighting', tier: 'pro', description: '' },
  ai_queries: { name: 'AI-Powered Queries', tier: 'pro', description: 'Generate SQL from natural language' },
  natural_language_sql: { name: 'Natural Language to SQL', tier: 'pro', description: 'Describe what you want, get SQL' },
  query_optimization: { name: 'Query Optimization', tier: 'pro', description: 'Get suggestions to improve performance' },
  csv_reports: { name: 'Automated CSV Reports', tier: 'pro', description: 'Schedule exports to any inbox' },
  visualizations: { name: 'Visualizations', tier: 'team', description: 'Turn queries into charts' },
  shared_dashboards: { name: 'Shared Dashboards', tier: 'team', description: 'Collaborate with your team' },
  team_collaboration: { name: 'Team Collaboration', tier: 'team', description: 'Work together in real-time' },
  action_triggers: { name: 'Action Triggers', tier: 'team', description: 'Alerts when metrics change' },
  users_permissions: { name: 'Users & Permissions', tier: 'pro', description: 'View database roles, permissions, and grants' },
}

export function UpgradePrompt({ feature, title, description }: UpgradePromptProps): JSX.Element {
  const { tier } = useLicense()
  const info = FEATURE_INFO[feature]

  const requiredTier = info.tier
  const tierLabel = requiredTier === 'pro' ? 'Pro' : 'Team'

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-db-darker rounded-lg border border-db-border text-center">
      <div className="w-12 h-12 bg-db-accent/20 rounded-full flex items-center justify-center mb-4">
        <svg
          className="w-6 h-6 text-db-accent"
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
      <h3 className="text-lg font-semibold text-db-text mb-2">
        {title || `${info.name} requires ${tierLabel}`}
      </h3>
      <p className="text-db-muted mb-4 max-w-sm">
        {description || info.description || `Upgrade to ${tierLabel} to unlock this feature.`}
      </p>
      <div className="flex gap-3">
        <button
          onClick={() => {
            // Open upgrade URL in browser
            window.open('https://tusk.dev/pricing', '_blank')
          }}
          className="px-4 py-2 bg-db-accent hover:bg-db-accent/80 text-white rounded-lg font-medium transition-colors"
        >
          Upgrade to {tierLabel}
        </button>
        <button
          onClick={() => {
            // Could open a license activation modal
          }}
          className="px-4 py-2 border border-db-border hover:border-db-muted rounded-lg text-db-text transition-colors"
        >
          Enter License Key
        </button>
      </div>
      <p className="text-db-muted text-sm mt-4">
        Current plan: <span className="text-db-text capitalize">{tier}</span>
      </p>
    </div>
  )
}
