'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createEmployee, updateEmployee, getEmployee } from '@/lib/data'
import { employeeInsertSchema, employeeUpdateSchema } from '@/lib/validations/employees'
import { getCurrentUser } from '@/lib/auth/get-user'
import { requirePermission } from '@/lib/auth/permissions'

export async function createEmployeeAction(formData: FormData) {
  const user = await getCurrentUser()
  
  // Only ADMIN can create employees
  try {
    requirePermission(user?.role, 'edit_employees')
  } catch (error) {
    return { error: 'Permission denied: Only admins can create employees' }
  }
  
  // Parse form data
  const data = {
    id: formData.get('id') as string,
    display_name: formData.get('display_name') as string,
    email: (formData.get('email') as string) || null,
    phone: (formData.get('phone') as string) || null,
    role: (formData.get('role') as string) || 'TECH',
    is_active: formData.get('is_active') === 'true',
  }

  // Validate with zod
  const parsed = employeeInsertSchema.safeParse(data)
  
  if (!parsed.success) {
    return { error: 'Invalid form data' }
  }

  try {
    await createEmployee(parsed.data)
    revalidatePath('/app/employees')
  } catch (error) {
    console.error('Error creating employee:', error)
    return { error: 'Failed to create employee' }
  }

  redirect('/app/employees')
}

export async function updateEmployeeAction(id: string, formData: FormData) {
  const user = await getCurrentUser()
  
  // Only ADMIN can update employees
  try {
    requirePermission(user?.role, 'edit_employees')
  } catch (error) {
    return { error: 'Permission denied: Only admins can update employees' }
  }
  
  // Parse form data
  const data = {
    display_name: formData.get('display_name') as string,
    email: (formData.get('email') as string) || null,
    phone: (formData.get('phone') as string) || null,
    role: (formData.get('role') as string) || 'TECH',
    is_active: formData.get('is_active') === 'true',
  }

  // Validate with zod
  const parsed = employeeUpdateSchema.safeParse(data)
  
  if (!parsed.success) {
    return { error: 'Invalid form data' }
  }

  try {
    await updateEmployee(id, parsed.data)
    revalidatePath('/app/employees')
    revalidatePath(`/app/employees/${id}/edit`)
  } catch (error) {
    console.error('Error updating employee:', error)
    return { error: 'Failed to update employee' }
  }

  redirect('/app/employees')
}

export async function toggleEmployeeStatusAction(id: string) {
  const user = await getCurrentUser()
  
  // Only ADMIN can update employees
  try {
    requirePermission(user?.role, 'edit_employees')
  } catch (error) {
    return { error: 'Permission denied: Only admins can update employees' }
  }

  try {
    const employee = await getEmployee(id)
    await updateEmployee(id, { is_active: !employee.is_active })
    revalidatePath('/app/employees')
    return { success: true, is_active: !employee.is_active }
  } catch (error) {
    console.error('Error toggling employee status:', error)
    return { error: 'Failed to update employee status' }
  }
}
