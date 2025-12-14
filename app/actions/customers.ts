'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createCustomer, updateCustomer } from '@/lib/data'
import { customerSchema } from '@/lib/validations'
import { getNextNumber } from '@/lib/data'

export async function createCustomerAction(formData: FormData) {
  // Parse form data
  const data = {
    name: formData.get('name') as string,
    contact_name: (formData.get('contact_name') as string) || null,
    phone: (formData.get('phone') as string) || null,
    email: (formData.get('email') as string) || '',
    billing_street: (formData.get('billing_street') as string) || null,
    billing_city: (formData.get('billing_city') as string) || null,
    billing_state: (formData.get('billing_state') as string) || null,
    billing_zip: (formData.get('billing_zip') as string) || null,
    service_street: (formData.get('service_street') as string) || null,
    service_city: (formData.get('service_city') as string) || null,
    service_state: (formData.get('service_state') as string) || null,
    service_zip: (formData.get('service_zip') as string) || null,
    notes: (formData.get('notes') as string) || null,
  }

  // Validate with zod
  const parsed = customerSchema.safeParse(data)
  
  if (!parsed.success) {
    return { error: 'Invalid form data' }
  }

  try {
    // Generate customer number
    const customerNo = await getNextNumber('customer')
    
    // Create customer
    await createCustomer({
      ...parsed.data,
      customer_no: customerNo,
    })

    revalidatePath('/app/customers')
  } catch (error) {
    console.error('Error creating customer:', error)
    return { error: 'Failed to create customer' }
  }

  redirect('/app/customers')
}

export async function updateCustomerAction(id: string, formData: FormData) {
  // Parse form data
  const data = {
    name: formData.get('name') as string,
    contact_name: (formData.get('contact_name') as string) || null,
    phone: (formData.get('phone') as string) || null,
    email: (formData.get('email') as string) || '',
    billing_street: (formData.get('billing_street') as string) || null,
    billing_city: (formData.get('billing_city') as string) || null,
    billing_state: (formData.get('billing_state') as string) || null,
    billing_zip: (formData.get('billing_zip') as string) || null,
    service_street: (formData.get('service_street') as string) || null,
    service_city: (formData.get('service_city') as string) || null,
    service_state: (formData.get('service_state') as string) || null,
    service_zip: (formData.get('service_zip') as string) || null,
    notes: (formData.get('notes') as string) || null,
  }

  // Validate with zod
  const parsed = customerSchema.safeParse(data)
  
  if (!parsed.success) {
    return { error: 'Invalid form data' }
  }

  try {
    await updateCustomer(id, parsed.data)
    revalidatePath('/app/customers')
    revalidatePath(`/app/customers/${id}/edit`)
  } catch (error) {
    console.error('Error updating customer:', error)
    return { error: 'Failed to update customer' }
  }

  redirect('/app/customers')
}
