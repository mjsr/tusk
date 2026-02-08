import { NextRequest, NextResponse } from 'next/server'
import { parseLicenseKey, hasFeature } from '@/lib/license'

interface AIQueryRequest {
  licenseKey: string
  prompt: string          // Natural language query
  schema?: string         // Optional: database schema for context
  dialect?: string        // e.g., 'postgresql', 'mysql'
}

interface AIQueryResponse {
  success: boolean
  sql?: string
  explanation?: string
  error?: string
}

export async function POST(request: NextRequest): Promise<NextResponse<AIQueryResponse>> {
  try {
    const body: AIQueryRequest = await request.json()
    const { licenseKey, prompt, schema, dialect = 'postgresql' } = body

    // Validate license has AI feature access
    if (!licenseKey) {
      return NextResponse.json({
        success: false,
        error: 'License key required for AI features',
      }, { status: 401 })
    }

    const parsed = parseLicenseKey(licenseKey)
    if (!parsed || !hasFeature(parsed.tier, 'ai_queries')) {
      return NextResponse.json({
        success: false,
        error: 'AI features require a Pro or Team license',
      }, { status: 403 })
    }

    // TODO: In production, call your LLM provider here
    // Example with OpenAI:
    //
    // const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    // const completion = await openai.chat.completions.create({
    //   model: 'gpt-4',
    //   messages: [
    //     {
    //       role: 'system',
    //       content: `You are a SQL expert. Generate ${dialect} queries based on natural language.
    //                 ${schema ? `Database schema:\n${schema}` : ''}`
    //     },
    //     { role: 'user', content: prompt }
    //   ]
    // })

    // For demo purposes, return a mock response
    const mockResponses: Record<string, { sql: string; explanation: string }> = {
      default: {
        sql: `-- AI-generated query for: "${prompt}"\nSELECT * FROM users\nWHERE created_at > NOW() - INTERVAL '7 days'\nORDER BY created_at DESC;`,
        explanation: 'This query retrieves all users created in the last 7 days, ordered by creation date.',
      },
    }

    // Simple keyword matching for demo
    let response = mockResponses.default

    if (prompt.toLowerCase().includes('count')) {
      response = {
        sql: `SELECT COUNT(*) as total FROM users;`,
        explanation: 'This query counts all records in the users table.',
      }
    } else if (prompt.toLowerCase().includes('last week') || prompt.toLowerCase().includes('signed up')) {
      response = {
        sql: `SELECT id, email, created_at\nFROM users\nWHERE created_at >= NOW() - INTERVAL '7 days'\nORDER BY created_at DESC;`,
        explanation: 'This query finds all users who signed up in the last 7 days.',
      }
    }

    return NextResponse.json({
      success: true,
      sql: response.sql,
      explanation: response.explanation,
    })
  } catch (error) {
    console.error('AI query error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to generate query',
    }, { status: 500 })
  }
}
