'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { 
  createJobCostEntry,
  deleteJobCostEntry,
  validateAllocationAmount
} from '@/lib/data/job-costs'
import { getReceipt } from '@/lib/data/receipts'
import { jobCostEntrySchema } from '@/lib/validations/job-costs'
import { JobCostEntryInsert } from '@/lib/db'

export async function createAllocationAction(formData: FormData) {
  // Extract form data
  const ownerType = formData.get('owner_type') as string
  const ownerId = formData.get('owner_id') as string
  const costTypeId = formData.get('cost_type_id') as string
  const costCodeId = formData.get('cost_code_id') as string
  const qty = parseFloat(formData.get('qty') as string)
  const unitCost = parseFloat(formData.get('unit_cost') as string)
  const receiptId = formData.get('receipt_id') as string
  const receiptLineItemId = formData.get('receipt_line_item_id') as string
  const description = formData.get('description') as string | null

  // Calculate amount
  const amount = Math.round(qty * unitCost * 100) / 100

  // Validate over-allocation before creating
  try {
    const validation = await validateAllocationAmount(receiptLineItemId, amount)
    
    if (!validation.valid) {
      return { 
        error: validation.error || 'Invalid allocation amount'
      }
    }
  } catch (error) {
    console.error('Error validating allocation:', error)
    return { error: 'Failed to validate allocation amount' }
  }

  // Build data object based on owner type
  const data: any = {
    cost_type_id: costTypeId,
    cost_code_id: costCodeId,
    qty,
    unit_cost: unitCost,
    receipt_id: receiptId,
    receipt_line_item_id: receiptLineItemId,
    description,
  }

  // Set project_id or work_order_id based on owner type
  if (ownerType === 'project') {
    data.project_id = ownerId
    data.work_order_id = null
  } else if (ownerType === 'work_order') {
    data.work_order_id = ownerId
    data.project_id = null
  }

  // Validate with Zod schema
  const parsed = jobCostEntrySchema.safeParse(data)
  
  if (!parsed.success) {
    const errors = parsed.error.flatten()
    return { 
      error: errors.fieldErrors?.project_id?.[0] || 'Invalid form data'
    }
  }

  try {
    // Get receipt to use its date
    const receipt = await getReceipt(receiptId)
    
    // Create the job cost entry
    const entryData: JobCostEntryInsert = {
      project_id: parsed.data.project_id || null,
      work_order_id: parsed.data.work_order_id || null,
      cost_type_id: parsed.data.cost_type_id,
      cost_code_id: parsed.data.cost_code_id,
      qty: parsed.data.qty,
      unit_cost: parsed.data.unit_cost,
      description: parsed.data.description,
      receipt_id: receiptId,
      receipt_line_item_id: receiptLineItemId,
      txn_date: receipt.receipt_date || new Date().toISOString().split('T')[0],
      source_type: 'receipt_manual',
      sync_status: 'pending',
    }

    await createJobCostEntry(entryData)

    // Revalidate relevant paths
    revalidatePath(`/app/receipts/${receiptId}`)
    revalidatePath(`/app/receipts/${receiptId}/lines/${receiptLineItemId}/allocate`)
    
    return { success: true }
  } catch (error) {
    console.error('Error creating allocation:', error)
    return { error: 'Failed to create allocation' }
  }
}

export async function deleteAllocationAction(id: string, receiptId: string, lineItemId: string) {
  try {
    await deleteJobCostEntry(id)

    // Revalidate relevant paths
    revalidatePath(`/app/receipts/${receiptId}`)
    revalidatePath(`/app/receipts/${receiptId}/lines/${lineItemId}/allocate`)

    return { success: true }
  } catch (error) {
    console.error('Error deleting allocation:', error)
    return { error: 'Failed to delete allocation' }
  }
}
