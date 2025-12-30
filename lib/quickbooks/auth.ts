import { QuickBooksClient, refreshAccessToken } from './client'
import { decrypt, encrypt } from './encryption'
import { getQbConnection, updateQbConnection } from '@/lib/data/qb-connections'

/**
 * Get an authenticated QuickBooks client
 * Automatically refreshes token if expired
 */
export async function getAuthenticatedQbClient(): Promise<QuickBooksClient> {
  const connection = await getQbConnection()
  
  if (!connection || !connection.is_connected) {
    throw new Error('QuickBooks is not connected')
  }
  
  if (!connection.access_token || !connection.refresh_token) {
    throw new Error('QuickBooks tokens are missing')
  }
  
  // Check if token is expired or about to expire (within 5 minutes)
  const now = new Date()
  const expiresAt = connection.token_expires_at ? new Date(connection.token_expires_at) : null
  const shouldRefresh = !expiresAt || expiresAt.getTime() - now.getTime() < 5 * 60 * 1000
  
  let accessToken = decrypt(connection.access_token)
  
  if (shouldRefresh) {
    // Refresh the token
    const refreshToken = decrypt(connection.refresh_token)
    const tokens = await refreshAccessToken(refreshToken)
    
    // Update connection with new tokens
    const expiresAt = new Date()
    expiresAt.setSeconds(expiresAt.getSeconds() + tokens.expires_in)
    
    await updateQbConnection(connection.id, {
      access_token: encrypt(tokens.access_token),
      refresh_token: encrypt(tokens.refresh_token),
      token_expires_at: expiresAt.toISOString(),
    })
    
    accessToken = tokens.access_token
  }
  
  return new QuickBooksClient(connection.realm_id, accessToken)
}
