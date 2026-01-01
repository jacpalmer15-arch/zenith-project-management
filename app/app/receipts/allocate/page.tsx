import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ArrowLeft, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { listReceiptsNeedingAllocation, listCompletedReceipts } from '@/lib/data/receipts'
import { AllocationStatusBadge } from '@/components/receipts/allocation-status-badge'
import { formatCurrency } from '@/lib/utils/format-currency'
import { format } from 'date-fns'

export default async function AllocationDashboardPage() {
  const [receipts, completedReceipts] = await Promise.all([
    listReceiptsNeedingAllocation(),
    listCompletedReceipts()
  ])
  
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/app/receipts">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Receipts
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Receipt Allocation Queue</h1>
            <p className="text-slate-500 mt-1">
              Receipts and line items that need allocation to projects or work orders
            </p>
          </div>
        </div>
        {completedReceipts.length > 0 && (
          <Button variant="outline" asChild>
            <Link href="/app/receipts/completed">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              View Completed ({completedReceipts.length})
            </Link>
          </Button>
        )}
      </div>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Receipts</CardDescription>
            <CardTitle className="text-3xl">{receipts.length}</CardTitle>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Unallocated Amount</CardDescription>
            <CardTitle className="text-3xl">
              {formatCurrency(
                receipts.reduce((sum, r) => sum + (r.receipt_unallocated_total || 0), 0)
              )}
            </CardTitle>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Overallocated</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              {receipts.filter(r => r.allocation_status === 'OVERALLOCATED').length}
              {receipts.some(r => r.allocation_status === 'OVERALLOCATED') && (
                <AlertTriangle className="w-6 h-6 text-red-600" />
              )}
            </CardTitle>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Completed</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2 text-green-600">
              {completedReceipts.length}
              {completedReceipts.length > 0 && (
                <CheckCircle2 className="w-6 h-6" />
              )}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>
      
      {/* Receipts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Receipts Needing Allocation</CardTitle>
          <CardDescription>
            Click a receipt to view line-by-line allocation details
          </CardDescription>
        </CardHeader>
        <CardContent>
          {receipts.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <p className="text-lg font-medium">All receipts are fully allocated! 🎉</p>
              <p className="mt-2">No receipts require allocation at this time.</p>
              <Button className="mt-4" asChild>
                <Link href="/app/receipts">View All Receipts</Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Allocated</TableHead>
                  <TableHead className="text-right">Unallocated</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {receipts.map((receipt) => (
                  <TableRow key={receipt.receipt_id}>
                    <TableCell className="font-medium">
                      {receipt.vendor_name || 'No vendor'}
                    </TableCell>
                    <TableCell>
                      {receipt.receipt_date 
                        ? format(new Date(receipt.receipt_date), 'MMM d, yyyy')
                        : 'No date'}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(receipt.receipt_lines_total)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(receipt.receipt_allocated_total)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(receipt.receipt_unallocated_total)}
                    </TableCell>
                    <TableCell>
                      <AllocationStatusBadge status={receipt.allocation_status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" asChild>
                        <Link href={`/app/receipts/${receipt.receipt_id}/allocation`}>
                          View Details
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
