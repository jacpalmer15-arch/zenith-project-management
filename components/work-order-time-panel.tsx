'use client'

import { useMemo, useState, useTransition } from 'react'
import { createTimeEntryAction, deleteTimeEntryAction, updateTimeEntryAction } from '@/app/actions/time-entries'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { calculateHours } from '@/lib/utils/work-order-utils'
import type { Employee, TimeEntryWithDetails } from '@/lib/db'

interface WorkOrderTimePanelProps {
  workOrderId: string
  timeEntries: TimeEntryWithDetails[]
  employees: Employee[]
  canEdit: boolean
  currentTechId?: string | null
}

export function WorkOrderTimePanel({
  workOrderId,
  timeEntries,
  employees,
  canEdit,
  currentTechId,
}: WorkOrderTimePanelProps) {
  const [isPending, startTransition] = useTransition()
  const [techId, setTechId] = useState(currentTechId || '')
  const [clockIn, setClockIn] = useState('')
  const [clockOut, setClockOut] = useState('')
  const [breakMinutes, setBreakMinutes] = useState('0')
  const [notes, setNotes] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editClockIn, setEditClockIn] = useState('')
  const [editClockOut, setEditClockOut] = useState('')
  const [editBreakMinutes, setEditBreakMinutes] = useState('0')
  const [editNotes, setEditNotes] = useState('')

  const filteredEntries = useMemo(() => {
    if (!currentTechId) return timeEntries
    return timeEntries.filter((entry) => entry.tech_user_id === currentTechId)
  }, [currentTechId, timeEntries])

  const handleCreate = () => {
    if (!techId || !clockIn) {
      setMessage('Technician and clock-in time are required.')
      return
    }

    startTransition(async () => {
      const result = await createTimeEntryAction({
        work_order_id: workOrderId,
        tech_user_id: techId,
        clock_in_at: clockIn,
        clock_out_at: clockOut || null,
        break_minutes: parseInt(breakMinutes || '0', 10),
        notes: notes || null,
      })

      if (result?.error) {
        setMessage(result.error)
      } else {
        setMessage(result?.warnings?.length ? result.warnings.join(', ') : 'Time entry added.')
        setClockIn('')
        setClockOut('')
        setBreakMinutes('0')
        setNotes('')
      }
    })
  }

  const startEdit = (entry: TimeEntryWithDetails) => {
    setEditingId(entry.id)
    setEditClockIn(entry.clock_in_at.slice(0, 16))
    setEditClockOut(entry.clock_out_at ? entry.clock_out_at.slice(0, 16) : '')
    setEditBreakMinutes(entry.break_minutes.toString())
    setEditNotes(entry.notes || '')
  }

  const handleUpdate = () => {
    if (!editingId) return

    startTransition(async () => {
      const result = await updateTimeEntryAction(editingId, {
        clock_in_at: editClockIn,
        clock_out_at: editClockOut || null,
        break_minutes: parseInt(editBreakMinutes || '0', 10),
        notes: editNotes || null,
      })

      if (result?.error) {
        setMessage(result.error)
      } else {
        setMessage(result?.warnings?.length ? result.warnings.join(', ') : 'Time entry updated.')
        setEditingId(null)
      }
    })
  }

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const result = await deleteTimeEntryAction(id, workOrderId)
      if (result?.error) {
        setMessage(result.error)
      } else {
        setMessage('Time entry deleted.')
      }
    })
  }

  return (
    <div className="space-y-6">
      {canEdit && (
        <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Add time entry</h3>
            <p className="text-xs text-slate-500">Log labor hours against this work order.</p>
          </div>
          <div className="grid gap-3 lg:grid-cols-4">
            <div className="space-y-1">
              <Label className="text-xs text-slate-600">Technician</Label>
              <Select value={techId} onValueChange={setTechId} disabled={!!currentTechId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select tech" />
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
              <Label className="text-xs text-slate-600">Clock in</Label>
              <Input type="datetime-local" value={clockIn} onChange={(event) => setClockIn(event.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-slate-600">Clock out</Label>
              <Input type="datetime-local" value={clockOut} onChange={(event) => setClockOut(event.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-slate-600">Break (minutes)</Label>
              <Input type="number" min="0" value={breakMinutes} onChange={(event) => setBreakMinutes(event.target.value)} />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-slate-600">Notes</Label>
            <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} />
          </div>
          <Button onClick={handleCreate} disabled={isPending}>
            Add time entry
          </Button>
        </div>
      )}

      {filteredEntries.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
          No time entries yet.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredEntries.map((entry) => {
            const hours = entry.clock_out_at
              ? calculateHours(entry.clock_in_at, entry.clock_out_at, entry.break_minutes)
              : 0

            return (
              <div key={entry.id} className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{entry.employee.display_name}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(entry.clock_in_at).toLocaleString()} -{' '}
                      {entry.clock_out_at ? new Date(entry.clock_out_at).toLocaleString() : 'In progress'}
                    </p>
                    <p className="text-xs text-slate-500">Break: {entry.break_minutes} min</p>
                    {entry.notes && <p className="text-xs text-slate-600 mt-2">{entry.notes}</p>}
                  </div>
                  <div className="flex flex-col items-start sm:items-end gap-2">
                    <p className="text-sm font-semibold text-slate-900">{hours > 0 ? hours.toFixed(2) : '--'} hrs</p>
                    {canEdit && (
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => startEdit(entry)}>
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(entry.id)}>
                          Delete
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {editingId === entry.id && (
                  <div className="mt-3 grid gap-2 sm:grid-cols-4 items-end">
                    <Input type="datetime-local" value={editClockIn} onChange={(event) => setEditClockIn(event.target.value)} />
                    <Input type="datetime-local" value={editClockOut} onChange={(event) => setEditClockOut(event.target.value)} />
                    <Input type="number" min="0" value={editBreakMinutes} onChange={(event) => setEditBreakMinutes(event.target.value)} />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleUpdate} disabled={isPending}>
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                        Cancel
                      </Button>
                    </div>
                    <Textarea value={editNotes} onChange={(event) => setEditNotes(event.target.value)} rows={3} className="sm:col-span-4" />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {message && <p className="text-xs text-slate-500">{message}</p>}
    </div>
  )
}
