'use server'

import { createClient } from '@/lib/supabase/serverClient'
import { WorkOrderSchedule, WorkOrderScheduleInsert, WorkOrderScheduleUpdate, ScheduleEntryWithDetails } from '@/lib/db'

export interface ListScheduleOptions {
  tech_user_id?: string
  work_order_id?: string
  start_date?: string
  end_date?: string
}

/**
 * List schedule entries with optional filters
 */
export async function listScheduleEntries(
  options?: ListScheduleOptions
): Promise<ScheduleEntryWithDetails[]> {
  const supabase = await createClient()
  
  let query = supabase
    .from('work_order_schedule')
    .select(`
      *,
      work_order:work_orders(*, customer:customers(*)),
      employee:employees(*)
    `)
    .order('start_at')
  
  if (options?.tech_user_id) {
    query = query.eq('tech_user_id', options.tech_user_id)
  }

  if (options?.work_order_id) {
    query = query.eq('work_order_id', options.work_order_id)
  }

  if (options?.start_date) {
    query = query.gte('start_at', options.start_date)
  }

  if (options?.end_date) {
    query = query.lte('start_at', options.end_date)
  }
  
  const { data, error } = await query
  
  if (error) {
    throw new Error(`Failed to fetch schedule entries: ${error.message}`)
  }
  
  return data as ScheduleEntryWithDetails[] || []
}

/**
 * Get a single schedule entry by ID
 */
export async function getScheduleEntry(id: string): Promise<ScheduleEntryWithDetails> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('work_order_schedule')
    .select(`
      *,
      work_order:work_orders(*, customer:customers(*)),
      employee:employees(*)
    `)
    .eq('id', id)
    .single()
  
  if (error) {
    throw new Error(`Failed to fetch schedule entry: ${error.message}`)
  }
  
  if (!data) {
    throw new Error('Schedule entry not found')
  }
  
  return data as ScheduleEntryWithDetails
}

/**
 * Get schedule entries for a date range
 */
export async function getScheduleForDateRange(
  startDate: string,
  endDate: string
): Promise<ScheduleEntryWithDetails[]> {
  return listScheduleEntries({ start_date: startDate, end_date: endDate })
}

/**
 * Create a new schedule entry
 */
export async function createScheduleEntry(entry: WorkOrderScheduleInsert): Promise<WorkOrderSchedule> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('work_order_schedule')
    .insert(entry as never)
    .select('*')
    .single()
  
  if (error) {
    throw new Error(`Failed to create schedule entry: ${error.message}`)
  }
  
  if (!data) {
    throw new Error('Schedule entry not returned after creation')
  }
  
  return data
}

/**
 * Update a schedule entry
 */
export async function updateScheduleEntry(
  id: string,
  updates: WorkOrderScheduleUpdate
): Promise<WorkOrderSchedule> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('work_order_schedule')
    .update(updates as never)
    .eq('id', id)
    .select('*')
    .single()
  
  if (error) {
    throw new Error(`Failed to update schedule entry: ${error.message}`)
  }
  
  if (!data) {
    throw new Error('Schedule entry not found after update')
  }
  
  return data
}

/**
 * Delete a schedule entry
 */
export async function deleteScheduleEntry(id: string): Promise<void> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('work_order_schedule')
    .delete()
    .eq('id', id)
  
  if (error) {
    throw new Error(`Failed to delete schedule entry: ${error.message}`)
  }
}
