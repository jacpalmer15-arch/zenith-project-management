'use server'

import { createClient } from '@/lib/supabase/serverClient'

export interface QbSyncLog {
  id: string
  sync_type: string
  direction: string
  status: string
  entity_type: string | null
  entity_id: string | null
  qb_request: string | null
  qb_response: string | null
  error_message: string | null
  processed_count: number
  created_at: string
}

export interface QbSyncLogInsert {
  sync_type: string
  direction: string
  status: string
  entity_type?: string | null
  entity_id?: string | null
  qb_request?: string | null
  qb_response?: string | null
  error_message?: string | null
  processed_count?: number
}

/**
 * Create a new sync log entry
 */
export async function createSyncLog(data: QbSyncLogInsert): Promise<QbSyncLog> {
  const supabase = await createClient()
  
  const { data: log, error } = await supabase
    .from('qb_sync_logs')
    .insert(data)
    .select()
    .single()
  
  if (error) {
    throw new Error(`Failed to create sync log: ${error.message}`)
  }
  
  return log as QbSyncLog
}

/**
 * List sync logs with optional filters
 */
export async function listSyncLogs(filters?: {
  sync_type?: string
  status?: string
  entity_type?: string
  limit?: number
}): Promise<QbSyncLog[]> {
  const supabase = await createClient()
  
  let query = supabase
    .from('qb_sync_logs')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (filters?.sync_type) {
    query = query.eq('sync_type', filters.sync_type)
  }
  
  if (filters?.status) {
    query = query.eq('status', filters.status)
  }
  
  if (filters?.entity_type) {
    query = query.eq('entity_type', filters.entity_type)
  }
  
  if (filters?.limit) {
    query = query.limit(filters.limit)
  }
  
  const { data, error } = await query
  
  if (error) {
    throw new Error(`Failed to list sync logs: ${error.message}`)
  }
  
  return (data || []) as QbSyncLog[]
}

/**
 * Get a specific sync log by ID
 */
export async function getSyncLog(id: string): Promise<QbSyncLog> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('qb_sync_logs')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) {
    throw new Error(`Failed to fetch sync log: ${error.message}`)
  }
  
  return data as QbSyncLog
}
