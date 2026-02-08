// License tier definitions
export type LicenseTier = 'free' | 'pro' | 'team'

export interface License {
  key: string
  tier: LicenseTier
  email: string
  expiresAt: string | null  // null = lifetime
  maxSeats?: number         // for team tier
  createdAt: string
}

export interface LicenseValidationResult {
  valid: boolean
  license?: License
  error?: string
}

// Features available per tier
export const TIER_FEATURES: Record<LicenseTier, string[]> = {
  free: [
    'basic_gui',
    'multiple_connections',
    'query_history',
    'autocomplete',
    'syntax_highlighting',
  ],
  pro: [
    'basic_gui',
    'multiple_connections',
    'query_history',
    'autocomplete',
    'syntax_highlighting',
    'ai_queries',
    'natural_language_sql',
    'query_optimization',
    'csv_reports',
  ],
  team: [
    'basic_gui',
    'multiple_connections',
    'query_history',
    'autocomplete',
    'syntax_highlighting',
    'ai_queries',
    'natural_language_sql',
    'query_optimization',
    'csv_reports',
    'visualizations',
    'shared_dashboards',
    'team_collaboration',
    'action_triggers',
  ],
}

export function hasFeature(tier: LicenseTier, feature: string): boolean {
  return TIER_FEATURES[tier].includes(feature)
}

// Simple license key format: TUSK-TIER-XXXXXXXX-XXXX
// In production, use proper cryptographic signing
export function parseLicenseKey(key: string): { tier: LicenseTier; id: string } | null {
  const parts = key.split('-')
  if (parts.length !== 4 || parts[0] !== 'TUSK') {
    return null
  }

  const tierMap: Record<string, LicenseTier> = {
    'FREE': 'free',
    'PRO': 'pro',
    'TEAM': 'team',
  }

  const tier = tierMap[parts[1]]
  if (!tier) {
    return null
  }

  return { tier, id: `${parts[2]}-${parts[3]}` }
}

// Generate a license key (for testing/admin purposes)
export function generateLicenseKey(tier: LicenseTier): string {
  const tierCode = tier.toUpperCase()
  const id1 = Math.random().toString(36).substring(2, 10).toUpperCase()
  const id2 = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `TUSK-${tierCode}-${id1}-${id2}`
}
