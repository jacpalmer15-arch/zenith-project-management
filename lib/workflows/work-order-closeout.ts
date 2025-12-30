'use server'

import { WorkOrder } from '@/lib/db'
import { getWorkOrder } from '@/lib/data/work-orders'
import { listTimeEntries } from '@/lib/data/time-entries'
import { listReceipts } from '@/lib/data/receipts'

export type CloseoutValidation = {
  canClose: boolean
  issues: string[]
  workOrder: WorkOrder
}

/**
 * Validate if a work order can be closed
 */
export async function validateWorkOrderClose(
  workOrderId: string
): Promise<CloseoutValidation> {
  const [wo, openTime, unallocatedReceipts] = await Promise.all([
    getWorkOrder(workOrderId),
    listTimeEntries({ 
      work_order_id: workOrderId, 
      clock_out: null 
    }),
    listReceipts({ 
      work_order_id: workOrderId, 
      is_allocated: false 
    })
  ])
  
  const issues: string[] = []
  
  if (wo.status !== 'COMPLETED') {
    issues.push('Work order must be COMPLETED before closing')
  }
  
  if (openTime.length > 0) {
    issues.push(`${openTime.length} open time entries (missing clock out)`)
  }
  
  if (unallocatedReceipts.length > 0) {
    issues.push(`${unallocatedReceipts.length} unallocated receipts`)
  }
  
  return {
    canClose: issues.length === 0,
    issues,
    workOrder: wo
  }
}
