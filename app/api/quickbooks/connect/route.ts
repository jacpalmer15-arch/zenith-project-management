import { redirect } from 'next/navigation'
import { NextRequest } from 'next/server'
import crypto from 'crypto'

/**
 * Initiate OAuth 2.0 flow with QuickBooks
 */
export async function GET(request: NextRequest) {
  try {
    const clientId = process.env.QUICKBOOKS_CLIENT_ID
    const redirectUri = process.env.QUICKBOOKS_REDIRECT_URI
    
    if (!clientId || !redirectUri) {
      throw new Error('QuickBooks credentials not configured')
    }
    
    // Generate random state for CSRF protection
    const state = crypto.randomBytes(32).toString('hex')
    
    // Store state in session/cookie if needed (simplified for MVP)
    // In production, store in Redis or secure session
    
    const authUrl = new URL('https://appcenter.intuit.com/connect/oauth2')
    authUrl.searchParams.set('client_id', clientId)
    authUrl.searchParams.set('redirect_uri', redirectUri)
    authUrl.searchParams.set('response_type', 'code')
    authUrl.searchParams.set('scope', 'com.intuit.quickbooks.accounting')
    authUrl.searchParams.set('state', state)
    
    redirect(authUrl.toString())
  } catch (error) {
    console.error('QuickBooks connect error:', error)
    redirect('/app/settings?qb_error=connection_failed')
  }
}
