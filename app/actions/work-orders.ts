'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createWorkOrder, updateWorkOrder, deleteWorkOrder } from '@/lib/data'
import { canTransitionStatus } from '@/lib/utils/work-order-utils'
import { getNextNumber } from '@/lib/data'
import { workOrderSchema } from '@/lib/validations/work-orders'
import { WorkStatus } from '@/lib/db'
import { transitionWorkOrder } from '@/lib/workflows/work-order-lifecycle'
import { validateWorkOrderClose } from '@/lib/workflows/work-order-closeout'
import { withErrorHandling, handleWorkflowError } from '@/lib/errors/handler'
import { PermissionDeniedError, ValidationError } from '@/lib/errors'
import { getCurrentUser } from '@/lib/auth/get-user'
import { hasPermission } from '@/lib/auth/permissions'
import { validateWorkOrderLocation } from '@/lib/validations/data-consistency'

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
    // Validate location required
    await validateWorkOrderLocation({
      location_id: parsed.data.location_id
    })
    
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
    // If changing location, validate not null
    if ('location_id' in updateData) {
      await validateWorkOrderLocation({
        location_id: updateData.location_id
      })
    }
    
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

export async function updateWorkOrderStatusAction(
  id: string,
  newStatus: WorkStatus,
  reason?: string
) {
  return withErrorHandling(async () => {
    const user = await getCurrentUser()
    
    if (!hasPermission(user?.role, 'edit_work_orders')) {
      throw new PermissionDeniedError('update status', 'work order')
    }
    
    const result = await transitionWorkOrder(id, newStatus, reason)
    
    revalidatePath('/app/work-orders')
    revalidatePath(`/app/work-orders/${id}`)
    
    return result
  })
}

export async function deleteWorkOrderAction(id: string) {
  return withErrorHandling(async () => {
    const user = await getCurrentUser()
    
    if (!hasPermission(user?.role, 'delete_records')) {
      throw new PermissionDeniedError('delete', 'work order')
    }
    
    await deleteWorkOrder(id)
    
    revalidatePath('/app/work-orders')
    
    return { deleted: true }
  })
}

export async function closeWorkOrder(id: string, reason: string) {
  return withErrorHandling(async () => {
    const user = await getCurrentUser()
    
    if (!hasPermission(user?.role, 'edit_work_orders')) {
      throw new PermissionDeniedError('close', 'work order')
    }
    
    const validation = await validateWorkOrderClose(id)
    
    if (!validation.canClose) {
      throw new ValidationError(validation.issues)
    }
    
    const result = await transitionWorkOrder(id, 'CLOSED', reason)
    
    revalidatePath('/app/work-orders')
    revalidatePath(`/app/work-orders/${id}`)
    
    return result
  })
}
