import { NextRequest } from 'next/server'
import { redirect } from 'next/navigation'
import { exchangeCodeForTokens } from '@/lib/quickbooks/client'
import { encrypt } from '@/lib/quickbooks/encryption'
import { saveQboConnection } from '@/lib/data/qb-connections'

/**
 * Handle OAuth 2.0 callback from QuickBooks
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const realmId = searchParams.get('realmId')
    const error = searchParams.get('error')
    
    // Handle OAuth error
    if (error) {
      console.error('QuickBooks OAuth error:', error)
      redirect('/app/settings?qb_error=oauth_failed')
    }
    
    if (!code || !realmId) {
      redirect('/app/settings?qb_error=missing_params')
    }
    
    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code)
    
    // Calculate expiration time
    const expiresAt = new Date()
    expiresAt.setSeconds(expiresAt.getSeconds() + tokens.expires_in)
    
    // Encrypt and store tokens
    await saveQboConnection({
      realm_id: realmId,
      access_token_enc: encrypt(tokens.access_token),
      refresh_token_enc: encrypt(tokens.refresh_token),
      expires_at: expiresAt.toISOString(),
      scope: tokens.scope || null,
    })
    
    redirect('/app/settings?qb_connected=true')
  } catch (error) {
    console.error('QuickBooks callback error:', error)
    redirect('/app/settings?qb_error=token_exchange_failed')
  }
}
