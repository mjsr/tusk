import type * as Monaco from 'monaco-editor'
import type { SchemaMetadata } from '../contexts/SchemaContext'

// SQL keywords for completion
const SQL_KEYWORDS = [
  'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'NOT', 'IN', 'LIKE', 'BETWEEN',
  'JOIN', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL JOIN', 'CROSS JOIN',
  'ON', 'AS', 'ORDER BY', 'GROUP BY', 'HAVING', 'LIMIT', 'OFFSET',
  'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE FROM',
  'CREATE TABLE', 'ALTER TABLE', 'DROP TABLE', 'TRUNCATE',
  'CREATE INDEX', 'DROP INDEX', 'CREATE VIEW', 'DROP VIEW',
  'DISTINCT', 'ALL', 'UNION', 'INTERSECT', 'EXCEPT',
  'CASE', 'WHEN', 'THEN', 'ELSE', 'END',
  'NULL', 'IS NULL', 'IS NOT NULL', 'TRUE', 'FALSE',
  'ASC', 'DESC', 'NULLS FIRST', 'NULLS LAST',
  'EXISTS', 'ANY', 'SOME',
  'WITH', 'RECURSIVE',
  'RETURNING', 'CONFLICT', 'DO NOTHING', 'DO UPDATE',
]

// Common SQL functions
const SQL_FUNCTIONS = [
  // Aggregate functions
  { name: 'COUNT', signature: 'COUNT(expression)', description: 'Count rows' },
  { name: 'SUM', signature: 'SUM(expression)', description: 'Sum of values' },
  { name: 'AVG', signature: 'AVG(expression)', description: 'Average of values' },
  { name: 'MIN', signature: 'MIN(expression)', description: 'Minimum value' },
  { name: 'MAX', signature: 'MAX(expression)', description: 'Maximum value' },
  { name: 'ARRAY_AGG', signature: 'ARRAY_AGG(expression)', description: 'Aggregate into array' },
  { name: 'STRING_AGG', signature: 'STRING_AGG(expression, delimiter)', description: 'Concatenate strings' },

  // String functions
  { name: 'CONCAT', signature: 'CONCAT(str1, str2, ...)', description: 'Concatenate strings' },
  { name: 'SUBSTRING', signature: 'SUBSTRING(string FROM start FOR length)', description: 'Extract substring' },
  { name: 'LENGTH', signature: 'LENGTH(string)', description: 'String length' },
  { name: 'LOWER', signature: 'LOWER(string)', description: 'Convert to lowercase' },
  { name: 'UPPER', signature: 'UPPER(string)', description: 'Convert to uppercase' },
  { name: 'TRIM', signature: 'TRIM(string)', description: 'Remove whitespace' },
  { name: 'REPLACE', signature: 'REPLACE(string, from, to)', description: 'Replace substring' },
  { name: 'SPLIT_PART', signature: 'SPLIT_PART(string, delimiter, position)', description: 'Split and get part' },

  // Date/time functions
  { name: 'NOW', signature: 'NOW()', description: 'Current timestamp' },
  { name: 'CURRENT_DATE', signature: 'CURRENT_DATE', description: 'Current date' },
  { name: 'CURRENT_TIME', signature: 'CURRENT_TIME', description: 'Current time' },
  { name: 'DATE_TRUNC', signature: "DATE_TRUNC('precision', timestamp)", description: 'Truncate to precision' },
  { name: 'EXTRACT', signature: 'EXTRACT(field FROM timestamp)', description: 'Extract date part' },
  { name: 'AGE', signature: 'AGE(timestamp1, timestamp2)', description: 'Interval between timestamps' },
  { name: 'DATE_PART', signature: "DATE_PART('field', timestamp)", description: 'Get date field' },

  // Numeric functions
  { name: 'ROUND', signature: 'ROUND(number, decimals)', description: 'Round to decimals' },
  { name: 'FLOOR', signature: 'FLOOR(number)', description: 'Round down' },
  { name: 'CEIL', signature: 'CEIL(number)', description: 'Round up' },
  { name: 'ABS', signature: 'ABS(number)', description: 'Absolute value' },
  { name: 'RANDOM', signature: 'RANDOM()', description: 'Random value 0-1' },

  // Conditional functions
  { name: 'COALESCE', signature: 'COALESCE(value1, value2, ...)', description: 'First non-null value' },
  { name: 'NULLIF', signature: 'NULLIF(value1, value2)', description: 'Return null if equal' },
  { name: 'GREATEST', signature: 'GREATEST(value1, value2, ...)', description: 'Largest value' },
  { name: 'LEAST', signature: 'LEAST(value1, value2, ...)', description: 'Smallest value' },

  // Type casting
  { name: 'CAST', signature: 'CAST(value AS type)', description: 'Convert type' },
  { name: 'TO_CHAR', signature: 'TO_CHAR(value, format)', description: 'Format as string' },
  { name: 'TO_DATE', signature: 'TO_DATE(string, format)', description: 'Parse date' },
  { name: 'TO_TIMESTAMP', signature: 'TO_TIMESTAMP(string, format)', description: 'Parse timestamp' },

  // JSON functions
  { name: 'JSON_BUILD_OBJECT', signature: 'JSON_BUILD_OBJECT(key1, value1, ...)', description: 'Build JSON object' },
  { name: 'JSON_AGG', signature: 'JSON_AGG(expression)', description: 'Aggregate as JSON array' },
  { name: 'JSONB_EXTRACT_PATH', signature: 'JSONB_EXTRACT_PATH(json, path...)', description: 'Extract JSON path' },
]

// Context detection: what kind of completion is needed
type CompletionContext =
  | 'table'      // After FROM, JOIN, INTO, UPDATE
  | 'column'     // After SELECT, WHERE, ON, SET, or after table.
  | 'schema'     // At start or after specific keywords
  | 'function'   // In general context
  | 'keyword'    // Default

function detectContext(
  textBeforeCursor: string,
  _wordBeforeCursor: string
): { context: CompletionContext; tableHint?: string; schemaHint?: string } {
  const upperText = textBeforeCursor.toUpperCase().trim()

  // Check for table.column pattern
  const dotMatch = textBeforeCursor.match(/(\w+)\.(\w*)$/i)
  if (dotMatch) {
    const beforeDot = dotMatch[1]
    // Could be schema.table or table.column
    // For now, assume table.column
    return { context: 'column', tableHint: beforeDot }
  }

  // After FROM, JOIN keywords -> suggest tables
  if (/\b(FROM|JOIN|INTO|UPDATE)\s*$/i.test(upperText)) {
    return { context: 'table' }
  }

  // After SELECT, WHERE, ON, SET, ORDER BY, GROUP BY -> suggest columns
  if (/\b(SELECT|WHERE|AND|OR|ON|SET|ORDER\s+BY|GROUP\s+BY|HAVING)\s+(\w*)$/i.test(upperText)) {
    return { context: 'column' }
  }

  // After comma in SELECT -> suggest columns
  if (/\bSELECT\b.*,\s*$/i.test(upperText)) {
    return { context: 'column' }
  }

  return { context: 'keyword' }
}

// Extract table names from the query to suggest their columns
function extractTablesFromQuery(text: string): string[] {
  const tables: string[] = []

  // Match FROM table, JOIN table patterns
  const fromMatch = text.matchAll(/\b(?:FROM|JOIN)\s+(?:(\w+)\.)?(\w+)(?:\s+(?:AS\s+)?(\w+))?/gi)
  for (const match of fromMatch) {
    const tableName = match[2]
    const alias = match[3]
    if (tableName) tables.push(tableName)
    if (alias) tables.push(alias)
  }

  return [...new Set(tables)]
}

export function createSqlCompletionProvider(
  monaco: typeof Monaco,
  getMetadata: () => SchemaMetadata | null
): Monaco.languages.CompletionItemProvider {
  return {
    triggerCharacters: ['.', ' ', '('],

    provideCompletionItems(
      model: Monaco.editor.ITextModel,
      position: Monaco.Position
    ): Monaco.languages.ProviderResult<Monaco.languages.CompletionList> {
      const metadata = getMetadata()

      const textUntilPosition = model.getValueInRange({
        startLineNumber: 1,
        startColumn: 1,
        endLineNumber: position.lineNumber,
        endColumn: position.column
      })

      const wordInfo = model.getWordUntilPosition(position)
      const word = wordInfo.word.toLowerCase()

      const range: Monaco.IRange = {
        startLineNumber: position.lineNumber,
        startColumn: wordInfo.startColumn,
        endLineNumber: position.lineNumber,
        endColumn: wordInfo.endColumn
      }

      const { context, tableHint } = detectContext(textUntilPosition, word)
      const suggestions: Monaco.languages.CompletionItem[] = []

      // Table.column pattern
      if (tableHint && metadata) {
        // Find the table in metadata
        for (const [schemaName, tables] of metadata.tables) {
          const table = tables.find(t =>
            t.name.toLowerCase() === tableHint.toLowerCase()
          )
          if (table) {
            const columns = metadata.columns.get(`${schemaName}.${table.name}`) || []
            for (const col of columns) {
              suggestions.push({
                label: col.name,
                kind: monaco.languages.CompletionItemKind.Field,
                detail: col.dataType + (col.isPrimaryKey ? ' (PK)' : ''),
                documentation: `Column in ${table.name}`,
                insertText: col.name,
                range
              })
            }
            break
          }
        }

        // Also check if it might be a schema name
        if (metadata.schemas.includes(tableHint)) {
          const tables = metadata.tables.get(tableHint) || []
          for (const table of tables) {
            suggestions.push({
              label: table.name,
              kind: table.type === 'view'
                ? monaco.languages.CompletionItemKind.Interface
                : monaco.languages.CompletionItemKind.Class,
              detail: table.type,
              insertText: table.name,
              range
            })
          }
        }

        return { suggestions }
      }

      // Table suggestions
      if (context === 'table' && metadata) {
        for (const [schemaName, tables] of metadata.tables) {
          for (const table of tables) {
            const isPublic = schemaName === 'public'
            suggestions.push({
              label: isPublic ? table.name : `${schemaName}.${table.name}`,
              kind: table.type === 'view'
                ? monaco.languages.CompletionItemKind.Interface
                : monaco.languages.CompletionItemKind.Class,
              detail: `${table.type} in ${schemaName}`,
              insertText: isPublic ? table.name : `${schemaName}.${table.name}`,
              range,
              sortText: isPublic ? `0${table.name}` : `1${schemaName}.${table.name}`
            })
          }
        }
      }

      // Column suggestions
      if (context === 'column' && metadata) {
        const tablesInQuery = extractTablesFromQuery(textUntilPosition)

        // If we have tables in the query, prioritize their columns
        for (const tableName of tablesInQuery) {
          for (const [schemaName, tables] of metadata.tables) {
            const table = tables.find(t => t.name.toLowerCase() === tableName.toLowerCase())
            if (table) {
              const columns = metadata.columns.get(`${schemaName}.${table.name}`) || []
              for (const col of columns) {
                suggestions.push({
                  label: col.name,
                  kind: monaco.languages.CompletionItemKind.Field,
                  detail: `${col.dataType}${col.isPrimaryKey ? ' (PK)' : ''} - ${table.name}`,
                  insertText: col.name,
                  range,
                  sortText: `0${col.name}`
                })
              }
            }
          }
        }

        // Add * for SELECT
        if (/\bSELECT\s*$/i.test(textUntilPosition.trim())) {
          suggestions.push({
            label: '*',
            kind: monaco.languages.CompletionItemKind.Operator,
            detail: 'All columns',
            insertText: '*',
            range,
            sortText: '000*'
          })
        }
      }

      // Function suggestions
      for (const func of SQL_FUNCTIONS) {
        if (func.name.toLowerCase().startsWith(word) || word === '') {
          suggestions.push({
            label: func.name,
            kind: monaco.languages.CompletionItemKind.Function,
            detail: func.signature,
            documentation: func.description,
            insertText: func.name + '($0)',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range,
            sortText: `2${func.name}`
          })
        }
      }

      // Keyword suggestions
      for (const keyword of SQL_KEYWORDS) {
        if (keyword.toLowerCase().startsWith(word) || word === '') {
          suggestions.push({
            label: keyword,
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: keyword,
            range,
            sortText: `3${keyword}`
          })
        }
      }

      return { suggestions }
    }
  }
}

// Register the completion provider
let disposable: Monaco.IDisposable | null = null

export function registerSqlCompletionProvider(
  monaco: typeof Monaco,
  getMetadata: () => SchemaMetadata | null
): () => void {
  // Dispose previous provider if exists
  if (disposable) {
    disposable.dispose()
  }

  const provider = createSqlCompletionProvider(monaco, getMetadata)
  disposable = monaco.languages.registerCompletionItemProvider('sql', provider)

  return () => {
    if (disposable) {
      disposable.dispose()
      disposable = null
    }
  }
}
