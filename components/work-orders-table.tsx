'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Eye } from 'lucide-react'
import { WorkOrderStatusBadge } from '@/components/work-order-status-badge'
import { formatDistanceToNow } from 'date-fns'
import type { Employee, WorkOrderWithCustomerLocation } from '@/lib/db'
import { Checkbox } from '@/components/ui/checkbox'
import { WorkOrderBulkActions } from '@/components/work-order-bulk-actions'

interface WorkOrdersTableProps {
  workOrders: WorkOrderWithCustomerLocation[]
  employees: Employee[]
  canBulkEdit: boolean
}

export function WorkOrdersTable({ workOrders, employees, canBulkEdit }: WorkOrdersTableProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const allSelected = useMemo(
    () => workOrders.length > 0 && selectedIds.length === workOrders.length,
    [selectedIds, workOrders]
  )

  const toggleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? workOrders.map((wo) => wo.id) : [])
  }

  const toggleSelect = (id: string, checked: boolean) => {
    setSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((item) => item !== id)
    )
  }

  return (
    <div className="space-y-4">
      {canBulkEdit && selectedIds.length > 0 && (
        <WorkOrderBulkActions
          selectedIds={selectedIds}
          employees={employees}
          onClear={() => setSelectedIds([])}
        />
      )}

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="hidden lg:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {canBulkEdit && (
                  <TableHead className="w-[40px]">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={(value) => toggleSelectAll(!!value)}
                      aria-label="Select all"
                    />
                  </TableHead>
                )}
                <TableHead>WO #</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Summary</TableHead>
                <TableHead>Assigned</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workOrders.map((wo) => (
                <TableRow key={wo.id}>
                  {canBulkEdit && (
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.includes(wo.id)}
                        onCheckedChange={(value) => toggleSelect(wo.id, !!value)}
                        aria-label={`Select work order ${wo.work_order_no}`}
                      />
                    </TableCell>
                  )}
                  <TableCell className="font-medium">{wo.work_order_no}</TableCell>
                  <TableCell>
                    <WorkOrderStatusBadge status={wo.status} />
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">P{wo.priority}</Badge>
                  </TableCell>
                  <TableCell>{wo.customer.name}</TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {wo.location.city}, {wo.location.state}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{wo.summary}</TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {wo.assigned_employee?.display_name || '-'}
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {formatDistanceToNow(new Date(wo.updated_at), { addSuffix: true })}
                  </TableCell>
                  <TableCell>
                    <Link href={`/app/work-orders/${wo.id}`}>
                      <Button variant="ghost" size="icon" aria-label="View work order">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="lg:hidden divide-y divide-slate-200">
          {workOrders.map((wo) => (
            <div key={wo.id} className="p-4 space-y-3">
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900">{wo.work_order_no}</p>
                  <p className="text-sm text-slate-600 truncate">{wo.summary}</p>
                </div>
                <Link href={`/app/work-orders/${wo.id}`}>
                  <Button variant="ghost" size="icon" aria-label="View work order" className="min-h-[44px] min-w-[44px]">
                    <Eye className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <WorkOrderStatusBadge status={wo.status} />
                <Badge variant="outline">P{wo.priority}</Badge>
              </div>
              <div className="space-y-1 text-sm">
                <p className="text-slate-900 font-medium">{wo.customer.name}</p>
                <p className="text-slate-600">
                  {wo.location.city}, {wo.location.state}
                </p>
                {wo.assigned_employee && (
                  <p className="text-slate-600">
                    Assigned: {wo.assigned_employee.display_name}
                  </p>
                )}
                <p className="text-slate-500">
                  Updated {formatDistanceToNow(new Date(wo.updated_at), { addSuffix: true })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
