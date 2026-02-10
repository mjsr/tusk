import { NextRequest, NextResponse } from 'next/server'
import { parseLicenseKey, type License, type LicenseValidationResult } from '@/lib/license'

export const runtime = 'edge'

// In production, this would query a database
// For now, we'll use a simple in-memory store for demo purposes
const DEMO_LICENSES: Record<string, License> = {
  'TUSK-PRO-DEMO1234-ABCD': {
    key: 'TUSK-PRO-DEMO1234-ABCD',
    tier: 'pro',
    email: 'demo@example.com',
    expiresAt: null,
    createdAt: new Date().toISOString(),
  },
  'TUSK-TEAM-DEMO5678-EFGH': {
    key: 'TUSK-TEAM-DEMO5678-EFGH',
    tier: 'team',
    email: 'team@example.com',
    expiresAt: null,
    maxSeats: 10,
    createdAt: new Date().toISOString(),
  },
}

export async function POST(request: NextRequest): Promise<NextResponse<LicenseValidationResult>> {
  try {
    const body = await request.json()
    const { licenseKey, machineId } = body

    if (!licenseKey) {
      return NextResponse.json({
        valid: false,
        error: 'License key is required',
      }, { status: 400 })
    }

    // Parse the license key format
    const parsed = parseLicenseKey(licenseKey)
    if (!parsed) {
      return NextResponse.json({
        valid: false,
        error: 'Invalid license key format',
      }, { status: 400 })
    }

    // Look up the license
    // In production: query database, check expiration, verify machine ID, etc.
    const license = DEMO_LICENSES[licenseKey]

    if (!license) {
      return NextResponse.json({
        valid: false,
        error: 'License key not found',
      }, { status: 404 })
    }

    // Check expiration
    if (license.expiresAt && new Date(license.expiresAt) < new Date()) {
      return NextResponse.json({
        valid: false,
        error: 'License has expired',
      }, { status: 403 })
    }

    // TODO: In production, you would also:
    // - Verify machine ID against registered machines
    // - Check seat count for team licenses
    // - Log the validation for analytics

    return NextResponse.json({
      valid: true,
      license: {
        ...license,
        key: '***' + license.key.slice(-8), // Partially mask the key
      },
    })
  } catch (error) {
    console.error('License validation error:', error)
    return NextResponse.json({
      valid: false,
      error: 'Internal server error',
    }, { status: 500 })
  }
}
