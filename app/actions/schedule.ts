'use server'

import { revalidatePath } from 'next/cache'
import { createScheduleEntry, updateScheduleEntry, deleteScheduleEntry } from '@/lib/data'
import { scheduleEntrySchema } from '@/lib/validations/schedule'
import { onScheduleCreated, onScheduleStarted, onScheduleEnded } from '@/lib/workflows/schedule-sync'

export async function createScheduleEntryAction(data: {
  work_order_id: string
  tech_user_id: string
  start_at: string
  end_at: string
  status?: 'PLANNED' | 'DISPATCHED' | 'ARRIVED' | 'DONE' | 'CANCELED'
}) {
  // Validate with zod
  const parsed = scheduleEntrySchema.safeParse(data)
  
  if (!parsed.success) {
    return { error: 'Invalid form data' }
  }

  try {
    // Create schedule entry
    const schedule = await createScheduleEntry(parsed.data)
    
    // Trigger auto-transition
    await onScheduleCreated(schedule)

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
  status?: 'PLANNED' | 'DISPATCHED' | 'ARRIVED' | 'DONE' | 'CANCELED'
}) {
  try {
    await updateScheduleEntry(id, data)
    
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
    await deleteScheduleEntry(id)
    
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
    await onScheduleStarted(scheduleId)
    
    revalidatePath('/app/schedule')
    return { success: true }
  } catch (error) {
    console.error('Error starting schedule:', error)
    return { error: 'Failed to start schedule' }
  }
}

export async function endScheduleAction(scheduleId: string) {
  try {
    await onScheduleEnded(scheduleId)
    
    revalidatePath('/app/schedule')
    return { success: true }
  } catch (error) {
    console.error('Error ending schedule:', error)
    return { error: 'Failed to end schedule' }
  }
}
