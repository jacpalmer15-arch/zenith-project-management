export class InvalidTransitionError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'InvalidTransitionError'
  }
}

export class ValidationError extends Error {
  public issues: string[]
  
  constructor(message: string, issues?: string[]) {
    super(message)
    this.name = 'ValidationError'
    this.issues = issues || [message]
  }
}
