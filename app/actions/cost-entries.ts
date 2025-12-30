'use server'

import { revalidatePath } from 'next/cache'
import { createCostEntry, updateCostEntry, deleteCostEntry, getCostEntry } from '@/lib/data'
import { validateCostEntryMutable } from '@/lib/validations/data-consistency'
import { withErrorHandling } from '@/lib/errors/handler'
import { getCurrentUser } from '@/lib/auth/get-user'

export async function createCostEntryAction(data: any) {
  return withErrorHandling(async () => {
    const user = await getCurrentUser()
    
    // Check if work order is closed
    await validateCostEntryMutable(
      { work_order_id: data.work_order_id },
      user?.role || 'TECH'
    )
    
    const costEntry = await createCostEntry(data)
    
    revalidatePath(`/app/work-orders/${data.work_order_id}`)
    revalidatePath('/app/receipts')
    return costEntry
  })
}

export async function updateCostEntryAction(
  id: string, 
  data: any,
  adminReason?: string
) {
  return withErrorHandling(async () => {
    const user = await getCurrentUser()
    const existing = await getCostEntry(id)
    
    // Check if work order is closed
    await validateCostEntryMutable(
      { work_order_id: existing.work_order_id },
      user?.role || 'TECH',
      adminReason
    )
    
    await updateCostEntry(id, data)
    
    revalidatePath(`/app/work-orders/${existing.work_order_id}`)
    revalidatePath('/app/receipts')
  })
}

export async function deleteCostEntryAction(id: string, adminReason?: string) {
  return withErrorHandling(async () => {
    const user = await getCurrentUser()
    const existing = await getCostEntry(id)
    
    // Check if work order is closed
    await validateCostEntryMutable(
      { work_order_id: existing.work_order_id },
      user?.role || 'TECH',
      adminReason
    )
    
    await deleteCostEntry(id)
    
    revalidatePath(`/app/work-orders/${existing.work_order_id}`)
    revalidatePath('/app/receipts')
  })
}
