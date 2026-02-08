import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import ResultsTable from '../../renderer/components/ResultsTable/ResultsTable'

describe('ResultsTable', () => {
  it('renders loading state', () => {
    render(<ResultsTable result={null} error={null} isLoading={true} />)
    expect(screen.getByText('Executing query...')).toBeInTheDocument()
  })

  it('renders error state', () => {
    render(
      <ResultsTable
        result={null}
        error="relation does not exist"
        isLoading={false}
      />
    )
    expect(screen.getByText('Query Error')).toBeInTheDocument()
    expect(screen.getByText('relation does not exist')).toBeInTheDocument()
  })

  it('renders empty state when no result', () => {
    render(<ResultsTable result={null} error={null} isLoading={false} />)
    expect(screen.getByText('No results yet')).toBeInTheDocument()
  })

  it('renders success message for zero row results', () => {
    const result = {
      rows: [],
      fields: [],
      rowCount: 0,
      command: 'DELETE'
    }
    render(<ResultsTable result={result} error={null} isLoading={false} />)
    expect(screen.getByText('Query Successful')).toBeInTheDocument()
    expect(screen.getByText(/0 rows affected/)).toBeInTheDocument()
  })

  it('renders table with data', () => {
    const result = {
      rows: [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' }
      ],
      fields: [
        { name: 'id', dataTypeID: 23 },
        { name: 'name', dataTypeID: 25 }
      ],
      rowCount: 2,
      command: 'SELECT'
    }
    render(<ResultsTable result={result} error={null} isLoading={false} />)

    // Check headers
    expect(screen.getByText('id')).toBeInTheDocument()
    expect(screen.getByText('name')).toBeInTheDocument()

    // Check data
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()

    // Check row count
    expect(screen.getByText('2 rows')).toBeInTheDocument()
  })

  it('renders NULL values with special styling', () => {
    const result = {
      rows: [{ value: null }],
      fields: [{ name: 'value', dataTypeID: 25 }],
      rowCount: 1,
      command: 'SELECT'
    }
    render(<ResultsTable result={result} error={null} isLoading={false} />)
    expect(screen.getByText('NULL')).toBeInTheDocument()
  })

  it('renders boolean values with appropriate styling', () => {
    const result = {
      rows: [
        { active: true },
        { active: false }
      ],
      fields: [{ name: 'active', dataTypeID: 16 }],
      rowCount: 2,
      command: 'SELECT'
    }
    render(<ResultsTable result={result} error={null} isLoading={false} />)
    expect(screen.getByText('true')).toBeInTheDocument()
    expect(screen.getByText('false')).toBeInTheDocument()
  })
})
