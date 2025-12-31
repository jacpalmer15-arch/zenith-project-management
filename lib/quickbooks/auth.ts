import { QuickBooksClient, refreshAccessToken } from './client'
import { decrypt, encrypt } from './encryption'
import { getQboConnection, updateQboConnection } from '@/lib/data/qb-connections'

/**
 * Get an authenticated QuickBooks client
 * Automatically refreshes token if expired
 */
export async function getAuthenticatedQbClient(): Promise<QuickBooksClient> {
  const connection = await getQboConnection()
  
  if (!connection) {
    throw new Error('QuickBooks is not connected')
  }
  
  if (!connection.access_token_enc || !connection.refresh_token_enc) {
    throw new Error('QuickBooks tokens are missing')
  }
  
  // Check if token is expired or about to expire (within 5 minutes)
  const now = new Date()
  const expiresAt = connection.expires_at ? new Date(connection.expires_at) : null
  const shouldRefresh = !expiresAt || expiresAt.getTime() - now.getTime() < 5 * 60 * 1000
  
  let accessToken = decrypt(connection.access_token_enc)
  
  if (shouldRefresh) {
    // Refresh the token
    const refreshToken = decrypt(connection.refresh_token_enc)
    const tokens = await refreshAccessToken(refreshToken)
    
    // Update connection with new tokens
    const newExpiresAt = new Date()
    newExpiresAt.setSeconds(newExpiresAt.getSeconds() + tokens.expires_in)
    
    await updateQboConnection(connection.id, {
      access_token_enc: encrypt(tokens.access_token),
      refresh_token_enc: encrypt(tokens.refresh_token),
      expires_at: newExpiresAt.toISOString(),
    })
    
    accessToken = tokens.access_token
  }
  
  return new QuickBooksClient(connection.realm_id, accessToken)
}
