# Error Handling and Background Tasks

This document describes the standardized error handling system and background task infrastructure implemented in the Zenith Field Service Management application.

## Error Handling System

### Typed Error Classes

All workflow errors now extend the base `WorkflowError` class, which provides:
- User-friendly error messages (`userMessage`)
- Developer-friendly messages (in the `message` property)
- Error codes for programmatic handling
- Additional details for context

#### Available Error Classes

1. **WorkflowError** - Base class for all workflow errors
2. **InvalidTransitionError** - For invalid status transitions
3. **MissingDataError** - For required data that's missing
4. **PermissionDeniedError** - For permission violations
5. **ValidationError** - For validation failures
6. **NotFoundError** - For missing entities
7. **ConflictError** - For conflicting operations

#### Usage Example

```typescript
import { 
  InvalidTransitionError, 
  ValidationError,
  NotFoundError,
  PermissionDeniedError 
} from '@/lib/errors'

// Throw typed errors in your code
if (!workOrder) {
  throw new NotFoundError('Work Order', id)
}

if (!canTransition) {
  throw new InvalidTransitionError('OPEN', 'CLOSED')
}

if (validationIssues.length > 0) {
  throw new ValidationError(validationIssues)
}

if (!hasPermission(user?.role, 'edit_work_orders')) {
  throw new PermissionDeniedError('update status', 'work order')
}
```

### Error Handler Utility

The `withErrorHandling` wrapper simplifies error handling in server actions by automatically converting errors into `ActionResult` objects.

#### ActionResult Type

```typescript
type ActionResult<T = void> = 
  | { success: true; data?: T }
  | { success: false; error: string; code: string; details?: Record<string, any> }
```

#### Usage in Server Actions

```typescript
import { withErrorHandling } from '@/lib/errors/handler'
import { PermissionDeniedError } from '@/lib/errors'

export async function updateWorkOrderStatusAction(
  id: string,
  newStatus: WorkStatus,
  reason?: string
) {
  return withErrorHandling(async () => {
    const user = await getCurrentUser()
    
    if (!hasPermission(user?.role, 'edit_work_orders')) {
      throw new PermissionDeniedError('update status', 'work order')
    }
    
    const result = await transitionWorkOrder(id, newStatus, reason)
    
    revalidatePath('/app/work-orders')
    revalidatePath(`/app/work-orders/${id}`)
    
    return result
  })
}
```

### Toast Error Display

Use the `showActionResult` helper to display error messages to users via toast notifications:

```typescript
import { showActionResult } from '@/components/action-error-toast'

// In your component
const handleSubmit = async () => {
  const result = await updateWorkOrderStatusAction(id, 'COMPLETED')
  
  showActionResult(result, { 
    successMessage: 'Status updated successfully!',
    onSuccess: (data) => {
      // Handle success
      console.log('Transition result:', data)
    }
  })
}
```

### Error Boundary Component

Wrap parts of your application with the `ErrorBoundary` component to catch and display React errors gracefully:

```typescript
import { ErrorBoundary } from '@/components/error-boundary'

export function MyComponent() {
  return (
    <ErrorBoundary>
      <YourContent />
    </ErrorBoundary>
  )
}

// Or with a custom fallback
<ErrorBoundary fallback={<CustomErrorUI />}>
  <YourContent />
</ErrorBoundary>
```

## Background Task System

The background task system provides a simple inline task runner for asynchronous operations. Currently, tasks run inline (not in a real queue), but the infrastructure is ready for future integration with a proper job queue.

### Task Registration

Register tasks in `lib/tasks/sync-tasks.ts`:

```typescript
import { registerTask } from './index'

registerTask('sync:customer', async (payload: { customerId: string }) => {
  console.log('[Task] Syncing customer to QuickBooks:', payload.customerId)
  // Future: Call QB API here
})

registerTask('email:quote', async (payload: { quoteId: string; to: string }) => {
  console.log('[Task] Sending quote email:', payload)
  // Future: Call email service here
})
```

### Enqueuing Tasks

Enqueue tasks from anywhere in your server-side code:

```typescript
import { enqueueTask } from '@/lib/tasks'

// In a server action
export async function createCustomerAction(data: CustomerInput) {
  const customer = await createCustomer(data)
  
  // Enqueue background task to sync to QuickBooks
  await enqueueTask('sync:customer', { 
    customerId: customer.id 
  })
  
  return customer
}
```

### Task Handlers Available

Current task handlers (stubs for future implementation):

- `sync:customer` - Sync customer to QuickBooks
- `sync:invoice` - Sync invoice to QuickBooks
- `sync:payment` - Sync payment to QuickBooks
- `email:quote` - Send quote email
- `email:invoice` - Send invoice email

## Error Mapping

The error handler automatically maps Supabase error codes to user-friendly messages:

| Error Code | User Message |
|------------|--------------|
| 23505 | A record with this information already exists |
| 23503 | This record is referenced by other data and cannot be modified |
| 42501 | You don't have permission to perform this action |
| PGRST116 | Record not found |

## Best Practices

1. **Always use typed errors** - Throw specific error classes instead of generic Error objects
2. **Wrap server actions with withErrorHandling** - This ensures consistent error handling across the app
3. **Use showActionResult for UI feedback** - Provides consistent toast notifications for users
4. **Log developer details, show user-friendly messages** - Keep technical details in logs, show simple messages to users
5. **Add error boundaries for critical sections** - Catch unexpected React errors gracefully
6. **Register tasks for async operations** - Use the task system for operations that don't need immediate feedback

## Examples

### Complete Server Action with Error Handling

```typescript
'use server'

import { withErrorHandling } from '@/lib/errors/handler'
import { PermissionDeniedError, ValidationError } from '@/lib/errors'
import { getCurrentUser } from '@/lib/auth/get-user'
import { hasPermission } from '@/lib/auth/permissions'
import { enqueueTask } from '@/lib/tasks'

export async function createInvoiceAction(data: InvoiceInput) {
  return withErrorHandling(async () => {
    // Check permissions
    const user = await getCurrentUser()
    if (!hasPermission(user?.role, 'edit_quotes')) {
      throw new PermissionDeniedError('create', 'invoice')
    }
    
    // Validate
    const issues = validateInvoice(data)
    if (issues.length > 0) {
      throw new ValidationError(issues)
    }
    
    // Create invoice
    const invoice = await createInvoice(data)
    
    // Enqueue background task
    await enqueueTask('sync:invoice', { invoiceId: invoice.id })
    
    revalidatePath('/app/invoices')
    
    return invoice
  })
}
```

### Complete Component with Error Handling

```typescript
'use client'

import { useState } from 'react'
import { showActionResult } from '@/components/action-error-toast'
import { createInvoiceAction } from '@/app/actions/invoices'
import { ErrorBoundary } from '@/components/error-boundary'

function InvoiceForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true)
    
    const result = await createInvoiceAction(formData)
    
    showActionResult(result, {
      successMessage: 'Invoice created successfully!',
      onSuccess: (invoice) => {
        router.push(`/app/invoices/${invoice.id}`)
      }
    })
    
    setIsSubmitting(false)
  }
  
  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
    </form>
  )
}

export function InvoiceFormPage() {
  return (
    <ErrorBoundary>
      <InvoiceForm />
    </ErrorBoundary>
  )
}
```

## Migration Notes

- Old error classes in `lib/workflows/errors.ts` are now deprecated
- All server actions should be updated to use `withErrorHandling`
- Components should check `result.success` instead of `result.error`
- Use `showActionResult` for consistent toast notifications
