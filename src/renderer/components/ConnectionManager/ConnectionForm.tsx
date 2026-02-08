import { useState, useEffect } from 'react'
import type { ConnectionConfig, SavedConnection } from '../../../shared/types'

interface Props {
  initialData?: SavedConnection | null
  onSave: (config: ConnectionConfig) => void
  onTest: (config: ConnectionConfig) => void
  onConnect: (config: ConnectionConfig) => void
  isLoading: boolean
}

export default function ConnectionForm({ initialData, onSave, onTest, onConnect, isLoading }: Props) {
  const [form, setForm] = useState<ConnectionConfig>({
    id: '',
    name: '',
    host: 'localhost',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: '',
    ssl: false
  })

  useEffect(() => {
    if (initialData) {
      setForm({
        ...initialData,
        password: initialData.password ?? ''
      })
    } else {
      setForm({
        id: crypto.randomUUID(),
        name: '',
        host: 'localhost',
        port: 5432,
        database: 'postgres',
        user: 'postgres',
        password: '',
        ssl: false
      })
    }
  }, [initialData])

  const handleChange = (field: keyof ConnectionConfig, value: string | number | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const inputClass =
    'w-full px-3 py-2 bg-db-elevated border border-db-border rounded focus:outline-none focus:border-db-accent text-db-text'
  const labelClass = 'block text-sm font-medium text-db-text-muted mb-1'

  return (
    <div className="max-w-md space-y-4">
      <div>
        <label className={labelClass}>Connection Name</label>
        <input
          type="text"
          value={form.name}
          onChange={e => handleChange('name', e.target.value)}
          placeholder="My Database"
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <label className={labelClass}>Host</label>
          <input
            type="text"
            value={form.host}
            onChange={e => handleChange('host', e.target.value)}
            placeholder="localhost"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Port</label>
          <input
            type="number"
            value={form.port}
            onChange={e => handleChange('port', parseInt(e.target.value) || 5432)}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Database</label>
        <input
          type="text"
          value={form.database}
          onChange={e => handleChange('database', e.target.value)}
          placeholder="postgres"
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>User</label>
        <input
          type="text"
          value={form.user}
          onChange={e => handleChange('user', e.target.value)}
          placeholder="postgres"
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>Password</label>
        <input
          type="password"
          value={form.password}
          onChange={e => handleChange('password', e.target.value)}
          placeholder="••••••••"
          className={inputClass}
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="ssl"
          checked={form.ssl}
          onChange={e => handleChange('ssl', e.target.checked)}
          className="w-4 h-4 rounded border-db-border bg-db-elevated text-db-accent focus:ring-db-accent"
        />
        <label htmlFor="ssl" className="text-sm text-db-text-muted">
          Use SSL connection
        </label>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          onClick={() => onSave(form)}
          disabled={isLoading || !form.name}
          className="px-4 py-2 bg-db-elevated hover:bg-db-overlay disabled:opacity-50 rounded text-sm font-medium transition-colors text-db-text"
        >
          Save
        </button>
        <button
          onClick={() => onTest(form)}
          disabled={isLoading}
          className="px-4 py-2 bg-db-elevated hover:bg-db-overlay disabled:opacity-50 rounded text-sm font-medium transition-colors text-db-text"
        >
          {isLoading ? 'Testing...' : 'Test Connection'}
        </button>
        <button
          onClick={() => onConnect(form)}
          disabled={isLoading}
          className="px-4 py-2 bg-db-accent hover:bg-db-accent-hover disabled:opacity-50 rounded text-sm font-medium transition-colors text-white"
        >
          {isLoading ? 'Connecting...' : 'Connect'}
        </button>
      </div>
    </div>
  )
}
