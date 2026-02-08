import { useState, useEffect, useMemo } from 'react'
import type { SavedQuery } from '../../../shared/types'

interface Props {
  onSelect: (sql: string) => void
  onClose: () => void
  onSaveCurrentQuery: () => void
  currentQueryHasContent: boolean
}

export default function SavedQueriesModal({
  onSelect,
  onClose,
  onSaveCurrentQuery,
  currentQueryHasContent
}: Props) {
  const [queries, setQueries] = useState<SavedQuery[]>([])
  const [folders, setFolders] = useState<string[]>([])
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedQuery, setSelectedQuery] = useState<SavedQuery | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  useEffect(() => {
    loadQueries()
  }, [])

  const loadQueries = async () => {
    const [savedQueries, savedFolders] = await Promise.all([
      window.api.getSavedQueries(),
      window.api.getQueryFolders()
    ])
    setQueries(savedQueries)
    setFolders(savedFolders)
  }

  const handleDelete = async (id: string) => {
    await window.api.deleteQuery(id)
    if (selectedQuery?.id === id) {
      setSelectedQuery(null)
    }
    await loadQueries()
  }

  const handleRename = async (query: SavedQuery) => {
    if (editName.trim() && editName !== query.name) {
      await window.api.saveQuery({
        ...query,
        name: editName.trim()
      })
      await loadQueries()
    }
    setEditingId(null)
  }

  const handleSelect = (query: SavedQuery) => {
    onSelect(query.sql)
    onClose()
  }

  // Filter queries based on folder and search
  const filteredQueries = useMemo(() => {
    let result = queries

    // Filter by folder
    if (selectedFolder !== null) {
      result = result.filter(q => (q.folder || '') === selectedFolder)
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      result = result.filter(q =>
        q.name.toLowerCase().includes(term) ||
        q.sql.toLowerCase().includes(term)
      )
    }

    // Sort by updated date
    return result.sort((a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
  }, [queries, selectedFolder, searchTerm])

  // Count queries per folder
  const folderCounts = useMemo(() => {
    const counts: Record<string, number> = { '': 0 }
    folders.forEach(f => counts[f] = 0)
    queries.forEach(q => {
      const folder = q.folder || ''
      counts[folder] = (counts[folder] || 0) + 1
    })
    return counts
  }, [queries, folders])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()

    if (diff < 60000) return 'Just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`

    return date.toLocaleDateString()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-8">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-db-surface border border-db-border rounded-xl shadow-2xl w-full max-w-4xl h-[600px] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-db-border bg-db-elevated">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-db-accent/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-db-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-db-text">Saved Queries</h2>
              <p className="text-xs text-db-text-muted">{queries.length} queries saved</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {currentQueryHasContent && (
              <button
                onClick={onSaveCurrentQuery}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-db-accent hover:bg-db-accent-muted rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Save Current Query
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-db-text-muted hover:text-db-text hover:bg-db-surface rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 flex min-h-0">
          {/* Sidebar - Folders */}
          <div className="w-48 border-r border-db-border bg-db-bg flex flex-col">
            <div className="p-3 border-b border-db-border">
              <button
                onClick={() => setSelectedFolder(null)}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${
                  selectedFolder === null
                    ? 'bg-db-accent text-white'
                    : 'text-db-text-secondary hover:bg-db-surface'
                }`}
              >
                <span>All Queries</span>
                <span className="text-xs opacity-70">{queries.length}</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              <button
                onClick={() => setSelectedFolder('')}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${
                  selectedFolder === ''
                    ? 'bg-db-accent text-white'
                    : 'text-db-text-secondary hover:bg-db-surface'
                }`}
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Unsorted</span>
                </div>
                <span className="text-xs opacity-70">{folderCounts[''] || 0}</span>
              </button>
              {folders.map(folder => (
                <button
                  key={folder}
                  onClick={() => setSelectedFolder(folder)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${
                    selectedFolder === folder
                      ? 'bg-db-accent text-white'
                      : 'text-db-text-secondary hover:bg-db-surface'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                    <span className="truncate">{folder}</span>
                  </div>
                  <span className="text-xs opacity-70">{folderCounts[folder] || 0}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Search */}
            <div className="p-3 border-b border-db-border">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-db-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search queries..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm bg-db-bg border border-db-border rounded-lg focus:outline-none focus:border-db-accent text-db-text placeholder:text-db-text-faint"
                />
              </div>
            </div>

            {/* Query list and preview */}
            <div className="flex-1 flex min-h-0">
              {/* Query list */}
              <div className="w-1/2 border-r border-db-border overflow-y-auto">
                {filteredQueries.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-8">
                    <svg className="w-12 h-12 text-db-text-faint mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-sm text-db-text-muted">No queries found</p>
                    {searchTerm && (
                      <p className="text-xs text-db-text-faint mt-1">Try a different search term</p>
                    )}
                  </div>
                ) : (
                  <div className="divide-y divide-db-border-subtle">
                    {filteredQueries.map(query => (
                      <div
                        key={query.id}
                        onClick={() => setSelectedQuery(query)}
                        className={`p-4 cursor-pointer transition-colors ${
                          selectedQuery?.id === query.id
                            ? 'bg-db-accent/10 border-l-2 border-l-db-accent'
                            : 'hover:bg-db-surface/50 border-l-2 border-l-transparent'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          {editingId === query.id ? (
                            <input
                              type="text"
                              value={editName}
                              onChange={e => setEditName(e.target.value)}
                              onBlur={() => handleRename(query)}
                              onKeyDown={e => {
                                if (e.key === 'Enter') handleRename(query)
                                if (e.key === 'Escape') setEditingId(null)
                              }}
                              onClick={e => e.stopPropagation()}
                              className="flex-1 px-2 py-1 text-sm font-medium bg-db-bg border border-db-accent rounded focus:outline-none text-db-text"
                              autoFocus
                            />
                          ) : (
                            <h3 className="text-sm font-medium text-db-text truncate">{query.name}</h3>
                          )}
                          <span className="text-xs text-db-text-faint whitespace-nowrap">
                            {formatDate(query.updatedAt)}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-db-text-muted font-mono truncate">
                          {query.sql.replace(/\s+/g, ' ').slice(0, 80)}
                        </p>
                        {query.folder && (
                          <div className="mt-2 flex items-center gap-1 text-xs text-db-text-faint">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                            </svg>
                            <span>{query.folder}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Query preview */}
              <div className="w-1/2 flex flex-col bg-db-bg">
                {selectedQuery ? (
                  <>
                    <div className="p-4 border-b border-db-border bg-db-surface">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-db-text">{selectedQuery.name}</h3>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditingId(selectedQuery.id)
                              setEditName(selectedQuery.name)
                            }}
                            className="p-1.5 text-db-text-muted hover:text-db-text hover:bg-db-elevated rounded transition-colors"
                            title="Rename"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(selectedQuery.id)}
                            className="p-1.5 text-db-text-muted hover:text-db-error hover:bg-db-error-muted rounded transition-colors"
                            title="Delete"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-db-text-muted mt-1">
                        Updated {formatDate(selectedQuery.updatedAt)}
                      </p>
                    </div>
                    <div className="flex-1 overflow-auto p-4">
                      <pre className="text-sm font-mono text-db-text-secondary whitespace-pre-wrap">
                        {selectedQuery.sql}
                      </pre>
                    </div>
                    <div className="p-4 border-t border-db-border bg-db-surface">
                      <button
                        onClick={() => handleSelect(selectedQuery)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-db-accent hover:bg-db-accent-hover rounded-lg transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        Load Query
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                    <svg className="w-16 h-16 text-db-text-faint mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                    </svg>
                    <p className="text-sm text-db-text-muted">Select a query to preview</p>
                    <p className="text-xs text-db-text-faint mt-1">Click on any query from the list</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
