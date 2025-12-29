'use server'

import { createClient } from '@/lib/supabase/serverClient'
import { Equipment, EquipmentInsert, EquipmentUpdate } from '@/lib/db'

export interface ListEquipmentOptions {
  is_active?: boolean
  search?: string
}

/**
 * List all equipment with optional filters
 */
export async function listEquipment(
  options?: ListEquipmentOptions
): Promise<Equipment[]> {
  const supabase = await createClient()
  
  let query = supabase
    .from('equipment')
    .select('*')
    .order('name', { ascending: true })
  
  if (options?.is_active !== undefined) {
    query = query.eq('is_active', options.is_active)
  }

  if (options?.search) {
    query = query.or(`name.ilike.%${options.search}%,serial_no.ilike.%${options.search}%`)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to list equipment: ${error.message}`)
  }

  return data || []
}

/**
 * Get a single equipment by ID
 */
export async function getEquipment(id: string): Promise<Equipment> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('equipment')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    throw new Error(`Failed to get equipment: ${error.message}`)
  }

  return data
}

/**
 * Create new equipment
 */
export async function createEquipment(equipment: EquipmentInsert): Promise<Equipment> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('equipment')
    .insert(equipment)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create equipment: ${error.message}`)
  }

  return data
}

/**
 * Update existing equipment
 */
export async function updateEquipment(
  id: string,
  equipment: EquipmentUpdate
): Promise<Equipment> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('equipment')
    .update(equipment)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update equipment: ${error.message}`)
  }

  return data
}

/**
 * Delete equipment
 */
export async function deleteEquipment(id: string): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('equipment')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(`Failed to delete equipment: ${error.message}`)
  }
}
