import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { themes, getThemeById, defaultThemeId, type Theme } from '../themes'

interface ThemeContextValue {
  themeId: string
  theme: Theme
  useSystemTheme: boolean
  setThemeId: (id: string) => void
  setUseSystemTheme: (use: boolean) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function applyTheme(theme: Theme) {
  const root = document.documentElement
  const { colors } = theme

  // Set theme type class for glass effects, etc.
  root.classList.remove('light', 'dark')
  root.classList.add(theme.type)

  // Apply all theme colors as CSS custom properties
  root.style.setProperty('--theme-bg', colors.bg)
  root.style.setProperty('--theme-surface', colors.surface)
  root.style.setProperty('--theme-elevated', colors.elevated)
  root.style.setProperty('--theme-overlay', colors.overlay)
  root.style.setProperty('--theme-darker', colors.darker)

  root.style.setProperty('--theme-border', colors.border)
  root.style.setProperty('--theme-border-subtle', colors.borderSubtle)

  root.style.setProperty('--theme-text', colors.text)
  root.style.setProperty('--theme-text-secondary', colors.textSecondary)
  root.style.setProperty('--theme-text-muted', colors.textMuted)
  root.style.setProperty('--theme-text-faint', colors.textFaint)

  root.style.setProperty('--theme-accent', colors.accent)
  root.style.setProperty('--theme-accent-hover', colors.accentHover)
  root.style.setProperty('--theme-accent-muted', colors.accentMuted)

  root.style.setProperty('--theme-success', colors.success)
  root.style.setProperty('--theme-success-muted', colors.successMuted)
  root.style.setProperty('--theme-warning', colors.warning)
  root.style.setProperty('--theme-warning-muted', colors.warningMuted)
  root.style.setProperty('--theme-error', colors.error)
  root.style.setProperty('--theme-error-muted', colors.errorMuted)

  root.style.setProperty('--theme-syntax-keyword', colors.syntaxKeyword)
  root.style.setProperty('--theme-syntax-string', colors.syntaxString)
  root.style.setProperty('--theme-syntax-number', colors.syntaxNumber)
  root.style.setProperty('--theme-syntax-comment', colors.syntaxComment)
}

function getSystemTheme(): Theme {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  // Find first matching theme type
  return themes.find(t => t.type === (prefersDark ? 'dark' : 'light')) ?? themes[0]
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeIdState] = useState<string>(() => {
    return localStorage.getItem('db-gui-theme-id') ?? defaultThemeId
  })

  const [useSystemTheme, setUseSystemThemeState] = useState<boolean>(() => {
    return localStorage.getItem('db-gui-use-system-theme') === 'true'
  })

  const [theme, setTheme] = useState<Theme>(() => {
    if (useSystemTheme) {
      return getSystemTheme()
    }
    return getThemeById(themeId)
  })

  // Apply theme when it changes
  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  // Listen for system theme changes
  useEffect(() => {
    if (!useSystemTheme) return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      setTheme(getSystemTheme())
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [useSystemTheme])

  const setThemeId = (id: string) => {
    setThemeIdState(id)
    localStorage.setItem('db-gui-theme-id', id)
    setUseSystemThemeState(false)
    localStorage.setItem('db-gui-use-system-theme', 'false')
    setTheme(getThemeById(id))
  }

  const setUseSystemTheme = (use: boolean) => {
    setUseSystemThemeState(use)
    localStorage.setItem('db-gui-use-system-theme', String(use))
    if (use) {
      setTheme(getSystemTheme())
    } else {
      setTheme(getThemeById(themeId))
    }
  }

  return (
    <ThemeContext.Provider value={{ themeId, theme, useSystemTheme, setThemeId, setUseSystemTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
