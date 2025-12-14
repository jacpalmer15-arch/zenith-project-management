'use server'

import { revalidatePath } from 'next/cache'
import { updateSettings } from '@/lib/data/settings'
import { settingsSchema } from '@/lib/validations/settings'

export async function updateSettingsAction(formData: FormData) {
  try {
    const id = formData.get('id') as string
    
    // Parse form data
    const data = {
      company_name: formData.get('company_name') as string,
      company_phone: formData.get('company_phone') as string | null,
      company_email: formData.get('company_email') as string,
      company_address: formData.get('company_address') as string | null,
      default_quote_terms: formData.get('default_quote_terms') as string,
      default_tax_rule_id: formData.get('default_tax_rule_id') as string | null,
      customer_number_prefix: formData.get('customer_number_prefix') as string,
      project_number_prefix: formData.get('project_number_prefix') as string,
      quote_number_prefix: formData.get('quote_number_prefix') as string,
    }

    // Validate with zod
    const validated = settingsSchema.parse(data)

    // Update settings
    await updateSettings(id, validated)

    // Revalidate the settings page
    revalidatePath('/app/settings')

    return { success: true }
  } catch (error) {
    console.error('Error updating settings:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update settings' 
    }
  }
}
