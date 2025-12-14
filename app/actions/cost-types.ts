'use server'

import { revalidatePath } from 'next/cache'
import { createCostType, updateCostType } from '@/lib/data'
import { costTypeSchema } from '@/lib/validations'

export async function createCostTypeAction(formData: FormData) {
  const data = {
    name: formData.get('name') as string,
    sort_order: parseInt(formData.get('sort_order') as string) || 0,
  }

  const parsed = costTypeSchema.safeParse(data)
  
  if (!parsed.success) {
    return { success: false, error: 'Invalid form data' }
  }

  try {
    await createCostType(parsed.data)
    revalidatePath('/app/parts/cost-types')
    revalidatePath('/app/parts')
    return { success: true }
  } catch (error) {
    console.error('Error creating cost type:', error)
    return { success: false, error: 'Failed to create cost type' }
  }
}

export async function updateCostTypeAction(formData: FormData) {
  const id = formData.get('id') as string
  const data = {
    name: formData.get('name') as string,
    sort_order: parseInt(formData.get('sort_order') as string) || 0,
  }

  const parsed = costTypeSchema.safeParse(data)
  
  if (!parsed.success) {
    return { success: false, error: 'Invalid form data' }
  }

  try {
    await updateCostType(id, parsed.data)
    revalidatePath('/app/parts/cost-types')
    revalidatePath('/app/parts')
    return { success: true }
  } catch (error) {
    console.error('Error updating cost type:', error)
    return { success: false, error: 'Failed to update cost type' }
  }
}
