'use server'

import { revalidatePath } from 'next/cache'
import { createJobCostEntry, updateJobCostEntry, deleteJobCostEntry, getJobCostEntry } from '@/lib/data'
import { validateCostEntryMutable } from '@/lib/validations/data-consistency'
import { withErrorHandling } from '@/lib/errors/handler'
import { getCurrentUser } from '@/lib/auth/get-user'

export async function createJobCostEntryAction(data: any) {
  return withErrorHandling(async () => {
    const user = await getCurrentUser()
    
    // Check if work order is closed
    if (data.work_order_id) {
      await validateCostEntryMutable(
        { work_order_id: data.work_order_id },
        user?.role || 'TECH'
      )
    }
    
    const costEntry = await createJobCostEntry(data)
    
    if (data.work_order_id) {
      revalidatePath(`/app/work-orders/${data.work_order_id}`)
    }
    if (data.project_id) {
      revalidatePath(`/app/projects/${data.project_id}`)
    }
    revalidatePath('/app/receipts')
    return costEntry
  })
}

export async function updateJobCostEntryAction(
  id: string, 
  data: any,
  adminReason?: string
) {
  return withErrorHandling(async () => {
    const user = await getCurrentUser()
    const existing = await getJobCostEntry(id)
    
    // Check if work order is closed
    if (existing.work_order_id) {
      await validateCostEntryMutable(
        { work_order_id: existing.work_order_id },
        user?.role || 'TECH',
        adminReason
      )
    }
    
    await updateJobCostEntry(id, data)
    
    if (existing.work_order_id) {
      revalidatePath(`/app/work-orders/${existing.work_order_id}`)
    }
    if (existing.project_id) {
      revalidatePath(`/app/projects/${existing.project_id}`)
    }
    revalidatePath('/app/receipts')
  })
}

export async function deleteJobCostEntryAction(id: string, adminReason?: string) {
  return withErrorHandling(async () => {
    const user = await getCurrentUser()
    const existing = await getJobCostEntry(id)
    
    // Check if work order is closed
    if (existing.work_order_id) {
      await validateCostEntryMutable(
        { work_order_id: existing.work_order_id },
        user?.role || 'TECH',
        adminReason
      )
    }
    
    await deleteJobCostEntry(id)
    
    if (existing.work_order_id) {
      revalidatePath(`/app/work-orders/${existing.work_order_id}`)
    }
    if (existing.project_id) {
      revalidatePath(`/app/projects/${existing.project_id}`)
    }
    revalidatePath('/app/receipts')
  })
}
