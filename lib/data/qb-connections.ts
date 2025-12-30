'use server'

import { createClient } from '@/lib/supabase/serverClient'

export interface QbConnection {
  id: string
  company_file_id: string | null
  realm_id: string
  access_token: string | null
  refresh_token: string | null
  token_expires_at: string | null
  is_connected: boolean
  last_sync_at: string | null
  sync_status: string
  sync_error: string | null
  created_at: string
  updated_at: string
}

export interface QbConnectionInsert {
  company_file_id?: string | null
  realm_id: string
  access_token?: string | null
  refresh_token?: string | null
  token_expires_at?: string | null
  is_connected?: boolean
  last_sync_at?: string | null
  sync_status?: string
  sync_error?: string | null
}

export interface QbConnectionUpdate {
  company_file_id?: string | null
  realm_id?: string
  access_token?: string | null
  refresh_token?: string | null
  token_expires_at?: string | null
  is_connected?: boolean
  last_sync_at?: string | null
  sync_status?: string
  sync_error?: string | null
}

/**
 * Get the QuickBooks connection (singleton)
 */
export async function getQbConnection(): Promise<QbConnection | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('qb_connections')
    .select('*')
    .single()
  
  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned - no connection exists yet
      return null
    }
    throw new Error(`Failed to fetch QB connection: ${error.message}`)
  }
  
  return data as QbConnection
}

/**
 * Save a new QuickBooks connection (or update if exists)
 */
export async function saveQbConnection(data: QbConnectionInsert): Promise<QbConnection> {
  const supabase = await createClient()
  
  // Try to get existing connection first
  const existing = await getQbConnection()
  
  if (existing) {
    // Update existing
    const { data: updated, error } = await supabase
      .from('qb_connections')
      .update(data)
      .eq('id', existing.id)
      .select()
      .single()
    
    if (error) {
      throw new Error(`Failed to update QB connection: ${error.message}`)
    }
    
    return updated as QbConnection
  } else {
    // Insert new
    const { data: inserted, error } = await supabase
      .from('qb_connections')
      .insert(data)
      .select()
      .single()
    
    if (error) {
      throw new Error(`Failed to create QB connection: ${error.message}`)
    }
    
    return inserted as QbConnection
  }
}

/**
 * Update an existing QuickBooks connection
 */
export async function updateQbConnection(id: string, data: QbConnectionUpdate): Promise<QbConnection> {
  const supabase = await createClient()
  
  const { data: updated, error } = await supabase
    .from('qb_connections')
    .update(data)
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    throw new Error(`Failed to update QB connection: ${error.message}`)
  }
  
  return updated as QbConnection
}

/**
 * Delete the QuickBooks connection
 */
export async function deleteQbConnection(id: string): Promise<void> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('qb_connections')
    .delete()
    .eq('id', id)
  
  if (error) {
    throw new Error(`Failed to delete QB connection: ${error.message}`)
  }
}
