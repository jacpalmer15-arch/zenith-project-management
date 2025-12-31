'use server'

import { createClient } from '@/lib/supabase/serverClient'
import { QboEntityMap, QboEntityMapInsert, QboEntityMapUpdate } from '@/lib/db'

/**
 * Create a new QuickBooks entity mapping
 */
export async function createQboEntityMap(data: QboEntityMapInsert): Promise<QboEntityMap> {
  const supabase = await createClient()
  
  const { data: mapping, error } = await supabase
    .from('qbo_entity_map')
    .insert(data as never)
    .select()
    .single()
  
  if (error) {
    throw new Error(`Failed to create QBO entity map: ${error.message}`)
  }
  
  return mapping as QboEntityMap
}

/**
 * Get a mapping by local entity
 */
export async function getQboEntityMap(
  entityType: string,
  localId: string
): Promise<QboEntityMap | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('qbo_entity_map')
    .select('*')
    .eq('entity_type', entityType)
    .eq('local_id', localId)
    .single()
  
  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null
    }
    throw new Error(`Failed to fetch QBO entity map: ${error.message}`)
  }
  
  return data as QboEntityMap
}

/**
 * Get a mapping by QuickBooks entity
 */
export async function getQboEntityMapByQboId(
  entityType: string,
  qboId: string
): Promise<QboEntityMap | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('qbo_entity_map')
    .select('*')
    .eq('entity_type', entityType)
    .eq('qbo_id', qboId)
    .single()
  
  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null
    }
    throw new Error(`Failed to fetch QBO entity map by QBO ID: ${error.message}`)
  }
  
  return data as QboEntityMap
}

/**
 * List all mappings with optional filters
 */
export async function listQboEntityMaps(filters?: {
  entity_type?: string
  local_table?: string
}): Promise<QboEntityMap[]> {
  const supabase = await createClient()
  
  let query = supabase
    .from('qbo_entity_map')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (filters?.entity_type) {
    query = query.eq('entity_type', filters.entity_type)
  }
  
  if (filters?.local_table) {
    query = query.eq('local_table', filters.local_table)
  }
  
  const { data, error } = await query
  
  if (error) {
    throw new Error(`Failed to list QBO entity maps: ${error.message}`)
  }
  
  return (data || []) as QboEntityMap[]
}

/**
 * Update a QuickBooks entity mapping
 */
export async function updateQboEntityMap(id: string, data: QboEntityMapUpdate): Promise<QboEntityMap> {
  const supabase = await createClient()
  
  const { data: updated, error } = await supabase
    .from('qbo_entity_map')
    .update(data as never)
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    throw new Error(`Failed to update QBO entity map: ${error.message}`)
  }
  
  return updated as QboEntityMap
}

/**
 * Delete a QuickBooks entity mapping
 */
export async function deleteQboEntityMap(id: string): Promise<void> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('qbo_entity_map')
    .delete()
    .eq('id', id)
  
  if (error) {
    throw new Error(`Failed to delete QBO entity map: ${error.message}`)
  }
}
