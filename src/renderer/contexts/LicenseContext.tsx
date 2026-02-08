import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import type { LicenseTier, License, Feature } from '../../shared/types'

interface LicenseContextType {
  tier: LicenseTier
  license: License | null
  isLoading: boolean
  error: string | null
  activateLicense: (key: string) => Promise<{ success: boolean; error?: string }>
  deactivateLicense: () => Promise<void>
  refreshLicense: () => Promise<void>
  hasFeature: (feature: Feature) => boolean
  setDevTier: (tier: LicenseTier) => void
}

const LicenseContext = createContext<LicenseContextType | null>(null)

// Feature availability per tier
const TIER_FEATURES: Record<LicenseTier, Feature[]> = {
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
    'users_permissions',
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
    'users_permissions',
    'visualizations',
    'shared_dashboards',
    'team_collaboration',
    'action_triggers',
  ],
}

export function LicenseProvider({ children }: { children: ReactNode }): JSX.Element {
  const [tier, setTier] = useState<LicenseTier>('free')
  const [license, setLicense] = useState<License | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load initial license state
  useEffect(() => {
    const loadLicense = async () => {
      try {
        const state = await window.api.getLicenseState()
        setTier(state.tier as LicenseTier)
        setLicense(state.license as License | null)
      } catch (err) {
        console.error('Failed to load license state:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadLicense()
  }, [])

  const activateLicense = useCallback(async (key: string) => {
    setError(null)
    try {
      const result = await window.api.activateLicense(key)
      if (result.success && result.license) {
        const lic = result.license as License
        setLicense(lic)
        setTier(lic.tier)
        return { success: true }
      }
      setError(result.error || 'Failed to activate license')
      return { success: false, error: result.error }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      return { success: false, error: message }
    }
  }, [])

  const deactivateLicense = useCallback(async () => {
    await window.api.deactivateLicense()
    setLicense(null)
    setTier('free')
    setError(null)
  }, [])

  const refreshLicense = useCallback(async () => {
    try {
      const result = await window.api.validateLicense()
      if (result.valid && result.license) {
        const lic = result.license as License
        setLicense(lic)
        setTier(lic.tier)
      }
    } catch (err) {
      console.error('Failed to refresh license:', err)
    }
  }, [])

  const hasFeature = useCallback((feature: Feature) => {
    return TIER_FEATURES[tier].includes(feature)
  }, [tier])

  // Dev-only: manually set tier for testing
  const setDevTier = useCallback((newTier: LicenseTier) => {
    setTier(newTier)
  }, [])

  return (
    <LicenseContext.Provider
      value={{
        tier,
        license,
        isLoading,
        error,
        activateLicense,
        deactivateLicense,
        refreshLicense,
        hasFeature,
        setDevTier,
      }}
    >
      {children}
    </LicenseContext.Provider>
  )
}

export function useLicense(): LicenseContextType {
  const context = useContext(LicenseContext)
  if (!context) {
    throw new Error('useLicense must be used within a LicenseProvider')
  }
  return context
}

// Convenience hook for checking a single feature
export function useFeature(feature: Feature): boolean {
  const { hasFeature } = useLicense()
  return hasFeature(feature)
}

// Component for gating features
interface FeatureGateProps {
  feature: Feature
  children: ReactNode
  fallback?: ReactNode
}

export function FeatureGate({ feature, children, fallback }: FeatureGateProps): JSX.Element | null {
  const hasAccess = useFeature(feature)

  if (!hasAccess) {
    return fallback ? <>{fallback}</> : null
  }

  return <>{children}</>
}
