import { ipcMain, dialog, BrowserWindow } from 'electron'
import { writeFile } from 'fs/promises'
import type { QueryResult } from '../shared/types'

interface ExportData {
  result: QueryResult
  format: 'csv' | 'json'
  filename?: string
}

// Sanitize filename to prevent path traversal and invalid characters
function sanitizeFilename(filename: string): string {
  // Remove path traversal attempts
  let safe = filename.replace(/\.\./g, '')

  // Remove path separators
  safe = safe.replace(/[/\\]/g, '')

  // Remove other potentially dangerous characters
  safe = safe.replace(/[<>:"|?*\x00-\x1f]/g, '')

  // Limit length
  if (safe.length > 100) {
    safe = safe.substring(0, 100)
  }

  // Ensure we have something
  if (!safe || safe.trim() === '') {
    safe = 'export'
  }

  return safe.trim()
}

function resultToCSV(result: QueryResult): string {
  const headers = result.fields.map(f => f.name)

  // Escape CSV values
  const escapeCSV = (value: unknown): string => {
    if (value === null || value === undefined) return ''
    const str = typeof value === 'object' ? JSON.stringify(value) : String(value)
    // Escape quotes and wrap in quotes if contains comma, quote, or newline
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`
    }
    return str
  }

  const headerRow = headers.map(escapeCSV).join(',')
  const dataRows = result.rows.map(row =>
    headers.map(header => escapeCSV(row[header])).join(',')
  )

  return [headerRow, ...dataRows].join('\n')
}

function resultToJSON(result: QueryResult): string {
  return JSON.stringify(result.rows, null, 2)
}

export function setupExportHandlers() {
  ipcMain.handle('export:save', async (event, data: ExportData): Promise<{ success: boolean; path?: string; error?: string }> => {
    const { result, format, filename } = data

    const window = BrowserWindow.fromWebContents(event.sender)
    if (!window) {
      return { success: false, error: 'No window found' }
    }

    // Sanitize the filename to prevent path traversal attacks
    const rawFilename = filename || `export-${Date.now()}`
    const defaultFilename = sanitizeFilename(rawFilename)
    const extension = format === 'csv' ? 'csv' : 'json'

    const { filePath, canceled } = await dialog.showSaveDialog(window, {
      title: `Export as ${format.toUpperCase()}`,
      defaultPath: `${defaultFilename}.${extension}`,
      filters: [
        format === 'csv'
          ? { name: 'CSV Files', extensions: ['csv'] }
          : { name: 'JSON Files', extensions: ['json'] }
      ]
    })

    if (canceled || !filePath) {
      return { success: false, error: 'Export canceled' }
    }

    try {
      const content = format === 'csv'
        ? resultToCSV(result)
        : resultToJSON(result)

      await writeFile(filePath, content, 'utf-8')
      return { success: true, path: filePath }
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to write file'
      }
    }
  })
}
