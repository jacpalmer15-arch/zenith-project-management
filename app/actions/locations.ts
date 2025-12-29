'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createLocation, updateLocation } from '@/lib/data'
import { locationSchema } from '@/lib/validations/locations'

export async function createLocationAction(formData: FormData) {
  // Parse form data
  const data = {
    customer_id: formData.get('customer_id') as string,
    label: (formData.get('label') as string) || null,
    street: formData.get('street') as string,
    city: formData.get('city') as string,
    state: formData.get('state') as string,
    zip: formData.get('zip') as string,
    notes: (formData.get('notes') as string) || null,
    is_active: formData.get('is_active') !== 'false',
  }

  // Validate with zod
  const parsed = locationSchema.safeParse(data)
  
  if (!parsed.success) {
    return { error: 'Invalid form data' }
  }

  try {
    await createLocation(parsed.data)
    revalidatePath('/app/locations')
    revalidatePath(`/app/customers/${data.customer_id}`)
  } catch (error) {
    console.error('Error creating location:', error)
    return { error: 'Failed to create location' }
  }

  redirect('/app/locations')
}

export async function updateLocationAction(id: string, formData: FormData) {
  // Parse form data
  const data = {
    customer_id: formData.get('customer_id') as string,
    label: (formData.get('label') as string) || null,
    street: formData.get('street') as string,
    city: formData.get('city') as string,
    state: formData.get('state') as string,
    zip: formData.get('zip') as string,
    notes: (formData.get('notes') as string) || null,
    is_active: formData.get('is_active') !== 'false',
  }

  // Validate with zod
  const parsed = locationSchema.safeParse(data)
  
  if (!parsed.success) {
    return { error: 'Invalid form data' }
  }

  try {
    await updateLocation(id, parsed.data)
    revalidatePath('/app/locations')
    revalidatePath(`/app/locations/${id}`)
    revalidatePath(`/app/locations/${id}/edit`)
  } catch (error) {
    console.error('Error updating location:', error)
    return { error: 'Failed to update location' }
  }

  redirect('/app/locations')
}
