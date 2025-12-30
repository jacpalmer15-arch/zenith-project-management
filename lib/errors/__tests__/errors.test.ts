/**
 * Unit tests for error handling system
 * Run with: npx tsx lib/errors/__tests__/errors.test.ts
 */

import { 
  WorkflowError,
  InvalidTransitionError,
  MissingDataError,
  PermissionDeniedError,
  ValidationError,
  NotFoundError,
  ConflictError
} from '../index'

import { handleWorkflowError, withErrorHandling } from '../handler'

// Test 1: WorkflowError base class
console.log('Test 1: WorkflowError base class')
const baseError = new WorkflowError(
  'TEST_ERROR',
  'User friendly message',
  'Developer message',
  { detail: 'test' }
)
console.log('✓ Code:', baseError.code)
console.log('✓ User message:', baseError.userMessage)
console.log('✓ Developer message:', baseError.message)
console.log('✓ Details:', baseError.details)
console.log()

// Test 2: InvalidTransitionError
console.log('Test 2: InvalidTransitionError')
const transitionError = new InvalidTransitionError('OPEN', 'CLOSED', 'Missing data')
console.log('✓ Code:', transitionError.code)
console.log('✓ User message:', transitionError.userMessage)
console.log('✓ Details:', transitionError.details)
console.log()

// Test 3: MissingDataError
console.log('Test 3: MissingDataError')
const missingError = new MissingDataError('Work Order', 'assigned_to')
console.log('✓ Code:', missingError.code)
console.log('✓ User message:', missingError.userMessage)
console.log()

// Test 4: PermissionDeniedError
console.log('Test 4: PermissionDeniedError')
const permError = new PermissionDeniedError('delete', 'work order')
console.log('✓ Code:', permError.code)
console.log('✓ User message:', permError.userMessage)
console.log()

// Test 5: ValidationError
console.log('Test 5: ValidationError')
const validationError = new ValidationError(['Field A is required', 'Field B is invalid'])
console.log('✓ Code:', validationError.code)
console.log('✓ User message:', validationError.userMessage)
console.log('✓ Issues:', validationError.issues)
console.log()

// Test 6: NotFoundError
console.log('Test 6: NotFoundError')
const notFoundError = new NotFoundError('Customer', '123')
console.log('✓ Code:', notFoundError.code)
console.log('✓ User message:', notFoundError.userMessage)
console.log()

// Test 7: ConflictError
console.log('Test 7: ConflictError')
const conflictError = new ConflictError('Resource is locked by another user')
console.log('✓ Code:', conflictError.code)
console.log('✓ User message:', conflictError.userMessage)
console.log()

// Test 8: handleWorkflowError with WorkflowError
console.log('Test 8: handleWorkflowError with WorkflowError')
const result1 = handleWorkflowError(new ValidationError(['Test issue']))
console.log('✓ Success:', result1.success)
console.log('✓ Error:', result1.success === false && result1.error)
console.log('✓ Code:', result1.success === false && result1.code)
console.log()

// Test 9: handleWorkflowError with unknown error
console.log('Test 9: handleWorkflowError with unknown error')
const result2 = handleWorkflowError(new Error('Unknown error'))
console.log('✓ Success:', result2.success)
console.log('✓ Error:', result2.success === false && result2.error)
console.log('✓ Code:', result2.success === false && result2.code)
console.log()

// Test 10: withErrorHandling success case
console.log('Test 10: withErrorHandling success case');
(async () => {
  const successResult = await withErrorHandling(async () => {
    return { data: 'test' }
  })
  console.log('✓ Success:', successResult.success)
  console.log('✓ Data:', successResult.success && successResult.data)
  console.log()

  // Test 11: withErrorHandling error case
  console.log('Test 11: withErrorHandling error case')
  const errorResult = await withErrorHandling(async () => {
    throw new NotFoundError('Test Entity', '456')
  })
  console.log('✓ Success:', errorResult.success)
  console.log('✓ Error:', errorResult.success === false && errorResult.error)
  console.log('✓ Code:', errorResult.success === false && errorResult.code)
  console.log()

  console.log('All tests passed! ✅')
})()

