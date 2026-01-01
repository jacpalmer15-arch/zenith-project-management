'use server'

import { createClient } from '@/lib/supabase/serverClient'

export interface AuditLog {
  id: string
  entity_type: string
  entity_id: string | null
  action: string
  actor_user_id: string | null
  before_data: Record<string, any> | null
  after_data: Record<string, any> | null
  notes: string | null
  created_at: string
}

export interface AuditLogEntry {
  id: string
  table_name: string
  record_id: string
  action: 'INSERT' | 'UPDATE' | 'DELETE'
  old_values: any
  new_values: any
  changed_fields?: string[]
  user_id?: string
  user_email?: string
  reason?: string
  created_at: string
}

export interface ListAuditLogsOptions {
  entity_type?: string
  action?: string
  start_date?: string
  end_date?: string
  limit?: number
  offset?: number
}

/**
 * List audit logs with optional filters
 */
export async function listAuditLogs(
  options?: ListAuditLogsOptions
): Promise<{ data: AuditLog[]; count: number }> {
  const supabase = await createClient()

  let query = supabase
    .from('audit_logs')
    .select('*', { count: 'exact' }) as any

  query = query.order('created_at', { ascending: false })

  if (options?.entity_type) {
    query = query.eq('entity_type', options.entity_type)
  }

  if (options?.action) {
    query = query.eq('action', options.action)
  }

  if (options?.start_date) {
    query = query.gte('created_at', options.start_date)
  }

  if (options?.end_date) {
    query = query.lte('created_at', options.end_date)
  }

  if (options?.limit) {
    query = query.limit(options.limit)
  }

  if (options?.offset) {
    query = query.range(
      options.offset,
      options.offset + (options.limit || 25) - 1
    )
  }

  const { data, error, count } = await query

  if (error) {
    throw new Error(`Failed to fetch audit logs: ${error.message}`)
  }

  return {
    data: (data as AuditLog[]) || [],
    count: count || 0,
  }
}

/**
 * Get audit logs for a specific record
 */
export async function getAuditLogsForRecord(
  tableName: string,
  recordId: string
): Promise<AuditLogEntry[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('audit_log_entries')
    .select('*')
    .eq('table_name', tableName)
    .eq('record_id', recordId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch audit logs for record: ${error.message}`)
  }

  return (data as AuditLogEntry[]) || []
}

/**
 * Get recent audit logs with pagination
 */
export async function getRecentAuditLogs(
  limit: number = 50,
  offset: number = 0
): Promise<AuditLogEntry[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('audit_log_entries')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    throw new Error(`Failed to fetch recent audit logs: ${error.message}`)
  }

  return (data as AuditLogEntry[]) || []
}

/**
 * Get audit logs by user ID
 */
export async function getAuditLogsByUser(
  userId: string
): Promise<AuditLogEntry[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('audit_log_entries')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch audit logs by user: ${error.message}`)
  }

  return (data as AuditLogEntry[]) || []
}

/**
 * Get audit logs by date range
 */
export async function getAuditLogsByDateRange(
  startDate: string,
  endDate: string
): Promise<AuditLogEntry[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('audit_log_entries')
    .select('*')
    .gte('created_at', startDate)
    .lte('created_at', endDate)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch audit logs by date range: ${error.message}`)
  }

  return (data as AuditLogEntry[]) || []
}

/**
 * Get audit log entries with filters and pagination
 */
export async function getAuditLogEntries(options?: {
  table_name?: string
  action?: 'INSERT' | 'UPDATE' | 'DELETE'
  user_id?: string
  record_id?: string
  start_date?: string
  end_date?: string
  limit?: number
  offset?: number
}): Promise<{ data: AuditLogEntry[]; count: number }> {
  const supabase = await createClient()

  let query = supabase
    .from('audit_log_entries')
    .select('*', { count: 'exact' })

  if (options?.table_name) {
    query = query.eq('table_name', options.table_name)
  }

  if (options?.action) {
    query = query.eq('action', options.action)
  }

  if (options?.user_id) {
    query = query.eq('user_id', options.user_id)
  }

  if (options?.record_id) {
    query = query.eq('record_id', options.record_id)
  }

  if (options?.start_date) {
    query = query.gte('created_at', options.start_date)
  }

  if (options?.end_date) {
    query = query.lte('created_at', options.end_date)
  }

  query = query.order('created_at', { ascending: false })

  // Use range for pagination instead of limit+offset
  const limit = options?.limit || 50
  const offset = options?.offset || 0
  query = query.range(offset, offset + limit - 1)

  const { data, error, count } = await query

  if (error) {
    throw new Error(`Failed to fetch audit log entries: ${error.message}`)
  }

  return {
    data: (data as AuditLogEntry[]) || [],
    count: count || 0,
  }
}
