import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock window.api for Electron IPC
const mockApi = {
  testConnection: vi.fn(),
  connect: vi.fn(),
  disconnect: vi.fn(),
  query: vi.fn(),
  getConnections: vi.fn().mockResolvedValue([]),
  saveConnection: vi.fn(),
  deleteConnection: vi.fn(),
  updateLastConnected: vi.fn()
}

Object.defineProperty(window, 'api', {
  value: mockApi,
  writable: true
})

// Mock Monaco Editor
vi.mock('@monaco-editor/react', () => ({
  default: ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <textarea
      data-testid="monaco-editor"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
  loader: {
    config: vi.fn()
  }
}))

vi.mock('monaco-editor', () => ({}))
