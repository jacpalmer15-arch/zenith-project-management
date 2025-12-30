'use client'
import { toast } from 'sonner'
import type { ActionResult } from '@/lib/errors/handler'

export function showActionResult<T>(
  result: ActionResult<T>,
  options?: {
    successMessage?: string
    onSuccess?: (data?: T) => void
  }
) {
  if (result.success) {
    if (options?.successMessage) {
      toast.success(options.successMessage)
    }
    options?.onSuccess?.(result.data)
  } else {
    // Show user-friendly error
    toast.error(result.error, {
      description: result.code === 'VALIDATION_ERROR' && result.details?.issues
        ? result.details.issues.join('\n')
        : undefined
    })
  }
  
  return result
}
