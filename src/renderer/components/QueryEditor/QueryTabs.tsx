import { useState, useCallback, useImperativeHandle, forwardRef } from 'react'
import QueryEditor from './QueryEditor'
import ResultsTable from '../ResultsTable/ResultsTable'
import QueryHistory, { type HistoryEntry } from './QueryHistory'
import SavedQueriesModal from './SavedQueriesModal'
import SaveQueryModal from './SaveQueryModal'
import { DataEditor } from '../DataEditor'
import type { QueryResult, TableContext } from '../../../shared/types'

interface Tab {
  id: string
  name: string
  query: string
  result: QueryResult | null
  error: string | null
  tableContext?: TableContext | null // For editable table previews
}

export interface QueryTabsHandle {
  addQueryTab: (name: string, query: string, autoExecute?: boolean, tableContext?: TableContext) => void
}

const QueryTabs = forwardRef<QueryTabsHandle>(function QueryTabs(_, ref) {
  const [tabs, setTabs] = useState<Tab[]>([
    { id: '1', name: 'Query 1', query: '', result: null, error: null }
  ])
  const [activeTabId, setActiveTabId] = useState('1')
  const [isExecuting, setIsExecuting] = useState(false)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [showSavedQueriesModal, setShowSavedQueriesModal] = useState(false)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [existingFolders, setExistingFolders] = useState<string[]>([])

  const activeTab = tabs.find(t => t.id === activeTabId) ?? tabs[0]

  const updateTab = useCallback((id: string, updates: Partial<Tab>) => {
    setTabs(prev => prev.map(t => (t.id === id ? { ...t, ...updates } : t)))
  }, [])

  // Expose method to add a new tab with query
  useImperativeHandle(ref, () => ({
    addQueryTab: (name: string, query: string, autoExecute = false, tableContext?: TableContext) => {
      const newId = String(Date.now())
      const newTab: Tab = {
        id: newId,
        name,
        query,
        result: null,
        error: null,
        tableContext: tableContext ?? null
      }
      setTabs(prev => [...prev, newTab])
      setActiveTabId(newId)

      if (autoExecute) {
        // Execute after state updates
        setTimeout(async () => {
          setIsExecuting(true)
          try {
            const result = await window.api.query(query)
            setTabs(prev => prev.map(t =>
              t.id === newId ? { ...t, result, error: null } : t
            ))
            setHistory(prev => [{
              id: String(Date.now()),
              query,
              timestamp: new Date(),
              success: true,
              rowCount: result.rowCount
            }, ...prev].slice(0, 50))
          } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Query failed'
            setTabs(prev => prev.map(t =>
              t.id === newId ? { ...t, result: null, error: errorMessage } : t
            ))
          } finally {
            setIsExecuting(false)
          }
        }, 0)
      }
    }
  }), [])

  const addTab = () => {
    const newId = String(Date.now())
    const newTab: Tab = {
      id: newId,
      name: `Query ${tabs.length + 1}`,
      query: '',
      result: null,
      error: null
    }
    setTabs(prev => [...prev, newTab])
    setActiveTabId(newId)
  }

  const closeTab = (id: string) => {
    if (tabs.length === 1) return
    const index = tabs.findIndex(t => t.id === id)
    const newTabs = tabs.filter(t => t.id !== id)
    setTabs(newTabs)
    if (activeTabId === id) {
      setActiveTabId(newTabs[Math.max(0, index - 1)].id)
    }
  }

  const addToHistory = (query: string, success: boolean, rowCount?: number) => {
    const entry: HistoryEntry = {
      id: String(Date.now()),
      query,
      timestamp: new Date(),
      success,
      rowCount
    }
    setHistory(prev => [entry, ...prev].slice(0, 50))
  }

  const executeQuery = async () => {
    if (!activeTab.query.trim()) return

    setIsExecuting(true)
    updateTab(activeTab.id, { result: null, error: null })

    try {
      const result = await window.api.query(activeTab.query)
      updateTab(activeTab.id, { result, error: null })
      addToHistory(activeTab.query, true, result.rowCount)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Query failed'
      updateTab(activeTab.id, { result: null, error: errorMessage })
      addToHistory(activeTab.query, false)
    } finally {
      setIsExecuting(false)
    }
  }

  const loadFromHistory = (query: string) => {
    updateTab(activeTab.id, { query })
  }

  const loadFromSaved = (query: string) => {
    updateTab(activeTab.id, { query })
  }

  const openSaveModal = async () => {
    if (!activeTab.query.trim()) return
    const folders = await window.api.getQueryFolders()
    setExistingFolders(folders)
    setShowSaveModal(true)
  }

  const handleSaveQuery = async (name: string, folder?: string) => {
    await window.api.saveQuery({
      id: String(Date.now()),
      name,
      sql: activeTab.query,
      folder
    })
    setShowSaveModal(false)
  }

  const toggleHistory = () => {
    setShowHistory(!showHistory)
  }

  const openSavedQueriesModal = () => {
    setShowSavedQueriesModal(true)
  }

  return (
    <div className="h-full flex flex-col bg-db-bg overflow-hidden">
      {/* Tab bar - using grid to ensure actions never get cut off */}
      <div className="relative z-20 h-11 flex-shrink-0 grid grid-cols-[1fr_auto] bg-db-surface border-b border-db-border">
        <div className="flex items-center overflow-x-auto">
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              onClick={() => setActiveTabId(tab.id)}
              className={`group relative flex items-center gap-2 px-4 py-2.5 text-sm transition-colors duration-100 ${
                activeTabId === tab.id
                  ? 'text-db-text bg-db-bg'
                  : 'text-db-text-muted hover:text-db-text-secondary hover:bg-db-elevated'
              }`}
            >
              {/* Active indicator */}
              {activeTabId === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-db-accent" />
              )}

              {/* Tab number badge */}
              <span className={`flex items-center justify-center w-5 h-5 rounded text-[10px] font-medium ${
                activeTabId === tab.id
                  ? 'bg-db-accent/20 text-db-accent'
                  : 'bg-db-border text-db-text-muted'
              }`}>
                {index + 1}
              </span>

              <span className="font-medium truncate max-w-[120px]">{tab.name}</span>

              {/* Close button */}
              {tabs.length > 1 && (
                <span
                  onClick={e => {
                    e.stopPropagation()
                    closeTab(tab.id)
                  }}
                  className="ml-1 p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-db-error/20 hover:text-db-error transition-all duration-100"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab actions - always visible */}
        <div className="flex items-center gap-1 px-3 border-l border-db-border bg-db-surface">
          <button
            onClick={addTab}
            className="p-2 text-db-text-muted hover:text-db-text hover:bg-db-elevated rounded-md transition-colors"
            title="New query tab"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>

          <div className="w-px h-4 bg-db-border mx-1" />

          <button
            onClick={openSavedQueriesModal}
            className="p-2 rounded-md transition-colors text-db-text-muted hover:text-db-text hover:bg-db-elevated"
            title="Saved queries"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>

          <button
            onClick={toggleHistory}
            className={`p-2 rounded-md transition-colors ${
              showHistory
                ? 'text-db-accent bg-db-accent/10'
                : 'text-db-text-muted hover:text-db-text hover:bg-db-elevated'
            }`}
            title="Query history"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Editor and results */}
        <div className="flex-1 flex flex-col min-h-0 min-w-0">
          {/* Query editor */}
          <div className="h-[45%] min-h-[180px] border-b border-db-border">
            <QueryEditor
              value={activeTab.query}
              onChange={value => updateTab(activeTab.id, { query: value })}
              onExecute={executeQuery}
              isExecuting={isExecuting}
              onSave={openSaveModal}
            />
          </div>

          {/* Resizable divider placeholder - could add drag-to-resize later */}
          <div className="h-1 bg-db-border cursor-row-resize hover:bg-db-accent/50 transition-colors" />

          {/* Results */}
          <div className="flex-1 min-h-[180px]">
            {activeTab.tableContext && activeTab.result ? (
              <DataEditor
                result={activeTab.result}
                tableContext={activeTab.tableContext}
                onRefresh={() => executeQuery()}
              />
            ) : (
              <ResultsTable
                result={activeTab.result}
                error={activeTab.error}
                isLoading={isExecuting}
              />
            )}
          </div>
        </div>

        {/* History sidebar */}
        {showHistory && (
          <div className="w-72 flex-shrink-0 border-l border-db-border bg-db-surface flex flex-col">
            <QueryHistory
              history={history}
              onSelect={loadFromHistory}
              onClear={() => setHistory([])}
              onClose={() => setShowHistory(false)}
            />
          </div>
        )}
      </div>

      {/* Saved queries modal */}
      {showSavedQueriesModal && (
        <SavedQueriesModal
          onSelect={loadFromSaved}
          onClose={() => setShowSavedQueriesModal(false)}
          onSaveCurrentQuery={() => {
            setShowSavedQueriesModal(false)
            openSaveModal()
          }}
          currentQueryHasContent={!!activeTab.query.trim()}
        />
      )}

      {/* Save query modal */}
      {showSaveModal && (
        <SaveQueryModal
          sql={activeTab.query}
          existingFolders={existingFolders}
          onSave={handleSaveQuery}
          onCancel={() => setShowSaveModal(false)}
        />
      )}
    </div>
  )
})

export default QueryTabs
