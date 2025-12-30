export type TaskPayload = Record<string, any>

export type TaskHandler<T extends TaskPayload = TaskPayload> = (
  payload: T
) => Promise<void>

// Registry of task handlers
const taskHandlers: Record<string, TaskHandler> = {}

export function registerTask<T extends TaskPayload>(
  name: string,
  handler: TaskHandler<T>
) {
  taskHandlers[name] = handler as TaskHandler
}

export async function enqueueTask<T extends TaskPayload>(
  name: string,
  payload: T
): Promise<{ taskId: string; status: 'completed' | 'failed' }> {
  // Generate unique task ID (replace with UUID library in production for better uniqueness)
  const taskId = `task_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`
  
  console.log(`[Task] Enqueuing: ${name}`, { taskId, payload })
  
  const handler = taskHandlers[name]
  
  if (!handler) {
    console.error(`[Task] No handler registered for: ${name}`)
    return { taskId, status: 'failed' }
  }
  
  try {
    // Run inline for now (no real queue)
    await handler(payload)
    
    console.log(`[Task] Completed: ${name}`, { taskId })
    return { taskId, status: 'completed' }
  } catch (error) {
    console.error(`[Task] Failed: ${name}`, { taskId, error })
    return { taskId, status: 'failed' }
  }
}
