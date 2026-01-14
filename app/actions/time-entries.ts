'use server'

import { revalidatePath } from 'next/cache'
import { createTimeEntry, updateTimeEntry, deleteTimeEntry, getTimeEntry, getWorkOrder, isTechAssignedToWorkOrder } from '@/lib/data'
import { timeEntrySchema, validateTimeEntry } from '@/lib/validations/time-entries'
import { validateTimeEntryMutable } from '@/lib/validations/data-consistency'
import { getCurrentUser } from '@/lib/auth/get-user'
import { hasPermission } from '@/lib/auth/permissions'
import { logAction } from '@/lib/audit/log'

export async function createTimeEntryAction(data: {
  work_order_id: string
  tech_user_id: string
  clock_in_at: string
  clock_out_at?: string | null
  break_minutes?: number
  notes?: string | null
}) {
  // Validate with zod
  const parsed = timeEntrySchema.safeParse(data)
  
  if (!parsed.success) {
    return { error: 'Invalid form data' }
  }

  try {
    const user = await getCurrentUser()
    if (!hasPermission(user?.role, 'edit_time')) {
      return { error: 'Permission denied' }
    }
    if (user?.role === 'TECH' && user.employee?.id !== data.tech_user_id) {
      return { error: 'Technicians can only create their own time entries' }
    }
    if (user?.role === 'TECH' && user.employee?.id) {
      const isAssigned = await isTechAssignedToWorkOrder(data.work_order_id, user.employee.id)
      if (!isAssigned) {
        return { error: 'You can only log time on work orders assigned to you' }
      }
    }
    
    // Check if work order is closed
    await validateTimeEntryMutable(
      { work_order_id: data.work_order_id },
      user?.role || 'TECH'
    )
    
    const validation = await validateTimeEntry(parsed.data)
    
    if (!validation.valid) {
      return { 
        error: validation.issues.join(', '),
        warnings: validation.warnings 
      }
    }
    
    const entry = await createTimeEntry(parsed.data)
    if (user) {
      await logAction('work_order_time_entries', entry.id, 'CREATE', user.id, null, entry)
    }

    revalidatePath('/app/time')
    revalidatePath('/app/work-orders')
    revalidatePath(`/app/work-orders/${data.work_order_id}`)
    
    return { 
      success: true,
      warnings: validation.warnings 
    }
  } catch (error) {
    console.error('Error creating time entry:', error)
    return { error: 'Failed to create time entry' }
  }
}

export async function updateTimeEntryAction(id: string, data: {
  work_order_id?: string
  tech_user_id?: string
  clock_in_at?: string
  clock_out_at?: string | null
  break_minutes?: number
  notes?: string | null
}) {
  try {
    const user = await getCurrentUser()
    if (!hasPermission(user?.role, 'edit_time')) {
      return { error: 'Permission denied' }
    }
    
    // Check work order status
    const existing = await getTimeEntry(id)
    if (user?.role === 'TECH' && existing.tech_user_id !== user.employee?.id) {
      return { error: 'Technicians can only edit their own time entries' }
    }
    const wo = await getWorkOrder(existing.work_order_id)
    
    // Check if work order is closed
    await validateTimeEntryMutable(
      { work_order_id: existing.work_order_id },
      user?.role || 'TECH'
    )
    
    if (wo.status === 'CLOSED') {
      return { error: 'Cannot edit time entries for closed work orders' }
    }
    
    // Merge existing data with updates for validation
    const mergedData = {
      work_order_id: data.work_order_id || existing.work_order_id,
      tech_user_id: data.tech_user_id || existing.tech_user_id,
      clock_in_at: data.clock_in_at || existing.clock_in_at,
      clock_out_at: data.clock_out_at !== undefined ? data.clock_out_at : existing.clock_out_at,
      break_minutes: data.break_minutes !== undefined ? data.break_minutes : existing.break_minutes,
      notes: data.notes !== undefined ? data.notes : existing.notes,
      id
    }
    
    const validation = await validateTimeEntry(mergedData)
    
    if (!validation.valid) {
      return { 
        error: validation.issues.join(', '),
        warnings: validation.warnings 
      }
    }
    
    const updated = await updateTimeEntry(id, data)
    if (user) {
      await logAction('work_order_time_entries', id, 'UPDATE', user.id, existing, updated)
    }
    
    revalidatePath('/app/time')
    revalidatePath('/app/work-orders')
    revalidatePath(`/app/work-orders/${existing.work_order_id}`)
    
    return { 
      success: true,
      warnings: validation.warnings 
    }
  } catch (error) {
    console.error('Error updating time entry:', error)
    return { error: 'Failed to update time entry' }
  }
}

export async function deleteTimeEntryAction(id: string, workOrderId: string) {
  try {
    const user = await getCurrentUser()
    if (!hasPermission(user?.role, 'edit_time')) {
      return { error: 'Permission denied' }
    }
    const existing = await getTimeEntry(id)
    if (user?.role === 'TECH' && existing.tech_user_id !== user.employee?.id) {
      return { error: 'Technicians can only delete their own time entries' }
    }
    
    // Check if work order is closed
    await validateTimeEntryMutable(
      { work_order_id: workOrderId },
      user?.role || 'TECH'
    )
    
    await deleteTimeEntry(id)
    if (user) {
      await logAction('work_order_time_entries', id, 'DELETE', user.id, existing, null)
    }
    
    revalidatePath('/app/time')
    revalidatePath('/app/work-orders')
    revalidatePath(`/app/work-orders/${workOrderId}`)
    
    return { success: true }
  } catch (error) {
    console.error('Error deleting time entry:', error)
    return { error: 'Failed to delete time entry' }
  }
}
