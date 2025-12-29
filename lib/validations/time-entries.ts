import { z } from 'zod'

export const timeEntrySchema = z.object({
  work_order_id: z.string().uuid('Please select a work order'),
  tech_user_id: z.string().uuid('Please select an employee'),
  clock_in_at: z.string().min(1, 'Clock in time is required'),
  clock_out_at: z.string().optional().nullable(),
  break_minutes: z.number().min(0).default(0),
  notes: z.string().optional().nullable(),
}).refine(
  (data) => {
    if (data.clock_out_at) {
      return new Date(data.clock_out_at) > new Date(data.clock_in_at)
    }
    return true
  },
  {
    message: 'Clock out time must be after clock in time',
    path: ['clock_out_at'],
  }
)

export type TimeEntryFormData = z.infer<typeof timeEntrySchema>
