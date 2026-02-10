import { useState, useRef, useEffect } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { themes } from '../themes'

type ThemeCategory = 'dark' | 'light'

export default function ThemeToggle() {
  const { theme, themeId, useSystemTheme, setThemeId, setUseSystemTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const [category, setCategory] = useState<ThemeCategory>(theme.type)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Update category when theme changes
  useEffect(() => {
    setCategory(theme.type)
  }, [theme.type])

  const filteredThemes = themes.filter(t => t.type === category)

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2 py-1 text-xs text-db-text-muted hover:text-db-text hover:bg-db-elevated rounded-md transition-colors"
        title="Change theme"
      >
        {/* Theme color preview */}
        <div className="flex items-center gap-0.5">
          <div
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: theme.preview.bg }}
          />
          <div
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: theme.preview.accent }}
          />
        </div>
        <span className="hidden sm:inline">
          {useSystemTheme ? 'System' : theme.name}
        </span>
        <svg className="w-3 h-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 bg-db-elevated border border-db-border rounded-lg shadow-xl z-50 min-w-[240px] overflow-hidden">
          {/* Category Segmented Control */}
          <div className="p-2 border-b border-db-border">
            <div className="flex gap-1.5 bg-db-surface rounded-lg p-1">
              <button
                onClick={() => setCategory('dark')}
                className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 text-xs font-medium rounded-md transition-all ${
                  category === 'dark'
                    ? 'bg-db-elevated text-db-text shadow-sm'
                    : 'text-db-text-muted hover:text-db-text hover:bg-db-elevated/50'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
                Dark
              </button>
              <button
                onClick={() => setCategory('light')}
                className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 text-xs font-medium rounded-md transition-all ${
                  category === 'light'
                    ? 'bg-db-elevated text-db-text shadow-sm'
                    : 'text-db-text-muted hover:text-db-text hover:bg-db-elevated/50'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Light
              </button>
            </div>
          </div>

          {/* Theme Grid */}
          <div className="p-2">
            <div className="grid grid-cols-2 gap-1.5">
              {filteredThemes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setThemeId(t.id)
                    setIsOpen(false)
                  }}
                  className={`flex items-center gap-2 px-2.5 py-2 text-xs rounded-md transition-colors ${
                    !useSystemTheme && themeId === t.id
                      ? 'text-db-accent bg-db-accent-muted ring-1 ring-db-accent/30'
                      : 'text-db-text-secondary hover:text-db-text hover:bg-db-surface'
                  }`}
                >
                  {/* Color swatch */}
                  <div
                    className="w-5 h-5 rounded border border-db-border-subtle flex items-center justify-center"
                    style={{ backgroundColor: t.preview.bg }}
                  >
                    <div
                      className="w-2 h-2 rounded-sm"
                      style={{ backgroundColor: t.preview.accent }}
                    />
                  </div>
                  <span className="flex-1 text-left truncate">{t.name}</span>
                  {!useSystemTheme && themeId === t.id && (
                    <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* System option at bottom */}
          <div className="p-1.5 border-t border-db-border">
            <button
              onClick={() => {
                setUseSystemTheme(true)
                setIsOpen(false)
              }}
              className={`w-full flex items-center gap-3 px-2.5 py-2 text-xs rounded-md transition-colors ${
                useSystemTheme
                  ? 'text-db-accent bg-db-accent-muted'
                  : 'text-db-text-secondary hover:text-db-text hover:bg-db-surface'
              }`}
            >
              <div className="w-5 h-5 rounded border border-db-border-subtle overflow-hidden flex">
                <div className="w-1/2 bg-zinc-800" />
                <div className="w-1/2 bg-zinc-100" />
              </div>
              <span className="flex-1 text-left">System</span>
              {useSystemTheme && (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
