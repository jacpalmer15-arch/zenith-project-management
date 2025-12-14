import { z } from 'zod'

export const projectSchema = z.object({
  customer_id: z.string().uuid('Customer is required'),
  name: z.string().min(1, 'Project name is required'),
  status: z.enum(['Planning', 'Quoted', 'Active', 'Completed', 'Closed']).default('Planning'),
  
  job_street: z.string().optional().nullable(),
  job_city: z.string().optional().nullable(),
  job_state: z.string().optional().nullable(),
  job_zip: z.string().optional().nullable(),
})

export type ProjectFormData = z.infer<typeof projectSchema>
