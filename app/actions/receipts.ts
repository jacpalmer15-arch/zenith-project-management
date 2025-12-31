'use server'

import { getReceipt, updateReceipt } from '@/lib/data/receipts'
import { createJobCostEntry } from '@/lib/data/cost-entries'
import { revalidatePath } from 'next/cache'

/**
 * Bulk allocate multiple receipts to a work order
 */
export async function bulkAllocateReceipts(
  receiptIds: string[],
  workOrderId: string
) {
  try {
    const results = []
    
    for (const receiptId of receiptIds) {
      const receipt = await getReceipt(receiptId)
      
      // Allocate to work order
      await updateReceipt(receiptId, {
        is_allocated: true,
        allocated_to_work_order_id: workOrderId,
        allocated_overhead_bucket: null
      })
      
      // Create cost entry
      await createJobCostEntry({
        work_order_id: workOrderId,
        bucket: 'MATERIAL',
        origin: 'ZENITH_CAPTURED',
        description: `Receipt - ${receipt.vendor_name}`,
        qty: 1,
        unit_cost: receipt.total_amount,
        total_cost: receipt.total_amount,
        receipt_id: receiptId,
        occurred_at: receipt.receipt_date
      })
      
      results.push({ receiptId, success: true })
    }
    
    revalidatePath('/app/receipts')
    revalidatePath(`/app/work-orders/${workOrderId}`)
    
    return { 
      success: true, 
      allocated: results.length 
    }
  } catch (error) {
    console.error('Bulk allocation error:', error)
    return { error: 'Failed to allocate receipts' }
  }
}
