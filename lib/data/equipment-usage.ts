'use server'

import { createClient } from '@/lib/supabase/serverClient'
import { EquipmentUsage, EquipmentUsageInsert, EquipmentUsageUpdate } from '@/lib/db'

/**
 * List equipment usage entries for a work order
 */
export async function listEquipmentUsage(
  workOrderId: string
): Promise<any[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('equipment_usage')
    .select(`
      *,
      equipment:equipment(*),
      work_order:work_orders(*, customer:customers(*))
    `)
    .eq('work_order_id', workOrderId)
    .order('start_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to list equipment usage: ${error.message}`)
  }

  return data || []
}

/**
 * Get a single equipment usage entry by ID
 */
export async function getEquipmentUsage(id: string): Promise<any> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('equipment_usage')
    .select(`
      *,
      equipment:equipment(*),
      work_order:work_orders(*, customer:customers(*))
    `)
    .eq('id', id)
    .single()

  if (error) {
    throw new Error(`Failed to get equipment usage: ${error.message}`)
  }

  return data
}

/**
 * Calculate cost based on duration and rate
 */
function calculateCost(
  startAt: string,
  endAt: string | null,
  billedRate: number
): number {
  if (!endAt) return 0

  const start = new Date(startAt)
  const end = new Date(endAt)
  const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)

  return hours * billedRate
}

/**
 * Create a new equipment usage entry
 */
export async function createEquipmentUsage(
  usage: EquipmentUsageInsert
): Promise<any> {
  const supabase = await createClient()

  // Calculate cost_total
  const cost_total = usage.end_at
    ? calculateCost(usage.start_at, usage.end_at, usage.billed_rate || 0)
    : 0

  const { data, error } = await supabase
    .from('equipment_usage')
    .insert({
      ...usage,
      cost_total,
    } as any)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create equipment usage: ${error.message}`)
  }

  return data
}

/**
 * Update an existing equipment usage entry
 */
export async function updateEquipmentUsage(
  id: string,
  usage: EquipmentUsageUpdate
): Promise<any> {
  const supabase = await createClient()

  // Recalculate cost if relevant fields changed
  const updates: any = { ...usage }
  
  if (
    usage.start_at !== undefined ||
    usage.end_at !== undefined ||
    usage.billed_rate !== undefined
  ) {
    // Fetch current values if not provided
    const { data: current } = await supabase
      .from('equipment_usage')
      .select('start_at, end_at, billed_rate')
      .eq('id', id)
      .single()

    if (current) {
      const start_at = usage.start_at !== undefined ? usage.start_at : (current as any).start_at
      const end_at = usage.end_at !== undefined ? usage.end_at : (current as any).end_at
      const billed_rate = usage.billed_rate !== undefined ? usage.billed_rate : (current as any).billed_rate

      updates.cost_total = end_at ? calculateCost(start_at, end_at, billed_rate) : 0
    }
  }

  const { data, error } = await (supabase
    .from('equipment_usage') as any)
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update equipment usage: ${error.message}`)
  }

  return data
}

/**
 * Delete an equipment usage entry
 */
export async function deleteEquipmentUsage(id: string): Promise<void> {
  const supabase = await createClient()

  const { error} = await supabase
    .from('equipment_usage')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(`Failed to delete equipment usage: ${error.message}`)
  }
}
