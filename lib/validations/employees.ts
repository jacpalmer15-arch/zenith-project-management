import { z } from 'zod'

export const employeeSchema = z.object({
  id: z.string().uuid(),
  display_name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email').optional().nullable(),
  phone: z.string().optional().nullable(),
  role: z.enum(['TECH', 'OFFICE', 'ADMIN']).default('TECH'),
  is_active: z.boolean().default(true),
})

export const employeeInsertSchema = employeeSchema.omit({ })

export const employeeUpdateSchema = employeeSchema.partial().omit({ id: true })

export type EmployeeFormData = z.infer<typeof employeeSchema>
export type EmployeeInsertFormData = z.infer<typeof employeeInsertSchema>
export type EmployeeUpdateFormData = z.infer<typeof employeeUpdateSchema>
