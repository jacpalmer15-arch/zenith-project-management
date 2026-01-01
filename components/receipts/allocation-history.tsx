'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Trash2 } from 'lucide-react'
import { deleteAllocationAction } from '@/app/actions/job-costs'
import { formatCurrency } from '@/lib/utils/format-currency'
import { format } from 'date-fns'

interface AllocationHistoryProps {
  receiptId: string
  lineItemId: string
  allocations: any[]
}

export function AllocationHistory({ 
  receiptId, 
  lineItemId, 
  allocations 
}: AllocationHistoryProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this allocation?')) {
      return
    }

    setDeletingId(id)
    
    startTransition(async () => {
      const result = await deleteAllocationAction(id, receiptId, lineItemId)
      
      if (result?.error) {
        alert(result.error)
      } else {
        router.refresh()
      }
      
      setDeletingId(null)
    })
  }

  if (allocations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Existing Allocations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-500">
            <p>No allocations yet. Create allocations using the form above.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Existing Allocations ({allocations.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Allocated To</TableHead>
              <TableHead>Cost Type</TableHead>
              <TableHead>Cost Code</TableHead>
              <TableHead className="text-right">Qty</TableHead>
              <TableHead className="text-right">Unit Cost</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Date</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allocations.map((allocation) => (
              <TableRow key={allocation.id}>
                <TableCell>
                  {allocation.project ? (
                    <div>
                      <div className="font-medium">
                        {allocation.project.project_no || allocation.project.name}
                      </div>
                      <div className="text-xs text-slate-500">Project</div>
                    </div>
                  ) : allocation.work_order ? (
                    <div>
                      <div className="font-medium">
                        {allocation.work_order.work_order_no || allocation.work_order.summary}
                      </div>
                      <div className="text-xs text-slate-500">Work Order</div>
                    </div>
                  ) : (
                    <span className="text-slate-400">Unknown</span>
                  )}
                </TableCell>
                <TableCell>
                  {allocation.cost_type?.name || '-'}
                </TableCell>
                <TableCell>
                  {allocation.cost_code?.name || '-'}
                </TableCell>
                <TableCell className="text-right">
                  {allocation.qty.toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  ${allocation.unit_cost.toFixed(2)}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(allocation.amount)}
                </TableCell>
                <TableCell className="text-right text-sm text-slate-500">
                  {allocation.txn_date 
                    ? format(new Date(allocation.txn_date), 'MMM d, yyyy')
                    : '-'
                  }
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(allocation.id)}
                    disabled={isPending && deletingId === allocation.id}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {/* Total */}
        <div className="mt-4 pt-4 border-t flex justify-between items-center">
          <span className="text-slate-600">Total Allocated:</span>
          <span className="font-bold text-lg">
            {formatCurrency(
              allocations.reduce((sum, a) => sum + parseFloat(a.amount || 0), 0)
            )}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
