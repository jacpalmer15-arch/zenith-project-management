'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createPart, updatePart } from '@/lib/data'
import { partSchema } from '@/lib/validations'

export async function createPartAction(formData: FormData) {
  // Parse form data
  const data = {
    sku: (formData.get('sku') as string) || null,
    name: formData.get('name') as string,
    description_default: (formData.get('description_default') as string) || '',
    category_id: (formData.get('category_id') as string) || null,
    uom: formData.get('uom') as string,
    is_taxable: formData.get('is_taxable') === 'true',
    cost_type_id: (formData.get('cost_type_id') as string) || null,
    cost_code_id: (formData.get('cost_code_id') as string) || null,
    sell_price: parseFloat(formData.get('sell_price') as string) || 0,
    is_active: formData.get('is_active') === 'true',
  }

  const parsed = partSchema.safeParse(data)
  
  if (!parsed.success) {
    return { error: 'Invalid form data' }
  }

  try {
    await createPart(parsed.data)
    revalidatePath('/app/parts')
  } catch (error) {
    console.error('Error creating part:', error)
    return { error: 'Failed to create part' }
  }

  redirect('/app/parts')
}

export async function updatePartAction(id: string, formData: FormData) {
  // Parse form data
  const data = {
    sku: (formData.get('sku') as string) || null,
    name: formData.get('name') as string,
    description_default: (formData.get('description_default') as string) || '',
    category_id: (formData.get('category_id') as string) || null,
    uom: formData.get('uom') as string,
    is_taxable: formData.get('is_taxable') === 'true',
    cost_type_id: (formData.get('cost_type_id') as string) || null,
    cost_code_id: (formData.get('cost_code_id') as string) || null,
    sell_price: parseFloat(formData.get('sell_price') as string) || 0,
    is_active: formData.get('is_active') === 'true',
  }

  const parsed = partSchema.safeParse(data)
  
  if (!parsed.success) {
    return { error: 'Invalid form data' }
  }

  try {
    await updatePart(id, parsed.data)
    revalidatePath('/app/parts')
    revalidatePath(`/app/parts/${id}/edit`)
  } catch (error) {
    console.error('Error updating part:', error)
    return { error: 'Failed to update part' }
  }

  redirect('/app/parts')
}
