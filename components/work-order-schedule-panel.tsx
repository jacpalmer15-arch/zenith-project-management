'use client'

import { useState, useTransition } from 'react'
import { assignWorkOrderTechAction } from '@/app/actions/work-orders'
import { createScheduleEntryAction, deleteScheduleEntryAction, updateScheduleEntryAction } from '@/app/actions/schedule'
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
import { format } from 'date-fns'
import type { Employee, ScheduleEntryWithDetails } from '@/lib/db'

interface WorkOrderSchedulePanelProps {
  workOrderId: string
  assignedTo: string | null
  scheduleEntries: ScheduleEntryWithDetails[]
  employees: Employee[]
  canEdit: boolean
}

export function WorkOrderSchedulePanel({
  workOrderId,
  assignedTo,
  scheduleEntries,
  employees,
  canEdit,
}: WorkOrderSchedulePanelProps) {
  const [isPending, startTransition] = useTransition()
  const [assignment, setAssignment] = useState(assignedTo || 'unassigned')
  const [startAt, setStartAt] = useState('')
  const [endAt, setEndAt] = useState('')
  const [techId, setTechId] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editStartAt, setEditStartAt] = useState('')
  const [editEndAt, setEditEndAt] = useState('')

  const handleAssign = () => {
    startTransition(async () => {
      const result = await assignWorkOrderTechAction({
        workOrderId,
        assignedTo: assignment === 'unassigned' ? null : assignment,
      })
      if (!result.success) {
        setMessage(result.error || 'Failed to update assignment.')
      } else {
        setMessage('Assignment updated.')
      }
    })
  }

  const handleAddSchedule = () => {
    if (!techId || !startAt || !endAt) {
      setMessage('Select a technician and schedule window.')
      return
    }

    startTransition(async () => {
      const result = await createScheduleEntryAction({
        work_order_id: workOrderId,
        tech_user_id: techId,
        start_at: startAt,
        end_at: endAt,
      })

      if ((result as any)?.error) {
        setMessage((result as any).error)
      } else {
        setMessage('Schedule entry added.')
        setStartAt('')
        setEndAt('')
        setTechId('')
      }
    })
  }

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const result = await deleteScheduleEntryAction(id, workOrderId)
      if ((result as any)?.error) {
        setMessage((result as any).error)
      } else {
        setMessage('Schedule entry removed.')
      }
    })
  }

  const startEdit = (entry: ScheduleEntryWithDetails) => {
    setEditingId(entry.id)
    setEditStartAt(entry.start_at.slice(0, 16))
    setEditEndAt(entry.end_at.slice(0, 16))
  }

  const handleUpdate = () => {
    if (!editingId) return
    startTransition(async () => {
      const result = await updateScheduleEntryAction(editingId, {
        work_order_id: workOrderId,
        start_at: editStartAt,
        end_at: editEndAt,
      })
      if ((result as any)?.error) {
        setMessage((result as any).error)
      } else {
        setMessage('Schedule entry updated.')
        setEditingId(null)
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Primary Assignment</h3>
          <p className="text-xs text-slate-500">Sets the main technician on the work order.</p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-end gap-3">
          <div className="space-y-1 flex-1">
            <Label className="text-xs text-slate-600">Assigned technician</Label>
            <Select value={assignment} onValueChange={setAssignment} disabled={!canEdit}>
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
          </div>
          {canEdit && (
            <Button variant="outline" onClick={handleAssign} disabled={isPending}>
              Update assignment
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Schedule Entries</h3>
          <p className="text-xs text-slate-500">Schedule technicians with specific time windows.</p>
        </div>

        {canEdit && (
          <div className="grid gap-3 lg:grid-cols-[1fr_1fr_1fr_auto] items-end">
            <div className="space-y-1">
              <Label className="text-xs text-slate-600">Technician</Label>
              <Select value={techId} onValueChange={setTechId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select technician" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.display_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-slate-600">Start</Label>
              <Input type="datetime-local" value={startAt} onChange={(event) => setStartAt(event.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-slate-600">End</Label>
              <Input type="datetime-local" value={endAt} onChange={(event) => setEndAt(event.target.value)} />
            </div>
            <Button variant="outline" onClick={handleAddSchedule} disabled={isPending}>
              Add entry
            </Button>
          </div>
        )}

        {scheduleEntries.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
            No schedule entries yet.
          </div>
        ) : (
          <div className="space-y-3">
            {scheduleEntries.map((entry) => (
              <div key={entry.id} className="rounded-lg border border-slate-200 p-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{entry.employee.display_name}</p>
                    <p className="text-xs text-slate-500">
                      {format(new Date(entry.start_at), 'PPP p')} - {format(new Date(entry.end_at), 'PPP p')}
                    </p>
                  </div>
                  {canEdit && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEdit(entry)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(entry.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  )}
                </div>

                {editingId === entry.id && (
                  <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_1fr_auto] items-end">
                    <Input
                      type="datetime-local"
                      value={editStartAt}
                      onChange={(event) => setEditStartAt(event.target.value)}
                    />
                    <Input
                      type="datetime-local"
                      value={editEndAt}
                      onChange={(event) => setEditEndAt(event.target.value)}
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleUpdate} disabled={isPending}>
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {message && <p className="text-xs text-slate-500">{message}</p>}
    </div>
  )
}
