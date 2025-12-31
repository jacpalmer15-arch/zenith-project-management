import { NextResponse } from 'next/server'
import { getQboConnection, deleteQboConnection } from '@/lib/data/qb-connections'
import { decrypt } from '@/lib/quickbooks/encryption'
import { revokeToken } from '@/lib/quickbooks/client'

/**
 * Disconnect QuickBooks integration
 */
export async function POST() {
  try {
    const connection = await getQboConnection()
    
    if (!connection) {
      return NextResponse.json(
        { error: 'No connection found' },
        { status: 404 }
      )
    }
    
    // Revoke refresh token if it exists
    if (connection.refresh_token_enc) {
      try {
        const refreshToken = decrypt(connection.refresh_token_enc)
        await revokeToken(refreshToken)
      } catch (error) {
        console.error('Failed to revoke token:', error)
        // Continue even if revocation fails
      }
    }
    
    // Delete the connection
    await deleteQboConnection(connection.id)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Disconnect error:', error)
    return NextResponse.json(
      { error: 'Failed to disconnect QuickBooks' },
      { status: 500 }
    )
  }
}
