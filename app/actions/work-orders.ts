'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createWorkOrder, updateWorkOrder } from '@/lib/data'
import { canTransitionStatus } from '@/lib/utils/work-order-utils'
import { getNextNumber } from '@/lib/data'
import { workOrderSchema } from '@/lib/validations/work-orders'
import { WorkStatus } from '@/lib/db'

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
    status: (formData.get('status') as WorkStatus) || 'UNSCHEDULED',
  }

  // Validate with zod
  const parsed = workOrderSchema.safeParse(data)
  
  if (!parsed.success) {
    return { error: 'Invalid form data' }
  }

  try {
    await updateWorkOrder(id, parsed.data)
    revalidatePath('/app/work-orders')
    revalidatePath(`/app/work-orders/${id}`)
    revalidatePath(`/app/work-orders/${id}/edit`)
  } catch (error) {
    console.error('Error updating work order:', error)
    return { error: 'Failed to update work order' }
  }

  redirect(`/app/work-orders/${id}`)
}

export async function updateWorkOrderStatusAction(id: string, newStatus: WorkStatus) {
  try {
    // Get current work order to check current status
    const { getWorkOrder } = await import('@/lib/data')
    const workOrder = await getWorkOrder(id)
    
    // Validate transition
    const transition = canTransitionStatus(workOrder.status, newStatus)
    if (!transition.allowed) {
      return { error: transition.message || 'Invalid status transition' }
    }

    // Update status
    await updateWorkOrder(id, { status: newStatus })
    revalidatePath('/app/work-orders')
    revalidatePath(`/app/work-orders/${id}`)
    
    return { success: true }
  } catch (error) {
    console.error('Error updating work order status:', error)
    return { error: 'Failed to update work order status' }
  }
}
