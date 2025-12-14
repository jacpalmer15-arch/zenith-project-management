'use server'

import { revalidatePath } from 'next/cache'
import { createCostCode, updateCostCode } from '@/lib/data'
import { costCodeSchema } from '@/lib/validations'

export async function createCostCodeAction(formData: FormData) {
  const data = {
    code: formData.get('code') as string,
    name: formData.get('name') as string,
    cost_type_id: formData.get('cost_type_id') as string,
    sort_order: parseInt(formData.get('sort_order') as string) || 0,
  }

  const parsed = costCodeSchema.safeParse(data)
  
  if (!parsed.success) {
    return { success: false, error: 'Invalid form data' }
  }

  try {
    await createCostCode(parsed.data)
    revalidatePath('/app/parts/cost-codes')
    revalidatePath('/app/parts')
    return { success: true }
  } catch (error) {
    console.error('Error creating cost code:', error)
    return { success: false, error: 'Failed to create cost code' }
  }
}

export async function updateCostCodeAction(formData: FormData) {
  const id = formData.get('id') as string
  const data = {
    code: formData.get('code') as string,
    name: formData.get('name') as string,
    cost_type_id: formData.get('cost_type_id') as string,
    sort_order: parseInt(formData.get('sort_order') as string) || 0,
  }

  const parsed = costCodeSchema.safeParse(data)
  
  if (!parsed.success) {
    return { success: false, error: 'Invalid form data' }
  }

  try {
    await updateCostCode(id, parsed.data)
    revalidatePath('/app/parts/cost-codes')
    revalidatePath('/app/parts')
    return { success: true }
  } catch (error) {
    console.error('Error updating cost code:', error)
    return { success: false, error: 'Failed to update cost code' }
  }
}
