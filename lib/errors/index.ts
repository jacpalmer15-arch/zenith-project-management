export class WorkflowError extends Error {
  public code: string
  public userMessage: string
  public details?: Record<string, any>
  
  constructor(
    code: string,
    userMessage: string,
    developerMessage?: string,
    details?: Record<string, any>
  ) {
    super(developerMessage || userMessage)
    this.name = 'WorkflowError'
    this.code = code
    this.userMessage = userMessage
    this.details = details
  }
}

export class InvalidTransitionError extends WorkflowError {
  constructor(
    from: string,
    to: string,
    reason?: string
  ) {
    super(
      'INVALID_TRANSITION',
      `Cannot change status from ${from} to ${to}${reason ? `: ${reason}` : ''}`,
      `Invalid status transition attempted: ${from} -> ${to}`,
      { from, to, reason }
    )
    this.name = 'InvalidTransitionError'
  }
}

export class MissingDataError extends WorkflowError {
  constructor(
    entityType: string,
    field: string,
    message?: string
  ) {
    super(
      'MISSING_DATA',
      message || `${entityType} is missing required ${field}`,
      `Missing required data: ${entityType}.${field}`,
      { entityType, field }
    )
    this.name = 'MissingDataError'
  }
}

export class PermissionDeniedError extends WorkflowError {
  constructor(
    action: string,
    resource?: string
  ) {
    super(
      'PERMISSION_DENIED',
      `You don't have permission to ${action}${resource ? ` this ${resource}` : ''}`,
      `Permission denied: ${action} on ${resource}`,
      { action, resource }
    )
    this.name = 'PermissionDeniedError'
  }
}

export class ValidationError extends WorkflowError {
  public issues: string[]
  
  constructor(
    issues: string[]
  ) {
    super(
      'VALIDATION_ERROR',
      issues.length === 1 ? issues[0] : `Multiple issues: ${issues.join(', ')}`,
      `Validation failed: ${issues.join('; ')}`,
      { issues }
    )
    this.name = 'ValidationError'
    this.issues = issues
  }
}

export class NotFoundError extends WorkflowError {
  constructor(
    entityType: string,
    id?: string
  ) {
    super(
      'NOT_FOUND',
      `${entityType} not found`,
      `Entity not found: ${entityType}${id ? ` (${id})` : ''}`,
      { entityType, id }
    )
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends WorkflowError {
  constructor(
    message: string,
    details?: Record<string, any>
  ) {
    super(
      'CONFLICT',
      message,
      `Conflict: ${message}`,
      details
    )
    this.name = 'ConflictError'
  }
}
