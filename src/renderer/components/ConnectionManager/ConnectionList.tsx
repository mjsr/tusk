import type { SavedConnection } from '../../../shared/types'

interface Props {
  connections: SavedConnection[]
  selectedId?: string
  onSelect: (connection: SavedConnection) => void
  onDelete: (id: string) => void
}

export default function ConnectionList({ connections, selectedId, onSelect, onDelete }: Props) {
  return (
    <div className="w-64 bg-db-surface border-r border-db-border flex flex-col">
      <div className="p-4 border-b border-db-border">
        <h2 className="text-sm font-semibold text-db-text-muted uppercase tracking-wider">
          Connections
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {connections.length === 0 ? (
          <p className="p-4 text-sm text-db-text-faint">No saved connections</p>
        ) : (
          <ul>
            {connections.map(conn => (
              <li
                key={conn.id}
                className={`group flex items-center justify-between px-4 py-3 cursor-pointer border-l-2 transition-colors ${
                  selectedId === conn.id
                    ? 'bg-db-elevated border-db-accent'
                    : 'border-transparent hover:bg-db-elevated/50'
                }`}
                onClick={() => onSelect(conn)}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-db-text">{conn.name}</p>
                  <p className="text-xs text-db-text-muted truncate">
                    {conn.user}@{conn.host}:{conn.port}/{conn.database}
                  </p>
                </div>
                <button
                  onClick={e => {
                    e.stopPropagation()
                    onDelete(conn.id)
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:text-db-error transition-opacity"
                  title="Delete connection"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="p-4 border-t border-db-border">
        <button
          onClick={() => onSelect(null as unknown as SavedConnection)}
          className="w-full px-3 py-2 bg-db-accent hover:bg-db-accent-hover rounded text-sm font-medium transition-colors text-white"
        >
          + New Connection
        </button>
      </div>
    </div>
  )
}
