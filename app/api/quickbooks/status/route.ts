import { NextResponse } from 'next/server'
import { getQboConnection } from '@/lib/data/qb-connections'

// Force dynamic rendering since this route uses cookies
export const dynamic = 'force-dynamic'

/**
 * Get QuickBooks connection status
 */
export async function GET() {
  try {
    const connection = await getQboConnection()
    
    if (!connection) {
      return NextResponse.json({
        connected: false,
        connection: null,
      })
    }
    
    // Check if connection is still valid (not expired)
    const now = new Date()
    const expiresAt = new Date(connection.expires_at)
    const isExpired = expiresAt.getTime() < now.getTime()
    
    // Return connection status without sensitive data
    return NextResponse.json({
      connected: !isExpired,
      connection: {
        id: connection.id,
        realm_id: connection.realm_id,
        expires_at: connection.expires_at,
        is_expired: isExpired,
        created_at: connection.created_at,
        updated_at: connection.updated_at,
        // Omit tokens for security
      },
    })
  } catch (error) {
    console.error('Status check error:', error)
    return NextResponse.json(
      { error: 'Failed to check connection status' },
      { status: 500 }
    )
  }
}
