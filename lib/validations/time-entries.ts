'use server'

import { z } from 'zod'
import { getWorkOrder, listScheduleEntries } from '@/lib/data'
import { createClient } from '@/lib/supabase/serverClient'
import { WorkOrderTimeEntryInsert } from '@/lib/db'

export const timeEntrySchema = z.object({
  work_order_id: z.string().uuid('Please select a work order'),
  tech_user_id: z.string().uuid('Please select an employee'),
  clock_in_at: z.string().min(1, 'Clock in time is required'),
  clock_out_at: z.string().optional().nullable(),
  break_minutes: z.number().min(0).default(0),
  notes: z.string().optional().nullable(),
}).refine(
  (data) => {
    if (data.clock_out_at) {
      return new Date(data.clock_out_at) > new Date(data.clock_in_at)
    }
    return true
  },
  {
    message: 'Clock out time must be after clock in time',
    path: ['clock_out_at'],
  }
)

export type TimeEntryFormData = z.infer<typeof timeEntrySchema>

export interface ValidationResult {
  valid: boolean
  issues: string[]
  warnings: string[]
}

/**
 * Validate a time entry against business rules
 */
export async function validateTimeEntry(
  data: WorkOrderTimeEntryInsert & { id?: string }
): Promise<ValidationResult> {
  const issues: string[] = []
  const warnings: string[] = []
  
  // Check work order is not closed
  const wo = await getWorkOrder(data.work_order_id)
  if (wo.status === 'CLOSED') {
    issues.push('Cannot add time entries to closed work orders')
  }
  
  // Check for overlapping entries by same employee
  const supabase = await createClient()
  
  // First check if employee has an active (ongoing) time entry
  const { data: activeEntries } = await supabase
    .from('work_order_time_entries')
    .select('*')
    .eq('tech_user_id', data.tech_user_id)
    .not('id', 'eq', data.id || '00000000-0000-0000-0000-000000000000')
    .is('clock_out_at', null)
  
  if (activeEntries && activeEntries.length > 0) {
    issues.push('Employee has an active time entry that must be closed first')
  }
  
  // If the new entry has a clock_out, check for overlaps with completed entries
  if (data.clock_out_at) {
    // Check for overlap: two time ranges overlap if start1 < end2 AND start2 < end1
    const { data: overlapping } = await supabase
      .from('work_order_time_entries')
      .select('*')
      .eq('tech_user_id', data.tech_user_id)
      .not('id', 'eq', data.id || '00000000-0000-0000-0000-000000000000')
      .not('clock_out_at', 'is', null)
      .lt('clock_in_at', data.clock_out_at)
      .gt('clock_out_at', data.clock_in_at)
    
    if (overlapping && overlapping.length > 0) {
      issues.push('Time entry overlaps with existing entry for this employee')
    }
  }
  
  // Check if overlaps scheduled window (warning, not blocking)
  try {
    const schedules = await listScheduleEntries({
      work_order_id: data.work_order_id,
      tech_user_id: data.tech_user_id
    })
    
    if (schedules.length > 0) {
      const schedule = schedules[0]
      const schedStart = new Date(schedule.start_at)
      const schedEnd = schedule.end_at ? new Date(schedule.end_at) : null
      const clockIn = new Date(data.clock_in_at)
      
      if (clockIn < schedStart || (schedEnd && clockIn > schedEnd)) {
        warnings.push('Time entry outside scheduled window')
      }
    }
  } catch (error) {
    // Schedule not found is ok, just skip the warning
  }
  
  return {
    valid: issues.length === 0,
    issues,
    warnings
  }
}
