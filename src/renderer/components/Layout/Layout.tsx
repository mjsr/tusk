import { useRef, useState } from 'react'
import QueryTabs, { QueryTabsHandle } from '../QueryEditor/QueryTabs'
import { SchemaBrowser } from '../SchemaBrowser'
import ThemeToggle from '../ThemeToggle'

interface Props {
  connectionName: string
  onDisconnect: () => void
}

export default function Layout({ connectionName, onDisconnect }: Props) {
  const queryTabsRef = useRef<QueryTabsHandle>(null)
  const [sidebarWidth, setSidebarWidth] = useState(280)
  const [isResizing, setIsResizing] = useState(false)
  const [showSidebar, setShowSidebar] = useState(true)

  const handlePreviewTable = async (schema: string, table: string) => {
    const query = `SELECT * FROM "${schema}"."${table}" LIMIT 100`

    // Fetch primary keys for edit support
    try {
      const primaryKeys = await window.api.getPrimaryKeys(schema, table)
      const tableContext = { schema, table, primaryKeys }
      queryTabsRef.current?.addQueryTab(`${table}`, query, true, tableContext)
    } catch {
      // If we can't get primary keys, open in read-only mode
      queryTabsRef.current?.addQueryTab(`${table}`, query, true)
    }
  }

  const handleMouseDown = () => {
    setIsResizing(true)
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  const handleMouseMove = (e: MouseEvent) => {
    const newWidth = e.clientX
    if (newWidth >= 200 && newWidth <= 500) {
      setSidebarWidth(newWidth)
    }
  }

  const handleMouseUp = () => {
    setIsResizing(false)
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }

  return (
    <div className="h-screen flex flex-col bg-db-bg">
      {/* Title bar */}
      <div className="h-10 drag-region flex items-center justify-between pr-4 pl-20 bg-db-surface border-b border-db-border">
        {/* Left: App title and sidebar toggle (pl-20 leaves room for macOS traffic lights) */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="no-drag p-1.5 text-db-text-muted hover:text-db-text hover:bg-db-elevated rounded-md transition-colors"
            title={showSidebar ? 'Hide sidebar' : 'Show sidebar'}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
          </button>

          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-db-accent to-purple-500 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-db-text">db-gui</span>
          </div>
        </div>

        {/* Right: Connection status */}
        <div className="no-drag flex items-center gap-3">
          {/* Connection indicator */}
          <div className="flex items-center gap-2 px-2.5 py-1 bg-db-success-muted rounded-full">
            <div className="relative">
              <div className="w-2 h-2 bg-db-success rounded-full" />
              <div className="absolute inset-0 w-2 h-2 bg-db-success rounded-full animate-ping opacity-75" />
            </div>
            <span className="text-xs font-medium text-db-success">
              {connectionName}
            </span>
          </div>

          <div className="w-px h-4 bg-db-border" />

          {/* Theme toggle */}
          <ThemeToggle />

          <div className="w-px h-4 bg-db-border" />

          {/* Disconnect button */}
          <button
            onClick={onDisconnect}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-db-text-muted hover:text-db-text hover:bg-db-elevated rounded-md transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Disconnect</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex min-h-0">
        {/* Schema browser sidebar */}
        {showSidebar && (
          <>
            <div
              className="flex-shrink-0 overflow-hidden"
              style={{ width: sidebarWidth }}
            >
              <SchemaBrowser onPreviewTable={handlePreviewTable} />
            </div>

            {/* Resize handle */}
            <div
              className={`w-1 cursor-col-resize hover:bg-db-accent/50 transition-colors ${
                isResizing ? 'bg-db-accent' : 'bg-db-border'
              }`}
              onMouseDown={handleMouseDown}
            />
          </>
        )}

        {/* Query editor with tabs */}
        <div className="flex-1 min-h-0 min-w-0 h-full overflow-hidden">
          <QueryTabs ref={queryTabsRef} />
        </div>
      </div>
    </div>
  )
}
