'use server'

import { revalidatePath } from 'next/cache'
import { createTimeEntry, updateTimeEntry, deleteTimeEntry } from '@/lib/data'
import { timeEntrySchema } from '@/lib/validations/time-entries'

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
    await createTimeEntry(parsed.data)

    revalidatePath('/app/time')
    revalidatePath('/app/work-orders')
    revalidatePath(`/app/work-orders/${data.work_order_id}`)
    
    return { success: true }
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
    await updateTimeEntry(id, data)
    
    revalidatePath('/app/time')
    revalidatePath('/app/work-orders')
    if (data.work_order_id) {
      revalidatePath(`/app/work-orders/${data.work_order_id}`)
    }
    
    return { success: true }
  } catch (error) {
    console.error('Error updating time entry:', error)
    return { error: 'Failed to update time entry' }
  }
}

export async function deleteTimeEntryAction(id: string, workOrderId: string) {
  try {
    await deleteTimeEntry(id)
    
    revalidatePath('/app/time')
    revalidatePath('/app/work-orders')
    revalidatePath(`/app/work-orders/${workOrderId}`)
    
    return { success: true }
  } catch (error) {
    console.error('Error deleting time entry:', error)
    return { error: 'Failed to delete time entry' }
  }
}
