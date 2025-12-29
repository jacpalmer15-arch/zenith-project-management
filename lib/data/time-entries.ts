'use server'

import { createClient } from '@/lib/supabase/serverClient'
import { WorkOrderTimeEntry, WorkOrderTimeEntryInsert, WorkOrderTimeEntryUpdate, TimeEntryWithDetails } from '@/lib/db'

export interface ListTimeEntriesOptions {
  tech_user_id?: string
  work_order_id?: string
  start_date?: string
  end_date?: string
}

/**
 * List time entries with optional filters
 */
export async function listTimeEntries(
  options?: ListTimeEntriesOptions
): Promise<TimeEntryWithDetails[]> {
  const supabase = await createClient()
  
  let query = supabase
    .from('work_order_time_entries')
    .select(`
      *,
      work_order:work_orders(*, customer:customers(*)),
      employee:employees(*)
    `)
    .order('clock_in_at', { ascending: false })
  
  if (options?.tech_user_id) {
    query = query.eq('tech_user_id', options.tech_user_id)
  }

  if (options?.work_order_id) {
    query = query.eq('work_order_id', options.work_order_id)
  }

  if (options?.start_date) {
    query = query.gte('clock_in_at', options.start_date)
  }

  if (options?.end_date) {
    query = query.lte('clock_in_at', options.end_date)
  }
  
  const { data, error } = await query
  
  if (error) {
    throw new Error(`Failed to fetch time entries: ${error.message}`)
  }
  
  return data as TimeEntryWithDetails[] || []
}

/**
 * Get a single time entry by ID
 */
export async function getTimeEntry(id: string): Promise<TimeEntryWithDetails> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('work_order_time_entries')
    .select(`
      *,
      work_order:work_orders(*, customer:customers(*)),
      employee:employees(*)
    `)
    .eq('id', id)
    .single()
  
  if (error) {
    throw new Error(`Failed to fetch time entry: ${error.message}`)
  }
  
  if (!data) {
    throw new Error('Time entry not found')
  }
  
  return data as TimeEntryWithDetails
}

/**
 * Create a new time entry
 */
export async function createTimeEntry(entry: WorkOrderTimeEntryInsert): Promise<WorkOrderTimeEntry> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('work_order_time_entries')
    .insert(entry as never)
    .select('*')
    .single()
  
  if (error) {
    throw new Error(`Failed to create time entry: ${error.message}`)
  }
  
  if (!data) {
    throw new Error('Time entry not returned after creation')
  }
  
  return data
}

/**
 * Update a time entry
 */
export async function updateTimeEntry(
  id: string,
  updates: WorkOrderTimeEntryUpdate
): Promise<WorkOrderTimeEntry> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('work_order_time_entries')
    .update(updates as never)
    .eq('id', id)
    .select('*')
    .single()
  
  if (error) {
    throw new Error(`Failed to update time entry: ${error.message}`)
  }
  
  if (!data) {
    throw new Error('Time entry not found after update')
  }
  
  return data
}

/**
 * Delete a time entry
 */
export async function deleteTimeEntry(id: string): Promise<void> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('work_order_time_entries')
    .delete()
    .eq('id', id)
  
  if (error) {
    throw new Error(`Failed to delete time entry: ${error.message}`)
  }
}

/**
 * Calculate hours worked from time entry
 */
export function calculateHours(clockIn: string, clockOut: string | null, breakMinutes: number = 0): number {
  if (!clockOut) return 0
  
  const start = new Date(clockIn)
  const end = new Date(clockOut)
  
  const milliseconds = end.getTime() - start.getTime()
  const minutes = milliseconds / (1000 * 60)
  const hours = (minutes - breakMinutes) / 60
  
  return Math.max(0, hours)
}
