'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createWorkOrder, updateWorkOrder } from '@/lib/data'
import { canTransitionStatus } from '@/lib/utils/work-order-utils'
import { getNextNumber } from '@/lib/data'
import { workOrderSchema } from '@/lib/validations/work-orders'
import { WorkStatus } from '@/lib/db'
import { transitionWorkOrder } from '@/lib/workflows/work-order-lifecycle'
import { validateWorkOrderClose } from '@/lib/workflows/work-order-closeout'
import { InvalidTransitionError, ValidationError } from '@/lib/workflows/errors'

export async function createWorkOrderAction(formData: FormData) {
  // Parse form data
  const data = {
    customer_id: formData.get('customer_id') as string,
    location_id: formData.get('location_id') as string,
    priority: parseInt(formData.get('priority') as string) || 3,
    summary: formData.get('summary') as string,
    description: (formData.get('description') as string) || '',
    requested_window_start: (formData.get('requested_window_start') as string) || null,
    requested_window_end: (formData.get('requested_window_end') as string) || null,
    assigned_to: (formData.get('assigned_to') as string) || null,
    status: 'UNSCHEDULED' as WorkStatus,
  }

  // Validate with zod
  const parsed = workOrderSchema.safeParse(data)
  
  if (!parsed.success) {
    return { error: 'Invalid form data' }
  }

  try {
    // Generate work order number
    const workOrderNo = await getNextNumber('work_order')
    
    // Create work order
    await createWorkOrder({
      ...parsed.data,
      work_order_no: workOrderNo,
    })

    revalidatePath('/app/work-orders')
  } catch (error) {
    console.error('Error creating work order:', error)
    return { error: 'Failed to create work order' }
  }

  redirect('/app/work-orders')
}

export async function updateWorkOrderAction(id: string, formData: FormData) {
  // Parse form data - exclude status from updates as it should only be changed via workflow
  const data = {
    customer_id: formData.get('customer_id') as string,
    location_id: formData.get('location_id') as string,
    priority: parseInt(formData.get('priority') as string) || 3,
    summary: formData.get('summary') as string,
    description: (formData.get('description') as string) || '',
    requested_window_start: (formData.get('requested_window_start') as string) || null,
    requested_window_end: (formData.get('requested_window_end') as string) || null,
    assigned_to: (formData.get('assigned_to') as string) || null,
  }

  // Validate with zod - add status field temporarily for validation, then remove it
  const dataWithStatus = {
    ...data,
    status: 'UNSCHEDULED' as WorkStatus, // Dummy value for validation
  }
  
  const parsed = workOrderSchema.safeParse(dataWithStatus)
  
  if (!parsed.success) {
    return { error: 'Invalid form data' }
  }

  // Remove status from the data to be updated
  const { status, ...updateData } = parsed.data

  try {
    await updateWorkOrder(id, updateData)
    revalidatePath('/app/work-orders')
    revalidatePath(`/app/work-orders/${id}`)
    revalidatePath(`/app/work-orders/${id}/edit`)
  } catch (error) {
    console.error('Error updating work order:', error)
    return { error: 'Failed to update work order' }
  }

  redirect(`/app/work-orders/${id}`)
}

export async function updateWorkOrderStatusAction(id: string, newStatus: WorkStatus, reason?: string) {
  try {
    const result = await transitionWorkOrder(id, newStatus, reason)
    
    revalidatePath('/app/work-orders')
    revalidatePath(`/app/work-orders/${id}`)
    
    return { 
      success: true, 
      transition: result 
    }
  } catch (error) {
    if (error instanceof InvalidTransitionError || 
        error instanceof ValidationError) {
      return { error: error.message }
    }
    throw error
  }
}

export async function closeWorkOrder(id: string, reason: string) {
  const validation = await validateWorkOrderClose(id)
  
  if (!validation.canClose) {
    return { 
      error: 'Cannot close work order',
      issues: validation.issues 
    }
  }
  
  return updateWorkOrderStatusAction(id, 'CLOSED', reason)
}
