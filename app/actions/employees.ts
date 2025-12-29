'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createEmployee, updateEmployee } from '@/lib/data'
import { employeeInsertSchema, employeeUpdateSchema } from '@/lib/validations/employees'

export async function createEmployeeAction(formData: FormData) {
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
