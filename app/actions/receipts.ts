'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { 
  createReceipt, 
  updateReceipt, 
  deleteReceipt, 
  getReceipt,
  createReceiptLineItem,
  updateReceiptLineItem,
  deleteReceiptLineItem,
  getNextLineNumber,
  lineItemHasAllocations
} from '@/lib/data/receipts'
import { createJobCostEntry } from '@/lib/data/cost-entries'
import { receiptSchema, receiptLineItemSchema } from '@/lib/validations'
import { ReceiptInsert, ReceiptUpdate } from '@/lib/db'

export async function createReceiptAction(formData: FormData) {
  // Parse form data - preserve null for missing fields
  const data = {
    vendor_name: formData.has('vendor_name') ? (formData.get('vendor_name') as string) : null,
    receipt_date: formData.has('receipt_date') ? (formData.get('receipt_date') as string) : null,
    total_amount: formData.get('total_amount') as string,
    storage_path: formData.has('storage_path') ? (formData.get('storage_path') as string) : null,
    notes: formData.has('notes') ? (formData.get('notes') as string) : null,
  }

  // Validate with zod
  const parsed = receiptSchema.safeParse(data)
  
  if (!parsed.success) {
    return { error: 'Invalid form data' }
  }

  try {
    // Create receipt with proper typing
    const receiptData: ReceiptInsert = {
      vendor_name: parsed.data.vendor_name,
      receipt_date: parsed.data.receipt_date,
      total_amount: parsed.data.total_amount,
      storage_path: parsed.data.storage_path || '',
      notes: parsed.data.notes,
    }
    
    const receipt = await createReceipt(receiptData)

    revalidatePath('/app/receipts')
    redirect(`/app/receipts/${receipt.id}`)
  } catch (error) {
    console.error('Error creating receipt:', error)
    return { error: 'Failed to create receipt' }
  }
}

export async function updateReceiptAction(id: string, formData: FormData) {
  // Parse form data - preserve null for missing fields
  const data = {
    vendor_name: formData.has('vendor_name') ? (formData.get('vendor_name') as string) : null,
    receipt_date: formData.has('receipt_date') ? (formData.get('receipt_date') as string) : null,
    total_amount: formData.get('total_amount') as string,
    storage_path: formData.has('storage_path') ? (formData.get('storage_path') as string) : null,
    notes: formData.has('notes') ? (formData.get('notes') as string) : null,
  }

  // Validate with zod
  const parsed = receiptSchema.safeParse(data)
  
  if (!parsed.success) {
    return { error: 'Invalid form data' }
  }

  try {
    // Update receipt - only include fields that are present
    const receiptData: ReceiptUpdate = {
      vendor_name: parsed.data.vendor_name,
      receipt_date: parsed.data.receipt_date,
      total_amount: parsed.data.total_amount,
      storage_path: parsed.data.storage_path || undefined,
      notes: parsed.data.notes,
    }
    
    await updateReceipt(id, receiptData)
    revalidatePath('/app/receipts')
    revalidatePath(`/app/receipts/${id}`)
  } catch (error) {
    console.error('Error updating receipt:', error)
    return { error: 'Failed to update receipt' }
  }

  redirect(`/app/receipts/${id}`)
}

export async function deleteReceiptAction(id: string) {
  try {
    await deleteReceipt(id)
    revalidatePath('/app/receipts')
  } catch (error) {
    console.error('Error deleting receipt:', error)
    return { error: 'Failed to delete receipt' }
  }

  redirect('/app/receipts')
}

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
        cost_type_id: '00000000-0000-0000-0000-000000000000', // TODO: Map to appropriate cost type
        cost_code_id: '00000000-0000-0000-0000-000000000000', // TODO: Map to appropriate cost code
        description: `Receipt - ${receipt.vendor_name}`,
        qty: 1,
        unit_cost: receipt.total_amount,
        receipt_id: receiptId,
        txn_date: receipt.receipt_date
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

export async function createLineItemAction(formData: FormData) {
  const receiptId = formData.get('receipt_id') as string
  
  // Get next line number
  const lineNo = await getNextLineNumber(receiptId)
  
  const data = {
    receipt_id: receiptId,
    line_no: lineNo,
    description: formData.get('description') as string,
    qty: parseFloat(formData.get('qty') as string),
    unit_cost: parseFloat(formData.get('unit_cost') as string),
    uom: (formData.get('uom') as string) || null,
    part_id: (formData.get('part_id') as string) || null,
  }
  
  const parsed = receiptLineItemSchema.safeParse(data)
  
  if (!parsed.success) {
    return { error: 'Invalid form data', details: parsed.error.issues }
  }
  
  try {
    await createReceiptLineItem(parsed.data)
    revalidatePath(`/app/receipts/${receiptId}`)
    return { success: true }
  } catch (error) {
    console.error('Error creating line item:', error)
    return { error: 'Failed to create line item' }
  }
}

export async function updateLineItemAction(id: string, formData: FormData) {
  const receiptId = formData.get('receipt_id') as string
  
  // Check if line item has allocations before updating
  const hasAllocations = await lineItemHasAllocations(id)
  
  if (hasAllocations) {
    return { 
      error: 'Cannot edit this line item. It has allocations. Delete allocations first to make changes.' 
    }
  }
  
  const data = {
    description: formData.get('description') as string,
    qty: parseFloat(formData.get('qty') as string),
    unit_cost: parseFloat(formData.get('unit_cost') as string),
    uom: (formData.get('uom') as string) || null,
    part_id: (formData.get('part_id') as string) || null,
  }
  
  // Don't validate line_no and receipt_id for updates
  const updateSchema = receiptLineItemSchema.omit({ line_no: true, receipt_id: true })
  const parsed = updateSchema.safeParse(data)
  
  if (!parsed.success) {
    return { error: 'Invalid form data', details: parsed.error.issues }
  }
  
  try {
    await updateReceiptLineItem(id, parsed.data)
    revalidatePath(`/app/receipts/${receiptId}`)
    return { success: true }
  } catch (error) {
    console.error('Error updating line item:', error)
    return { error: 'Failed to update line item' }
  }
}

export async function deleteLineItemAction(id: string, receiptId: string) {
  try {
    // Check if line item has allocations before deleting
    const hasAllocations = await lineItemHasAllocations(id)
    
    if (hasAllocations) {
      return { 
        error: 'Cannot delete line item with allocations. Remove allocations first.' 
      }
    }
    
    await deleteReceiptLineItem(id)
    revalidatePath(`/app/receipts/${receiptId}`)
    return { success: true }
  } catch (error) {
    console.error('Error deleting line item:', error)
    return { error: 'Failed to delete line item' }
  }
}
