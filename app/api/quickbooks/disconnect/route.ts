import { NextResponse } from 'next/server'
import { getQbConnection, updateQbConnection } from '@/lib/data/qb-connections'
import { decrypt } from '@/lib/quickbooks/encryption'
import { revokeToken } from '@/lib/quickbooks/client'

/**
 * Disconnect QuickBooks integration
 */
export async function POST() {
  try {
    const connection = await getQbConnection()
    
    if (!connection) {
      return NextResponse.json(
        { error: 'No connection found' },
        { status: 404 }
      )
    }
    
    // Revoke refresh token if it exists
    if (connection.refresh_token) {
      try {
        const refreshToken = decrypt(connection.refresh_token)
        await revokeToken(refreshToken)
      } catch (error) {
        console.error('Failed to revoke token:', error)
        // Continue even if revocation fails
      }
    }
    
    // Mark connection as disconnected and clear tokens
    await updateQbConnection(connection.id, {
      is_connected: false,
      access_token: null,
      refresh_token: null,
      token_expires_at: null,
      sync_status: 'idle',
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Disconnect error:', error)
    return NextResponse.json(
      { error: 'Failed to disconnect QuickBooks' },
      { status: 500 }
    )
  }
}
