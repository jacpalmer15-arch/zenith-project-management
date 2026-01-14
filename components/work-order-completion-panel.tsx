'use client'

import { useState, useTransition } from 'react'
import { updateWorkOrderStatusAction } from '@/app/actions/work-orders'
import { Button } from '@/components/ui/button'
import { WorkOrderStatusBadge } from '@/components/work-order-status-badge'
import type { WorkStatus } from '@/lib/db'

interface WorkOrderCompletionPanelProps {
  workOrderId: string
  status: WorkStatus
  completedAt: string | null
  canComplete: boolean
}

export function WorkOrderCompletionPanel({
  workOrderId,
  status,
  completedAt,
  canComplete,
}: WorkOrderCompletionPanelProps) {
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<string | null>(null)
  const canMarkComplete = canComplete && status === 'IN_PROGRESS'

  const handleComplete = () => {
    startTransition(async () => {
      const result = await updateWorkOrderStatusAction(workOrderId, 'COMPLETED')
      if (!result.success) {
        setMessage(result.error)
      } else {
        setMessage('Work order marked complete.')
      }
    })
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-900">Completion</h3>
        <p className="text-xs text-slate-500">Finalize the work order when execution is done.</p>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600">Current status:</span>
          <WorkOrderStatusBadge status={status} />
        </div>
        {completedAt && (
          <p className="text-sm text-slate-600">
            Completed at: {new Date(completedAt).toLocaleString()}
          </p>
        )}
      </div>

      {status !== 'COMPLETED' && status !== 'CLOSED' ? (
        <Button onClick={handleComplete} disabled={isPending || !canMarkComplete}>
          Mark Complete
        </Button>
      ) : (
        <p className="text-sm text-slate-600">This work order is already complete.</p>
      )}

      {!canComplete && (
        <p className="text-xs text-slate-500">
          Completion is limited to Admin/Office roles.
        </p>
      )}

      {canComplete && status !== 'IN_PROGRESS' && status !== 'COMPLETED' && status !== 'CLOSED' && (
        <p className="text-xs text-slate-500">
          Move the work order to In Progress before completing it.
        </p>
      )}

      {message && <p className="text-xs text-slate-500">{message}</p>}
    </div>
  )
}
