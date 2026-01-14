'use server'

import { revalidatePath } from 'next/cache'
import { createScheduleEntry, updateScheduleEntry, deleteScheduleEntry, getScheduleEntry } from '@/lib/data'
import { scheduleEntrySchema } from '@/lib/validations/schedule'
import { onScheduleCreated, onScheduleStarted, onScheduleEnded } from '@/lib/workflows/schedule-sync'
import { getCurrentUser } from '@/lib/auth/get-user'
import { hasPermission } from '@/lib/auth/permissions'
import { logAction } from '@/lib/audit/log'

export async function createScheduleEntryAction(data: {
  work_order_id: string
  tech_user_id: string
  start_at: string
  end_at: string
}) {
  const user = await getCurrentUser()
  if (!hasPermission(user?.role, 'edit_schedule')) {
    return { error: 'Permission denied' }
  }

  // Validate with zod
  const parsed = scheduleEntrySchema.safeParse(data)
  
  if (!parsed.success) {
    return { error: 'Invalid form data' }
  }

  try {
    // Create schedule entry
    const schedule = await createScheduleEntry(parsed.data)

    if (user) {
      await logAction('work_order_schedule', schedule.id, 'CREATE', user.id, null, schedule)
    }
    
    // Trigger auto-transition
    const transition = await onScheduleCreated(schedule)
    if (transition && user) {
      await logAction(
        'work_orders',
        transition.workOrderId,
        'STATUS_CHANGE',
        user.id,
        { status: transition.from },
        { status: transition.to },
        transition.reason || null
      )
    }

    revalidatePath('/app/schedule')
    revalidatePath('/app/work-orders')
    revalidatePath(`/app/work-orders/${data.work_order_id}`)
    
    return { success: true }
  } catch (error) {
    console.error('Error creating schedule entry:', error)
    const message = error instanceof Error ? error.message : 'Failed to create schedule entry'
    return { error: message }
  }
}

export async function updateScheduleEntryAction(id: string, data: {
  work_order_id?: string
  tech_user_id?: string
  start_at?: string
  end_at?: string
}) {
  try {
    const user = await getCurrentUser()
    if (!hasPermission(user?.role, 'edit_schedule')) {
      return { error: 'Permission denied' }
    }

    const before = await getScheduleEntry(id)
    const updated = await updateScheduleEntry(id, data)
    if (user) {
      await logAction('work_order_schedule', id, 'UPDATE', user.id, before, updated)
    }
    
    revalidatePath('/app/schedule')
    revalidatePath('/app/work-orders')
    if (data.work_order_id) {
      revalidatePath(`/app/work-orders/${data.work_order_id}`)
    }
    
    return { success: true }
  } catch (error) {
    console.error('Error updating schedule entry:', error)
    return { error: 'Failed to update schedule entry' }
  }
}

export async function deleteScheduleEntryAction(id: string, workOrderId: string) {
  try {
    const user = await getCurrentUser()
    if (!hasPermission(user?.role, 'edit_schedule')) {
      return { error: 'Permission denied' }
    }

    const before = await getScheduleEntry(id)
    await deleteScheduleEntry(id)
    if (user) {
      await logAction('work_order_schedule', id, 'DELETE', user.id, before, null)
    }
    
    revalidatePath('/app/schedule')
    revalidatePath('/app/work-orders')
    revalidatePath(`/app/work-orders/${workOrderId}`)
    
    return { success: true }
  } catch (error) {
    console.error('Error deleting schedule entry:', error)
    return { error: 'Failed to delete schedule entry' }
  }
}

export async function startScheduleAction(scheduleId: string) {
  try {
    const user = await getCurrentUser()
    if (!hasPermission(user?.role, 'edit_schedule')) {
      return { error: 'Permission denied' }
    }

    const transition = await onScheduleStarted(scheduleId)
    if (transition && user) {
      await logAction(
        'work_orders',
        transition.workOrderId,
        'STATUS_CHANGE',
        user.id,
        { status: transition.from },
        { status: transition.to },
        transition.reason || null
      )
    }
    
    revalidatePath('/app/schedule')
    return { success: true }
  } catch (error) {
    console.error('Error starting schedule:', error)
    return { error: 'Failed to start schedule' }
  }
}

export async function endScheduleAction(scheduleId: string) {
  try {
    const user = await getCurrentUser()
    if (!hasPermission(user?.role, 'edit_schedule')) {
      return { error: 'Permission denied' }
    }

    await onScheduleEnded(scheduleId)
    
    revalidatePath('/app/schedule')
    return { success: true }
  } catch (error) {
    console.error('Error ending schedule:', error)
    return { error: 'Failed to end schedule' }
  }
}
