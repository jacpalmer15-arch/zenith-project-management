'use server'

import { createClient } from '@/lib/supabase/serverClient'

export interface QbMapping {
  id: string
  zenith_entity_type: string
  zenith_entity_id: string
  qb_entity_type: string
  qb_list_id: string
  qb_edit_sequence: string | null
  qb_full_name: string | null
  sync_direction: string
  last_synced_at: string
  created_at: string
  updated_at: string
}

export interface QbMappingInsert {
  zenith_entity_type: string
  zenith_entity_id: string
  qb_entity_type: string
  qb_list_id: string
  qb_edit_sequence?: string | null
  qb_full_name?: string | null
  sync_direction?: string
}

export interface QbMappingUpdate {
  qb_list_id?: string
  qb_edit_sequence?: string | null
  qb_full_name?: string | null
  sync_direction?: string
  last_synced_at?: string
}

/**
 * Create a new QuickBooks mapping
 */
export async function createQbMapping(data: QbMappingInsert): Promise<QbMapping> {
  const supabase = await createClient()
  
  const { data: mapping, error } = await supabase
    .from('qb_mappings')
    .insert(data)
    .select()
    .single()
  
  if (error) {
    throw new Error(`Failed to create QB mapping: ${error.message}`)
  }
  
  return mapping as QbMapping
}

/**
 * Get a mapping by Zenith entity
 */
export async function getQbMapping(
  zenithEntityType: string,
  zenithEntityId: string
): Promise<QbMapping | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('qb_mappings')
    .select('*')
    .eq('zenith_entity_type', zenithEntityType)
    .eq('zenith_entity_id', zenithEntityId)
    .single()
  
  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null
    }
    throw new Error(`Failed to fetch QB mapping: ${error.message}`)
  }
  
  return data as QbMapping
}

/**
 * Get a mapping by QuickBooks entity
 */
export async function getQbMappingByQbId(
  qbEntityType: string,
  qbListId: string
): Promise<QbMapping | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('qb_mappings')
    .select('*')
    .eq('qb_entity_type', qbEntityType)
    .eq('qb_list_id', qbListId)
    .single()
  
  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null
    }
    throw new Error(`Failed to fetch QB mapping by QB ID: ${error.message}`)
  }
  
  return data as QbMapping
}

/**
 * List all mappings with optional filters
 */
export async function listQbMappings(filters?: {
  zenith_entity_type?: string
  qb_entity_type?: string
}): Promise<QbMapping[]> {
  const supabase = await createClient()
  
  let query = supabase
    .from('qb_mappings')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (filters?.zenith_entity_type) {
    query = query.eq('zenith_entity_type', filters.zenith_entity_type)
  }
  
  if (filters?.qb_entity_type) {
    query = query.eq('qb_entity_type', filters.qb_entity_type)
  }
  
  const { data, error } = await query
  
  if (error) {
    throw new Error(`Failed to list QB mappings: ${error.message}`)
  }
  
  return (data || []) as QbMapping[]
}

/**
 * Update a QuickBooks mapping
 */
export async function updateQbMapping(id: string, data: QbMappingUpdate): Promise<QbMapping> {
  const supabase = await createClient()
  
  const { data: updated, error } = await supabase
    .from('qb_mappings')
    .update(data)
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    throw new Error(`Failed to update QB mapping: ${error.message}`)
  }
  
  return updated as QbMapping
}

/**
 * Delete a QuickBooks mapping
 */
export async function deleteQbMapping(id: string): Promise<void> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('qb_mappings')
    .delete()
    .eq('id', id)
  
  if (error) {
    throw new Error(`Failed to delete QB mapping: ${error.message}`)
  }
}
