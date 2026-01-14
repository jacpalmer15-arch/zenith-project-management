'use client'

import { useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'
import type { Employee, WorkStatus } from '@/lib/db'

const STATUS_OPTIONS: WorkStatus[] = [
  'UNSCHEDULED',
  'SCHEDULED',
  'IN_PROGRESS',
  'COMPLETED',
  'CLOSED',
  'CANCELED',
]

interface WorkOrderFiltersProps {
  employees: Employee[]
}

export function WorkOrderFilters({ employees }: WorkOrderFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const hasActiveFilters = useMemo(
    () =>
      !!searchParams.get('search') ||
      !!searchParams.get('status') ||
      !!searchParams.get('assigned_to') ||
      !!searchParams.get('start_date') ||
      !!searchParams.get('end_date'),
    [searchParams]
  )

  const updateParam = (key: string, value?: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.delete('page')
    router.push(`/app/work-orders?${params.toString()}`)
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 space-y-4">
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr_1fr]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="text"
            placeholder="Search work orders..."
            defaultValue={searchParams.get('search') || ''}
            onChange={(event) => updateParam('search', event.target.value || undefined)}
            className="pl-9"
            aria-label="Search work orders"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-sm text-slate-600">Status</Label>
          <Select
            value={searchParams.get('status') || 'all'}
            onValueChange={(value) =>
              updateParam('status', value === 'all' ? undefined : value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {STATUS_OPTIONS.map((status) => (
                <SelectItem key={status} value={status}>
                  {status.replace('_', ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-sm text-slate-600">Assigned Tech</Label>
          <Select
            value={searchParams.get('assigned_to') || 'all'}
            onValueChange={(value) =>
              updateParam('assigned_to', value === 'all' ? undefined : value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All technicians" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All technicians</SelectItem>
              {employees.map((employee) => (
                <SelectItem key={employee.id} value={employee.id}>
                  {employee.display_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto]">
        <div className="space-y-1">
          <Label className="text-sm text-slate-600">Start date</Label>
          <Input
            type="date"
            defaultValue={searchParams.get('start_date') || ''}
            onChange={(event) => updateParam('start_date', event.target.value || undefined)}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-sm text-slate-600">End date</Label>
          <Input
            type="date"
            defaultValue={searchParams.get('end_date') || ''}
            onChange={(event) => updateParam('end_date', event.target.value || undefined)}
          />
        </div>

        {hasActiveFilters && (
          <div className="flex items-end">
            <Button variant="outline" size="sm" onClick={() => router.push('/app/work-orders')}>
              Clear filters
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
