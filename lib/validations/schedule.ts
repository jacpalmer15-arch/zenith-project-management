import { z } from 'zod'

export const scheduleEntrySchema = z.object({
  work_order_id: z.string().uuid('Please select a work order'),
  tech_user_id: z.string().uuid('Please select an employee'),
  start_at: z.string().min(1, 'Start time is required'),
  end_at: z.string().min(1, 'End time is required'),
  status: z.enum(['PLANNED', 'DISPATCHED', 'ARRIVED', 'DONE', 'CANCELED']).default('PLANNED'),
}).refine(
  (data) => {
    return new Date(data.end_at) > new Date(data.start_at)
  },
  {
    message: 'End time must be after start time',
    path: ['end_at'],
  }
)

export type ScheduleEntryFormData = z.infer<typeof scheduleEntrySchema>
