import { useState, useRef, useEffect } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { themes } from '../themes'

export default function ThemeToggle() {
  const { theme, themeId, useSystemTheme, setThemeId, setUseSystemTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
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

  const darkThemes = themes.filter(t => t.type === 'dark')
  const lightThemes = themes.filter(t => t.type === 'light')

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
        <div className="absolute right-0 top-full mt-1 py-2 bg-db-elevated border border-db-border rounded-lg shadow-xl z-50 min-w-[220px] max-h-[400px] overflow-y-auto">
          {/* System option */}
          <button
            onClick={() => {
              setUseSystemTheme(true)
              setIsOpen(false)
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 text-xs transition-colors ${
              useSystemTheme
                ? 'text-db-accent bg-db-accent-muted'
                : 'text-db-text-secondary hover:text-db-text hover:bg-db-surface'
            }`}
          >
            <div className="w-8 h-6 rounded border border-db-border-subtle overflow-hidden flex">
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

          {/* Dark themes */}
          <div className="px-3 pt-3 pb-1">
            <span className="text-[10px] font-semibold text-db-text-muted uppercase tracking-wider">
              Dark
            </span>
          </div>
          {darkThemes.map((t) => (
            <ThemeOption
              key={t.id}
              theme={t}
              isSelected={!useSystemTheme && themeId === t.id}
              onClick={() => {
                setThemeId(t.id)
                setIsOpen(false)
              }}
            />
          ))}

          {/* Light themes */}
          <div className="px-3 pt-3 pb-1">
            <span className="text-[10px] font-semibold text-db-text-muted uppercase tracking-wider">
              Light
            </span>
          </div>
          {lightThemes.map((t) => (
            <ThemeOption
              key={t.id}
              theme={t}
              isSelected={!useSystemTheme && themeId === t.id}
              onClick={() => {
                setThemeId(t.id)
                setIsOpen(false)
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface ThemeOptionProps {
  theme: { id: string; name: string; preview: { bg: string; accent: string; text: string } }
  isSelected: boolean
  onClick: () => void
}

function ThemeOption({ theme, isSelected, onClick }: ThemeOptionProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 text-xs transition-colors ${
        isSelected
          ? 'text-db-accent bg-db-accent-muted'
          : 'text-db-text-secondary hover:text-db-text hover:bg-db-surface'
      }`}
    >
      {/* Color swatch preview */}
      <div
        className="w-8 h-6 rounded border border-db-border-subtle flex items-center justify-center gap-0.5 p-1"
        style={{ backgroundColor: theme.preview.bg }}
      >
        <div
          className="w-1.5 h-full rounded-sm"
          style={{ backgroundColor: theme.preview.accent }}
        />
        <div className="flex-1 flex flex-col gap-0.5">
          <div
            className="h-1 rounded-sm"
            style={{ backgroundColor: theme.preview.text }}
          />
          <div
            className="h-1 rounded-sm opacity-50"
            style={{ backgroundColor: theme.preview.text }}
          />
        </div>
      </div>
      <span className="flex-1 text-left">{theme.name}</span>
      {isSelected && (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )}
    </button>
  )
}
