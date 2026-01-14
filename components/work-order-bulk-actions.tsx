'use client'

import { useState, useTransition } from 'react'
import { bulkAssignWorkOrdersAction, bulkRescheduleWorkOrdersAction, bulkUpdateWorkOrderStatusAction } from '@/app/actions/work-orders'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Employee, WorkStatus } from '@/lib/db'

interface WorkOrderBulkActionsProps {
  selectedIds: string[]
  employees: Employee[]
  onClear: () => void
}

const STATUS_OPTIONS: WorkStatus[] = ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED']

export function WorkOrderBulkActions({ selectedIds, employees, onClear }: WorkOrderBulkActionsProps) {
  const [isPending, startTransition] = useTransition()
  const [assignedTo, setAssignedTo] = useState<string>('')
  const [status, setStatus] = useState<WorkStatus | ''>('')
  const [startAt, setStartAt] = useState('')
  const [endAt, setEndAt] = useState('')
  const [message, setMessage] = useState<string | null>(null)

  const handleAssign = () => {
    if (!assignedTo) return
    startTransition(async () => {
      const result = await bulkAssignWorkOrdersAction({
        ids: selectedIds,
        assignedTo: assignedTo === 'unassigned' ? null : assignedTo,
      })
      setMessage(result.success ? 'Assigned technicians.' : result.error || 'Bulk assign failed.')
      if (result.success) {
        onClear()
      }
    })
  }

  const handleStatusUpdate = () => {
    if (!status) return
    startTransition(async () => {
      const result = await bulkUpdateWorkOrderStatusAction({ ids: selectedIds, status })
      if (!result.success) {
        setMessage(result.error || 'Bulk status update failed.')
        return
      }
      const errors = (result.data as any)?.errors || []
      const hasErrors = Array.isArray(errors) && errors.length > 0
      setMessage(hasErrors ? 'Some work orders could not be updated.' : 'Updated statuses.')
      if (!hasErrors) {
        onClear()
      }
    })
  }

  const handleReschedule = () => {
    startTransition(async () => {
      const result = await bulkRescheduleWorkOrdersAction({
        ids: selectedIds,
        requested_window_start: startAt || null,
        requested_window_end: endAt || null,
      })
      setMessage(result.success ? 'Updated requested windows.' : result.error || 'Bulk reschedule failed.')
      if (result.success) {
        onClear()
      }
    })
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-900">Bulk actions</p>
          <p className="text-xs text-slate-500">{selectedIds.length} selected</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onClear}>
          Clear selection
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-2">
          <Label className="text-xs text-slate-600">Assign technician</Label>
          <Select value={assignedTo} onValueChange={setAssignedTo}>
            <SelectTrigger>
              <SelectValue placeholder="Select technician" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unassigned">Unassigned</SelectItem>
              {employees.map((employee) => (
                <SelectItem key={employee.id} value={employee.id}>
                  {employee.display_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAssign}
            disabled={isPending || selectedIds.length === 0}
          >
            Apply assignment
          </Button>
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-slate-600">Update status</Label>
          <Select value={status} onValueChange={(value) => setStatus(value as WorkStatus)}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option.replace('_', ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={handleStatusUpdate}
            disabled={isPending || selectedIds.length === 0 || !status}
          >
            Apply status
          </Button>
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-slate-600">Reschedule requested window</Label>
          <div className="grid gap-2">
            <Input
              type="datetime-local"
              value={startAt}
              onChange={(event) => setStartAt(event.target.value)}
            />
            <Input
              type="datetime-local"
              value={endAt}
              onChange={(event) => setEndAt(event.target.value)}
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReschedule}
            disabled={isPending || selectedIds.length === 0}
          >
            Apply window
          </Button>
        </div>
      </div>

      {message && <p className="text-xs text-slate-500">{message}</p>}
    </div>
  )
}
