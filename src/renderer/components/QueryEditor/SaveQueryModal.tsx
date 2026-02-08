import { useState, useEffect } from 'react'

interface Props {
  sql: string
  existingFolders: string[]
  onSave: (name: string, folder?: string) => void
  onCancel: () => void
}

export default function SaveQueryModal({ sql, existingFolders, onSave, onCancel }: Props) {
  const [name, setName] = useState('')
  const [folder, setFolder] = useState('')
  const [useNewFolder, setUseNewFolder] = useState(false)
  const [newFolder, setNewFolder] = useState('')

  // Auto-generate name from SQL
  useEffect(() => {
    const firstLine = sql.trim().split('\n')[0].slice(0, 50)
    setName(firstLine || 'Untitled Query')
  }, [sql])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    const selectedFolder = useNewFolder ? newFolder.trim() : folder
    onSave(name.trim(), selectedFolder || undefined)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative bg-db-surface border border-db-border rounded-lg shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-db-border">
          <svg className="w-5 h-5 text-db-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          <h2 className="text-lg font-semibold text-db-text">Save Query</h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Query preview */}
          <div>
            <label className="block text-xs font-medium text-db-text-muted mb-1.5">
              Query Preview
            </label>
            <div className="p-2 bg-db-bg rounded-md border border-db-border max-h-24 overflow-auto">
              <pre className="text-xs font-mono text-db-text-secondary whitespace-pre-wrap">
                {sql.slice(0, 200)}{sql.length > 200 ? '...' : ''}
              </pre>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-db-text-muted mb-1.5">
              Query Name
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Enter a name for this query"
              className="w-full px-3 py-2 text-sm bg-db-bg border border-db-border rounded-md focus:outline-none focus:border-db-accent text-db-text placeholder:text-db-text-faint"
              autoFocus
            />
          </div>

          {/* Folder */}
          <div>
            <label className="block text-xs font-medium text-db-text-muted mb-1.5">
              Folder (optional)
            </label>
            {existingFolders.length > 0 && !useNewFolder ? (
              <div className="space-y-2">
                <select
                  value={folder}
                  onChange={e => setFolder(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-db-bg border border-db-border rounded-md focus:outline-none focus:border-db-accent text-db-text"
                >
                  <option value="">No folder</option>
                  {existingFolders.map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setUseNewFolder(true)}
                  className="text-xs text-db-accent hover:text-db-accent-hover"
                >
                  + Create new folder
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  value={newFolder}
                  onChange={e => setNewFolder(e.target.value)}
                  placeholder="Enter folder name"
                  className="w-full px-3 py-2 text-sm bg-db-bg border border-db-border rounded-md focus:outline-none focus:border-db-accent text-db-text placeholder:text-db-text-faint"
                />
                {existingFolders.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setUseNewFolder(false)}
                    className="text-xs text-db-text-muted hover:text-db-text"
                  >
                    Choose existing folder
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-db-text-secondary hover:text-db-text hover:bg-db-elevated rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-db-accent hover:bg-db-accent-hover disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Save Query
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
