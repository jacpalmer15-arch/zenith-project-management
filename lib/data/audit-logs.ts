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
