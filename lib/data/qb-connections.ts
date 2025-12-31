'use server'

import { createClient } from '@/lib/supabase/serverClient'
import { QboConnection, QboConnectionInsert, QboConnectionUpdate } from '@/lib/db'

/**
 * Get the QuickBooks connection (singleton)
 */
export async function getQboConnection(): Promise<QboConnection | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('qbo_connections')
    .select('*')
    .single()
  
  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned - no connection exists yet
      return null
    }
    throw new Error(`Failed to fetch QBO connection: ${error.message}`)
  }
  
  return data as QboConnection
}

/**
 * Save a new QuickBooks connection (or update if exists)
 */
export async function saveQboConnection(data: QboConnectionInsert): Promise<QboConnection> {
  const supabase = await createClient()
  
  // Try to get existing connection first
  const existing = await getQboConnection()
  
  if (existing) {
    // Update existing
    const { data: updated, error } = await supabase
      .from('qbo_connections')
      .update(data as never)
      .eq('id', existing.id)
      .select()
      .single()
    
    if (error) {
      throw new Error(`Failed to update QBO connection: ${error.message}`)
    }
    
    return updated as QboConnection
  } else {
    // Insert new
    const { data: inserted, error } = await supabase
      .from('qbo_connections')
      .insert(data as never)
      .select()
      .single()
    
    if (error) {
      throw new Error(`Failed to create QBO connection: ${error.message}`)
    }
    
    return inserted as QboConnection
  }
}

/**
 * Update an existing QuickBooks connection
 */
export async function updateQboConnection(id: string, data: QboConnectionUpdate): Promise<QboConnection> {
  const supabase = await createClient()
  
  const { data: updated, error } = await supabase
    .from('qbo_connections')
    .update(data as never)
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    throw new Error(`Failed to update QBO connection: ${error.message}`)
  }
  
  return updated as QboConnection
}

/**
 * Delete the QuickBooks connection
 */
export async function deleteQboConnection(id: string): Promise<void> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('qbo_connections')
    .delete()
    .eq('id', id)
  
  if (error) {
    throw new Error(`Failed to delete QBO connection: ${error.message}`)
  }
}
