import axios, { AxiosInstance } from 'axios'

export class QuickBooksClient {
  private baseUrl: string
  private realmId: string
  private accessToken: string
  private axiosInstance: AxiosInstance

  constructor(realmId: string, accessToken: string) {
    this.realmId = realmId
    this.accessToken = accessToken
    this.baseUrl = process.env.QUICKBOOKS_ENVIRONMENT === 'production'
      ? 'https://quickbooks.api.intuit.com'
      : 'https://sandbox-quickbooks.api.intuit.com'
    
    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    })
  }

  /**
   * Execute a QuickBooks query (SQL-like)
   */
  async query<T = any>(sql: string): Promise<T> {
    const response = await this.axiosInstance.get(
      `/v3/company/${this.realmId}/query`,
      { params: { query: sql } }
    )
    return response.data
  }

  /**
   * Create a new entity in QuickBooks
   */
  async create<T = any>(entity: string, data: any): Promise<T> {
    const response = await this.axiosInstance.post(
      `/v3/company/${this.realmId}/${entity.toLowerCase()}`,
      data
    )
    return response.data
  }

  /**
   * Update an existing entity in QuickBooks
   */
  async update<T = any>(entity: string, data: any): Promise<T> {
    const response = await this.axiosInstance.post(
      `/v3/company/${this.realmId}/${entity.toLowerCase()}`,
      data
    )
    return response.data
  }

  /**
   * Read an entity by ID
   */
  async read<T = any>(entity: string, id: string): Promise<T> {
    const response = await this.axiosInstance.get(
      `/v3/company/${this.realmId}/${entity.toLowerCase()}/${id}`
    )
    return response.data
  }

  /**
   * Delete an entity (soft delete in most cases)
   */
  async delete(entity: string, id: string, syncToken: string): Promise<any> {
    const response = await this.axiosInstance.post(
      `/v3/company/${this.realmId}/${entity.toLowerCase()}`,
      { Id: id, SyncToken: syncToken },
      { params: { operation: 'delete' } }
    )
    return response.data
  }
}

/**
 * Exchange authorization code for access and refresh tokens
 */
export async function exchangeCodeForTokens(code: string): Promise<{
  access_token: string
  refresh_token: string
  expires_in: number
  x_refresh_token_expires_in: number
}> {
  const clientId = process.env.QUICKBOOKS_CLIENT_ID!
  const clientSecret = process.env.QUICKBOOKS_CLIENT_SECRET!
  const redirectUri = process.env.QUICKBOOKS_REDIRECT_URI!
  
  const tokenUrl = 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer'
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
  
  const response = await axios.post(
    tokenUrl,
    new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: redirectUri,
    }).toString(),
    {
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
    }
  )
  
  return response.data
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(refreshToken: string): Promise<{
  access_token: string
  refresh_token: string
  expires_in: number
  x_refresh_token_expires_in: number
}> {
  const clientId = process.env.QUICKBOOKS_CLIENT_ID!
  const clientSecret = process.env.QUICKBOOKS_CLIENT_SECRET!
  
  const tokenUrl = 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer'
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
  
  const response = await axios.post(
    tokenUrl,
    new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }).toString(),
    {
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
    }
  )
  
  return response.data
}

/**
 * Revoke refresh token (disconnect)
 */
export async function revokeToken(token: string): Promise<void> {
  const clientId = process.env.QUICKBOOKS_CLIENT_ID!
  const clientSecret = process.env.QUICKBOOKS_CLIENT_SECRET!
  
  const revokeUrl = 'https://developer.api.intuit.com/v2/oauth2/tokens/revoke'
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
  
  await axios.post(
    revokeUrl,
    new URLSearchParams({
      token: token,
    }).toString(),
    {
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
    }
  )
}
