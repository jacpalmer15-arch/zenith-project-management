import { z } from 'zod'

export const settingsSchema = z.object({
  company_name: z.string().min(1, 'Company name is required'),
  company_phone: z.string().optional().nullable(),
  company_email: z.string().email('Invalid email').optional().nullable(),
  company_address: z.string().optional().nullable(),
  default_quote_terms: z.string(),
  default_tax_rule_id: z.string().uuid().optional().nullable(),
  customer_number_prefix: z.string().min(1),
  project_number_prefix: z.string().min(1),
  quote_number_prefix: z.string().min(1),
})

export type SettingsFormData = z.infer<typeof settingsSchema>
