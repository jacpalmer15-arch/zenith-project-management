'use client'

import { useState, useTransition } from 'react'
import { bulkUpdateQuoteStatusAction } from '@/app/actions/quotes'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { QuoteStatus } from '@/lib/db'

interface QuoteBulkActionsProps {
  selectedIds: string[]
  onClear: () => void
}

const STATUS_OPTIONS: QuoteStatus[] = ['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED']

export function QuoteBulkActions({ selectedIds, onClear }: QuoteBulkActionsProps) {
  const [status, setStatus] = useState<QuoteStatus | ''>('')
  const [message, setMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleUpdate = () => {
    if (!status) return
    startTransition(async () => {
      const result = await bulkUpdateQuoteStatusAction({ ids: selectedIds, status })
      if (result?.error) {
        setMessage(result.error)
      } else if (result?.errors?.length) {
        setMessage('Some quotes could not be updated.')
      } else {
        setMessage('Quote statuses updated.')
        onClear()
      }
    })
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-900">Bulk quote status</p>
          <p className="text-xs text-slate-500">{selectedIds.length} selected</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onClear}>
          Clear selection
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-end gap-3">
        <div className="space-y-1 flex-1">
          <Label className="text-xs text-slate-600">Status</Label>
          <Select value={status} onValueChange={(value) => setStatus(value as QuoteStatus)}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleUpdate} disabled={isPending || !status}>
          Update status
        </Button>
      </div>

      {message && <p className="text-xs text-slate-500">{message}</p>}
    </div>
  )
}
