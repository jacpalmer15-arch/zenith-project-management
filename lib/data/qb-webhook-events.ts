'use server'

import { createClient } from '@/lib/supabase/serverClient'

export interface QbWebhookEvent {
  id: string
  realm_id: string
  event_name: string
  event_operation: string
  entity_id: string
  event_time: Date
  webhook_payload: any
  processed: boolean
  processed_at?: Date | null
  error_message?: string | null
  created_at: Date
}

export interface QbWebhookEventInsert {
  realm_id: string
  event_name: string
  event_operation: string
  entity_id: string
  event_time: Date | string
  webhook_payload: any
  processed?: boolean
  processed_at?: Date | string | null
  error_message?: string | null
}

export interface QbWebhookEventUpdate {
  processed?: boolean
  processed_at?: Date | string | null
  error_message?: string | null
}

/**
 * Create a new webhook event record
 */
export async function createWebhookEvent(
  data: QbWebhookEventInsert
): Promise<QbWebhookEvent> {
  const supabase = await createClient()

  const { data: event, error } = await (supabase
    .from('qb_webhook_events') as any)
    .insert(data)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create webhook event: ${error.message}`)
  }

  return event as QbWebhookEvent
}

/**
 * List webhook events with optional filters
 */
export async function listWebhookEvents(filters?: {
  processed?: boolean
  event_name?: string
  limit?: number
}): Promise<QbWebhookEvent[]> {
  const supabase = await createClient()

  let query = supabase
    .from('qb_webhook_events')
    .select('*')
    .order('created_at', { ascending: true })

  if (filters?.processed !== undefined) {
    query = query.eq('processed', filters.processed)
  }

  if (filters?.event_name) {
    query = query.eq('event_name', filters.event_name)
  }

  if (filters?.limit) {
    query = query.limit(filters.limit)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to list webhook events: ${error.message}`)
  }

  return (data || []) as QbWebhookEvent[]
}

/**
 * Update a webhook event
 */
export async function updateWebhookEvent(
  id: string,
  updates: QbWebhookEventUpdate
): Promise<QbWebhookEvent> {
  const supabase = await createClient()

  const { data, error } = await (supabase
    .from('qb_webhook_events') as any)
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update webhook event: ${error.message}`)
  }

  return data as QbWebhookEvent
}

/**
 * Get a webhook event by ID
 */
export async function getWebhookEvent(id: string): Promise<QbWebhookEvent | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('qb_webhook_events')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw new Error(`Failed to get webhook event: ${error.message}`)
  }

  return data as QbWebhookEvent
}
