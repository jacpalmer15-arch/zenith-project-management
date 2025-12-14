'use server'

import { revalidatePath } from 'next/cache'
import { createTaxRule, updateTaxRule } from '@/lib/data/tax-rules'
import { taxRuleSchema } from '@/lib/validations/tax-rules'

export async function createTaxRuleAction(formData: FormData) {
  try {
    // Parse form data - rate comes as percentage, convert to decimal
    const ratePercent = parseFloat(formData.get('rate') as string)
    const data = {
      name: formData.get('name') as string,
      rate: ratePercent / 100, // Convert percentage to decimal (0-1)
      is_active: formData.get('is_active') === 'true',
    }

    // Validate with zod
    const validated = taxRuleSchema.parse(data)

    // Create tax rule
    await createTaxRule(validated)

    // Revalidate the settings page
    revalidatePath('/app/settings')

    return { success: true }
  } catch (error) {
    console.error('Error creating tax rule:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create tax rule' 
    }
  }
}

export async function updateTaxRuleAction(formData: FormData) {
  try {
    const id = formData.get('id') as string
    
    // Parse form data - rate comes as percentage, convert to decimal
    const ratePercent = parseFloat(formData.get('rate') as string)
    const data = {
      name: formData.get('name') as string,
      rate: ratePercent / 100, // Convert percentage to decimal (0-1)
      is_active: formData.get('is_active') === 'true',
    }

    // Validate with zod
    const validated = taxRuleSchema.parse(data)

    // Update tax rule
    await updateTaxRule(id, validated)

    // Revalidate the settings page
    revalidatePath('/app/settings')

    return { success: true }
  } catch (error) {
    console.error('Error updating tax rule:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update tax rule' 
    }
  }
}
