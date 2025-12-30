import { 
  WorkflowError, 
  InvalidTransitionError,
  MissingDataError,
  PermissionDeniedError,
  ValidationError,
  NotFoundError,
  ConflictError
} from './index'

export type ActionResult<T = void> = 
  | { success: true; data?: T }
  | { success: false; error: string; code: string; details?: Record<string, any> }

export function handleWorkflowError(error: unknown): ActionResult<never> {
  // Log for developers
  console.error('[Workflow Error]', error)
  
  // Handle known error types
  if (error instanceof WorkflowError) {
    return {
      success: false,
      error: error.userMessage,
      code: error.code,
      details: error.details
    }
  }
  
  // Handle Supabase errors
  if (error && typeof error === 'object' && 'code' in error) {
    const supabaseError = error as { code: string; message: string }
    
    // Map common Supabase errors to user-friendly messages
    const errorMap: Record<string, string> = {
      '23505': 'A record with this information already exists',
      '23503': 'This record is referenced by other data and cannot be modified',
      '42501': 'You don\'t have permission to perform this action',
      'PGRST116': 'Record not found'
    }
    
    return {
      success: false,
      error: errorMap[supabaseError.code] || 'A database error occurred',
      code: supabaseError.code
    }
  }
  
  // Fallback for unknown errors
  return {
    success: false,
    error: 'An unexpected error occurred. Please try again.',
    code: 'UNKNOWN_ERROR'
  }
}

export async function withErrorHandling<T>(
  fn: () => Promise<T>
): Promise<ActionResult<T>> {
  try {
    const data = await fn()
    return { success: true, data }
  } catch (error) {
    return handleWorkflowError(error)
  }
}
