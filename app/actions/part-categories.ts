'use server'

import { revalidatePath } from 'next/cache'
import { createPartCategory, updatePartCategory } from '@/lib/data'
import { partCategorySchema } from '@/lib/validations'

export async function createPartCategoryAction(formData: FormData) {
  const data = {
    name: formData.get('name') as string,
    sort_order: parseInt(formData.get('sort_order') as string) || 0,
  }

  const parsed = partCategorySchema.safeParse(data)
  
  if (!parsed.success) {
    return { success: false, error: 'Invalid form data' }
  }

  try {
    await createPartCategory(parsed.data)
    revalidatePath('/app/parts/categories')
    revalidatePath('/app/parts')
    return { success: true }
  } catch (error) {
    console.error('Error creating part category:', error)
    return { success: false, error: 'Failed to create category' }
  }
}

export async function updatePartCategoryAction(formData: FormData) {
  const id = formData.get('id') as string
  const data = {
    name: formData.get('name') as string,
    sort_order: parseInt(formData.get('sort_order') as string) || 0,
  }

  const parsed = partCategorySchema.safeParse(data)
  
  if (!parsed.success) {
    return { success: false, error: 'Invalid form data' }
  }

  try {
    await updatePartCategory(id, parsed.data)
    revalidatePath('/app/parts/categories')
    revalidatePath('/app/parts')
    return { success: true }
  } catch (error) {
    console.error('Error updating part category:', error)
    return { success: false, error: 'Failed to update category' }
  }
}
