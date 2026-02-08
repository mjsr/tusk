import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import QueryHistory from '../../renderer/components/QueryEditor/QueryHistory'

describe('QueryHistory', () => {
  const mockOnSelect = vi.fn()
  const mockOnClear = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders empty state when no history', () => {
    render(
      <QueryHistory
        history={[]}
        onSelect={mockOnSelect}
        onClear={mockOnClear}
      />
    )
    expect(screen.getByText('No history yet')).toBeInTheDocument()
    expect(screen.getByText('Executed queries will appear here')).toBeInTheDocument()
  })

  it('renders history entries', () => {
    const history = [
      {
        id: '1',
        query: 'SELECT * FROM users',
        timestamp: new Date(),
        success: true,
        rowCount: 10
      },
      {
        id: '2',
        query: 'DROP TABLE users',
        timestamp: new Date(),
        success: false
      }
    ]

    render(
      <QueryHistory
        history={history}
        onSelect={mockOnSelect}
        onClear={mockOnClear}
      />
    )

    expect(screen.getByText('SELECT * FROM users')).toBeInTheDocument()
    expect(screen.getByText('DROP TABLE users')).toBeInTheDocument()
    expect(screen.getByText('10 rows')).toBeInTheDocument()
    expect(screen.getByText('Error')).toBeInTheDocument()
  })

  it('calls onSelect when clicking a history entry', () => {
    const history = [
      {
        id: '1',
        query: 'SELECT * FROM users',
        timestamp: new Date(),
        success: true,
        rowCount: 10
      }
    ]

    render(
      <QueryHistory
        history={history}
        onSelect={mockOnSelect}
        onClear={mockOnClear}
      />
    )

    fireEvent.click(screen.getByText('SELECT * FROM users'))
    expect(mockOnSelect).toHaveBeenCalledWith('SELECT * FROM users')
  })

  it('calls onClear when clicking clear button', () => {
    const history = [
      {
        id: '1',
        query: 'SELECT 1',
        timestamp: new Date(),
        success: true
      }
    ]

    render(
      <QueryHistory
        history={history}
        onSelect={mockOnSelect}
        onClear={mockOnClear}
      />
    )

    fireEvent.click(screen.getByText('Clear'))
    expect(mockOnClear).toHaveBeenCalled()
  })

  it('shows history count badge', () => {
    const history = [
      { id: '1', query: 'SELECT 1', timestamp: new Date(), success: true },
      { id: '2', query: 'SELECT 2', timestamp: new Date(), success: true },
      { id: '3', query: 'SELECT 3', timestamp: new Date(), success: true }
    ]

    render(
      <QueryHistory
        history={history}
        onSelect={mockOnSelect}
        onClear={mockOnClear}
      />
    )

    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('formats timestamps correctly', () => {
    const recentDate = new Date()
    const history = [
      {
        id: '1',
        query: 'SELECT 1',
        timestamp: recentDate,
        success: true
      }
    ]

    render(
      <QueryHistory
        history={history}
        onSelect={mockOnSelect}
        onClear={mockOnClear}
      />
    )

    expect(screen.getByText('Just now')).toBeInTheDocument()
  })
})
