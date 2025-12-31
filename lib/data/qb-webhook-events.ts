'use server'

import { createClient } from '@/lib/supabase/serverClient'
import { QboWebhookEvent, QboWebhookEventInsert, QboWebhookEventUpdate } from '@/lib/db'

/**
 * Create a new webhook event record
 */
export async function createWebhookEvent(
  data: QboWebhookEventInsert
): Promise<QboWebhookEvent> {
  const supabase = await createClient()

  const { data: event, error } = await supabase
    .from('qbo_webhook_events')
    .insert(data as any)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create webhook event: ${error.message}`)
  }

  return event as QboWebhookEvent
}

/**
 * List webhook events with optional filters
 */
export async function listWebhookEvents(filters?: {
  status?: string
  realm_id?: string
  limit?: number
}): Promise<QboWebhookEvent[]> {
  const supabase = await createClient()

  let query = supabase
    .from('qbo_webhook_events')
    .select('*')
    .order('received_at', { ascending: true })

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }

  if (filters?.realm_id) {
    query = query.eq('realm_id', filters.realm_id)
  }

  if (filters?.limit) {
    query = query.limit(filters.limit)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to list webhook events: ${error.message}`)
  }

  return (data || []) as QboWebhookEvent[]
}

/**
 * Update a webhook event
 */
export async function updateWebhookEvent(
  id: string,
  updates: QboWebhookEventUpdate
): Promise<QboWebhookEvent> {
  const supabase = await createClient()

  const { data, error } = await (supabase
    .from('qbo_webhook_events') as any)
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update webhook event: ${error.message}`)
  }

  return data as QboWebhookEvent
}

/**
 * Get a webhook event by ID
 */
export async function getWebhookEvent(id: string): Promise<QboWebhookEvent | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('qbo_webhook_events')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw new Error(`Failed to get webhook event: ${error.message}`)
  }

  return data as QboWebhookEvent
}
