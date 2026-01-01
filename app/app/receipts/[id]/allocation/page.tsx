import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ArrowLeft, AlertCircle } from 'lucide-react'
import { 
  getReceipt, 
  getReceiptAllocationStatus, 
  listLineAllocationStatuses 
} from '@/lib/data/receipts'
import { AllocationStatusBadge } from '@/components/receipts/allocation-status-badge'
import { formatCurrency } from '@/lib/utils/format-currency'
import { format } from 'date-fns'

export default async function ReceiptAllocationDetailPage({
  params
}: {
  params: { id: string }
}) {
  const [receipt, allocationStatus, lineStatuses] = await Promise.all([
    getReceipt(params.id),
    getReceiptAllocationStatus(params.id),
    listLineAllocationStatuses(params.id)
  ])
  
  if (!receipt) {
    notFound()
  }
  
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/app/receipts/allocate">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Queue
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Allocation Details</h1>
          <p className="text-slate-500 mt-1">
            {receipt.vendor_name || 'No vendor'} - {
              receipt.receipt_date 
                ? format(new Date(receipt.receipt_date), 'MMM d, yyyy')
                : 'No date'
            }
          </p>
        </div>
      </div>
      
      {/* Receipt Summary */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Receipt Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-slate-500">Lines Total</p>
              <p className="text-2xl font-bold">
                {formatCurrency(allocationStatus.receipt_lines_total)}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Allocated</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(allocationStatus.receipt_allocated_total)}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Unallocated</p>
              <p className="text-2xl font-bold text-amber-600">
                {formatCurrency(allocationStatus.receipt_unallocated_total)}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Status</p>
              <div className="mt-2">
                <AllocationStatusBadge status={allocationStatus.allocation_status} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Line Items Allocation Status */}
      <Card>
        <CardHeader>
          <CardTitle>Line Items</CardTitle>
        </CardHeader>
        <CardContent>
          {lineStatuses.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <AlertCircle className="w-12 h-12 mx-auto mb-3 text-slate-400" />
              <p>This receipt has no line items.</p>
              <p className="text-sm mt-1">Add line items to begin allocation.</p>
              <Button className="mt-4" asChild>
                <Link href={`/app/receipts/${receipt.id}`}>
                  Add Line Items
                </Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">#</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Line Total</TableHead>
                  <TableHead className="text-right">Allocated</TableHead>
                  <TableHead className="text-right">Unallocated</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lineStatuses.map((line) => (
                  <TableRow 
                    key={line.receipt_line_item_id}
                    className={line.allocation_status === 'OVERALLOCATED' ? 'bg-red-50' : ''}
                  >
                    <TableCell>{line.line_no}</TableCell>
                    <TableCell className="max-w-md">
                      <div className="font-medium">{line.description}</div>
                      <div className="text-sm text-slate-500">
                        {line.qty} × {formatCurrency(line.unit_cost)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(line.line_total)}
                    </TableCell>
                    <TableCell className="text-right text-green-600">
                      {formatCurrency(line.allocated_total)}
                    </TableCell>
                    <TableCell className="text-right font-bold text-amber-600">
                      {formatCurrency(line.unallocated_total)}
                    </TableCell>
                    <TableCell>
                      <AllocationStatusBadge status={line.allocation_status} />
                    </TableCell>
                    <TableCell className="text-right">
                      {line.allocation_status !== 'ALLOCATED' && (
                        <Button size="sm" asChild>
                          <Link href={`/app/receipts/${receipt.id}/lines/${line.receipt_line_item_id}/allocate`}>
                            Allocate
                          </Link>
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          
          {/* Warning for overallocated items */}
          {lineStatuses.some(l => l.allocation_status === 'OVERALLOCATED') && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-medium text-red-900">Overallocated Lines Detected</p>
                <p className="text-sm text-red-700 mt-1">
                  Some line items have been allocated more than their total amount. 
                  Review and remove excess allocations.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
