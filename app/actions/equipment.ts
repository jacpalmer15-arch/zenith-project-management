'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createEquipment, updateEquipment, deleteEquipment } from '@/lib/data'
import { equipmentSchema } from '@/lib/validations'

export async function createEquipmentAction(formData: FormData) {
  const data = {
    name: formData.get('name') as string,
    serial_no: (formData.get('serial_no') as string) || null,
    hourly_rate: parseFloat((formData.get('hourly_rate') as string) || '0'),
    daily_rate: parseFloat((formData.get('daily_rate') as string) || '0'),
    is_active: formData.get('is_active') === 'true',
  }

  const parsed = equipmentSchema.safeParse(data)
  
  if (!parsed.success) {
    return { error: 'Invalid form data' }
  }

  try {
    await createEquipment(parsed.data)
    revalidatePath('/app/equipment')
  } catch (error) {
    console.error('Error creating equipment:', error)
    return { error: 'Failed to create equipment' }
  }

  redirect('/app/equipment')
}

export async function updateEquipmentAction(id: string, formData: FormData) {
  const data = {
    name: formData.get('name') as string,
    serial_no: (formData.get('serial_no') as string) || null,
    hourly_rate: parseFloat((formData.get('hourly_rate') as string) || '0'),
    daily_rate: parseFloat((formData.get('daily_rate') as string) || '0'),
    is_active: formData.get('is_active') === 'true',
  }

  const parsed = equipmentSchema.safeParse(data)
  
  if (!parsed.success) {
    return { error: 'Invalid form data' }
  }

  try {
    await updateEquipment(id, parsed.data)
    revalidatePath('/app/equipment')
    revalidatePath(`/app/equipment/${id}/edit`)
  } catch (error) {
    console.error('Error updating equipment:', error)
    return { error: 'Failed to update equipment' }
  }

  redirect('/app/equipment')
}

export async function deleteEquipmentAction(id: string) {
  try {
    await deleteEquipment(id)
    revalidatePath('/app/equipment')
    return { success: true }
  } catch (error) {
    console.error('Error deleting equipment:', error)
    return { error: 'Failed to delete equipment' }
  }
}
