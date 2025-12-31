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
    
    // Return connection status without sensitive data
    return NextResponse.json({
      connected: connection.is_connected,
      connection: {
        id: connection.id,
        realm_id: connection.realm_id,
        company_file_id: connection.company_file_id,
        is_connected: connection.is_connected,
        last_sync_at: connection.last_sync_at,
        sync_status: connection.sync_status,
        sync_error: connection.sync_error,
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
