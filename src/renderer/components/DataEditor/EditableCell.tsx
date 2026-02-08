import { useState, useRef, useEffect } from 'react'

interface Props {
  value: unknown
  isEditing: boolean
  isModified: boolean
  onStartEdit: () => void
  onSave: (newValue: unknown) => void
  onCancel: () => void
}

export default function EditableCell({
  value,
  isEditing,
  isModified,
  onStartEdit,
  onSave,
  onCancel
}: Props) {
  const [editValue, setEditValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing) {
      setEditValue(formatForEdit(value))
      setTimeout(() => inputRef.current?.select(), 0)
    }
  }, [isEditing, value])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      onSave(parseEditValue(editValue, value))
    } else if (e.key === 'Escape') {
      onCancel()
    } else if (e.key === 'Tab') {
      onSave(parseEditValue(editValue, value))
    }
  }

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={editValue}
        onChange={e => setEditValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => onSave(parseEditValue(editValue, value))}
        className="w-full px-2 py-1 bg-db-bg border border-db-accent rounded text-sm font-mono text-db-text focus:outline-none"
        autoFocus
      />
    )
  }

  return (
    <div
      onDoubleClick={onStartEdit}
      className={`cursor-pointer px-1 py-0.5 rounded ${
        isModified ? 'bg-db-warning/20 ring-1 ring-db-warning/50' : ''
      }`}
    >
      <CellDisplay value={value} />
    </div>
  )
}

function CellDisplay({ value }: { value: unknown }) {
  if (value === null) {
    return (
      <span className="px-1.5 py-0.5 text-xs font-medium text-db-text-faint bg-db-surface rounded">
        NULL
      </span>
    )
  }

  if (typeof value === 'boolean') {
    return (
      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-xs font-medium rounded ${
        value ? 'text-db-success bg-db-success-muted' : 'text-db-error bg-db-error-muted'
      }`}>
        {String(value)}
      </span>
    )
  }

  if (typeof value === 'number') {
    return <span className="font-mono text-db-warning">{String(value)}</span>
  }

  if (value instanceof Date) {
    return <span className="font-mono text-db-accent">{value.toISOString()}</span>
  }

  if (typeof value === 'object') {
    return (
      <span className="font-mono text-xs text-db-text-muted bg-db-surface px-1.5 py-0.5 rounded">
        {JSON.stringify(value)}
      </span>
    )
  }

  return <span className="text-db-text">{String(value)}</span>
}

function formatForEdit(value: unknown): string {
  if (value === null || value === undefined) return ''
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

function parseEditValue(editValue: string, originalValue: unknown): unknown {
  // Empty string becomes null
  if (editValue === '' || editValue.toLowerCase() === 'null') {
    return null
  }

  // Try to preserve original type
  if (typeof originalValue === 'number') {
    const num = Number(editValue)
    return isNaN(num) ? editValue : num
  }

  if (typeof originalValue === 'boolean') {
    if (editValue.toLowerCase() === 'true') return true
    if (editValue.toLowerCase() === 'false') return false
    return editValue
  }

  // Try parsing as JSON for objects
  if (typeof originalValue === 'object' && originalValue !== null) {
    try {
      return JSON.parse(editValue)
    } catch {
      return editValue
    }
  }

  return editValue
}
