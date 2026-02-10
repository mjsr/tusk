import { useState, useEffect } from 'react'
import type { ConnectionConfig, SavedConnection } from '../../../shared/types'
import ConnectionForm from './ConnectionForm'
import ConnectionList from './ConnectionList'
import ThemeToggle from '../ThemeToggle'
import { UserMenu } from '../UserMenu'

interface Props {
  onConnect: (name: string) => void
}

export default function ConnectionManager({ onConnect }: Props) {
  const [savedConnections, setSavedConnections] = useState<SavedConnection[]>([])
  const [selectedConnection, setSelectedConnection] = useState<SavedConnection | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)

  useEffect(() => {
    loadConnections()
  }, [])

  const loadConnections = async () => {
    const connections = await window.api.getConnections()
    setSavedConnections(connections)
  }

  const handleSave = async (config: ConnectionConfig) => {
    const saved: SavedConnection = {
      id: config.id,
      name: config.name,
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.user,
      password: config.password,
      ssl: config.ssl
    }
    await window.api.saveConnection(saved)
    await loadConnections()
    setSelectedConnection(saved)
  }

  const handleDelete = async (id: string) => {
    await window.api.deleteConnection(id)
    await loadConnections()
    if (selectedConnection?.id === id) {
      setSelectedConnection(null)
    }
  }

  const handleTest = async (config: ConnectionConfig) => {
    setIsLoading(true)
    setError(null)
    setTestResult(null)

    try {
      const result = await window.api.testConnection(config)
      setTestResult(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Test failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleConnect = async (config: ConnectionConfig) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await window.api.connect(config)
      if (result.success) {
        await window.api.updateLastConnected(config.id)
        onConnect(config.name)
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-screen flex flex-col bg-db-bg">
      {/* Title bar drag region (pl-20 leaves room for macOS traffic lights) */}
      <div className="h-10 drag-region flex items-center justify-between pr-4 pl-20 bg-db-surface border-b border-db-border">
        <span className="text-sm text-db-text-muted">Tusk</span>
        <div className="no-drag flex items-center gap-3">
          <ThemeToggle />
          <div className="w-px h-4 bg-db-border" />
          <UserMenu />
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Sidebar with saved connections */}
        <ConnectionList
          connections={savedConnections}
          selectedId={selectedConnection?.id}
          onSelect={setSelectedConnection}
          onDelete={handleDelete}
        />

        {/* Main content - connection form */}
        <div className="flex-1 p-6 overflow-y-auto">
          <h1 className="text-2xl font-semibold mb-6">
            {selectedConnection ? 'Edit Connection' : 'New Connection'}
          </h1>

          <ConnectionForm
            key={selectedConnection?.id ?? 'new'}
            initialData={selectedConnection}
            onSave={handleSave}
            onTest={handleTest}
            onConnect={handleConnect}
            isLoading={isLoading}
          />

          {error && (
            <div className="mt-4 p-3 bg-db-error-muted border border-db-error/30 rounded text-db-error">
              {error}
            </div>
          )}

          {testResult && (
            <div
              className={`mt-4 p-3 rounded border ${
                testResult.success
                  ? 'bg-db-success-muted border-db-success/30 text-db-success'
                  : 'bg-db-error-muted border-db-error/30 text-db-error'
              }`}
            >
              {testResult.message}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
