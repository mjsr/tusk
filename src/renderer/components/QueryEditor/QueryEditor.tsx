import { useRef, useCallback, useEffect } from 'react'
import Editor, { OnMount, loader } from '@monaco-editor/react'
import * as monaco from 'monaco-editor'
import { useTheme } from '../../contexts/ThemeContext'
import { useSchema } from '../../contexts/SchemaContext'
import { registerSqlCompletionProvider } from '../../utils/sqlCompletionProvider'

// Configure Monaco to use local files instead of CDN
loader.config({ monaco })

interface Props {
  value: string
  onChange: (value: string) => void
  onExecute: () => void
  isExecuting: boolean
  onSave?: () => void
}

export default function QueryEditor({ value, onChange, onExecute, isExecuting, onSave }: Props) {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)
  const monacoRef = useRef<typeof monaco | null>(null)
  const onExecuteRef = useRef(onExecute)
  const { theme } = useTheme()
  const { metadata } = useSchema()
  const metadataRef = useRef(metadata)

  // Keep metadata ref updated
  useEffect(() => {
    metadataRef.current = metadata
  }, [metadata])

  // Keep the ref updated with the latest onExecute function
  useEffect(() => {
    onExecuteRef.current = onExecute
  }, [onExecute])

  // Update Monaco theme when app theme changes
  useEffect(() => {
    if (!monacoRef.current) return

    const { colors } = theme
    const isDark = theme.type === 'dark'

    // Define/update the theme with current colors
    monacoRef.current.editor.defineTheme('db-gui-custom', {
      base: isDark ? 'vs-dark' : 'vs',
      inherit: true,
      rules: [
        { token: 'keyword', foreground: colors.syntaxKeyword.replace('#', ''), fontStyle: 'bold' },
        { token: 'string', foreground: colors.syntaxString.replace('#', '') },
        { token: 'number', foreground: colors.syntaxNumber.replace('#', '') },
        { token: 'comment', foreground: colors.syntaxComment.replace('#', ''), fontStyle: 'italic' },
        { token: 'operator', foreground: colors.accent.replace('#', '') },
        { token: 'identifier', foreground: colors.text.replace('#', '') },
      ],
      colors: {
        'editor.background': colors.surface,
        'editor.foreground': colors.text,
        'editor.lineHighlightBackground': colors.elevated,
        'editor.selectionBackground': isDark ? colors.accentMuted.replace('0.15', '0.3') : colors.accentMuted.replace('0.1', '0.3'),
        'editor.inactiveSelectionBackground': colors.accentMuted,
        'editorCursor.foreground': colors.accent,
        'editorLineNumber.foreground': colors.textFaint,
        'editorLineNumber.activeForeground': colors.textMuted,
        'editor.selectionHighlightBackground': colors.accentMuted,
        'editorIndentGuide.background': colors.borderSubtle,
        'editorIndentGuide.activeBackground': colors.border,
        'editorWidget.background': colors.surface,
        'editorWidget.border': colors.border,
      }
    })

    monacoRef.current.editor.setTheme('db-gui-custom')
  }, [theme])

  const handleMount: OnMount = useCallback((editor, monacoInstance) => {
    editorRef.current = editor
    monacoRef.current = monacoInstance

    // Register SQL completion provider with schema awareness
    registerSqlCompletionProvider(monacoInstance, () => metadataRef.current)

    // Add Cmd/Ctrl+Enter to execute query
    // Use ref to always get the latest onExecute function
    editor.addAction({
      id: 'execute-query',
      label: 'Execute Query',
      keybindings: [monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.Enter],
      run: () => {
        onExecuteRef.current()
      }
    })

    // Initial theme setup
    const { colors } = theme
    const isDark = theme.type === 'dark'

    monacoInstance.editor.defineTheme('db-gui-custom', {
      base: isDark ? 'vs-dark' : 'vs',
      inherit: true,
      rules: [
        { token: 'keyword', foreground: colors.syntaxKeyword.replace('#', ''), fontStyle: 'bold' },
        { token: 'string', foreground: colors.syntaxString.replace('#', '') },
        { token: 'number', foreground: colors.syntaxNumber.replace('#', '') },
        { token: 'comment', foreground: colors.syntaxComment.replace('#', ''), fontStyle: 'italic' },
        { token: 'operator', foreground: colors.accent.replace('#', '') },
        { token: 'identifier', foreground: colors.text.replace('#', '') },
      ],
      colors: {
        'editor.background': colors.surface,
        'editor.foreground': colors.text,
        'editor.lineHighlightBackground': colors.elevated,
        'editor.selectionBackground': isDark ? colors.accentMuted.replace('0.15', '0.3') : colors.accentMuted.replace('0.1', '0.3'),
        'editor.inactiveSelectionBackground': colors.accentMuted,
        'editorCursor.foreground': colors.accent,
        'editorLineNumber.foreground': colors.textFaint,
        'editorLineNumber.activeForeground': colors.textMuted,
        'editor.selectionHighlightBackground': colors.accentMuted,
        'editorIndentGuide.background': colors.borderSubtle,
        'editorIndentGuide.activeBackground': colors.border,
        'editorWidget.background': colors.surface,
        'editorWidget.border': colors.border,
      }
    })

    monacoInstance.editor.setTheme('db-gui-custom')

    // Focus the editor
    editor.focus()
  }, [theme])

  const handleChange = (value: string | undefined) => {
    onChange(value ?? '')
  }

  return (
    <div className="h-full flex flex-col bg-db-surface">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-db-elevated border-b border-db-border">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-db-accent animate-pulse-slow" />
            <span className="text-xs font-medium text-db-text-secondary uppercase tracking-wide">
              Query
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {onSave && (
            <button
              onClick={onSave}
              disabled={!value.trim()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-db-text-secondary hover:text-db-text hover:bg-db-elevated disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
              title="Save query"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              <span>Save</span>
            </button>
          )}

          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-db-text-muted bg-db-surface rounded border border-db-border">
            <span className="text-xs">⌘</span>
            <span>Enter</span>
          </kbd>

          <button
            onClick={onExecute}
            disabled={isExecuting}
            className="flex items-center gap-2 px-4 py-1.5 bg-db-accent hover:bg-db-accent-hover disabled:bg-db-accent/70 rounded-md text-xs font-semibold text-white transition-all duration-150"
          >
            {isExecuting ? (
              <>
                <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>Running</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
                <span>Run</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 relative">
        <Editor
          height="100%"
          defaultLanguage="sql"
          value={value}
          onChange={handleChange}
          onMount={handleMount}
          theme="db-gui-custom"
          loading={
            <div className="flex items-center justify-center h-full bg-db-surface">
              <div className="flex items-center gap-2 text-db-text-muted">
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span className="text-sm">Loading editor...</span>
              </div>
            </div>
          }
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            fontFamily: "'JetBrains Mono', 'Fira Code', 'SF Mono', Menlo, monospace",
            fontLigatures: true,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            tabSize: 2,
            automaticLayout: true,
            padding: { top: 16, bottom: 16 },
            renderLineHighlight: 'line',
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            smoothScrolling: true,
            lineHeight: 1.6,
            letterSpacing: 0.3,
            renderWhitespace: 'none',
            guides: {
              indentation: true,
              bracketPairs: true,
            },
            bracketPairColorization: {
              enabled: true,
            },
            scrollbar: {
              vertical: 'auto',
              horizontal: 'auto',
              verticalScrollbarSize: 10,
              horizontalScrollbarSize: 10,
            },
            overviewRulerBorder: false,
            hideCursorInOverviewRuler: true,
            contextmenu: true,
            quickSuggestions: true,
            suggestOnTriggerCharacters: true,
          }}
        />

        {/* Empty state overlay */}
        {!value.trim() && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-db-text-faint text-sm">
              Start typing your SQL query...
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
