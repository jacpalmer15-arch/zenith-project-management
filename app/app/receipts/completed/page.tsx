import Link from 'next/link'
import { listCompletedReceipts } from '@/lib/data/receipts'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/format-currency'
import { format } from 'date-fns'
import { AllocationStatusBadge } from '@/components/receipts/allocation-status-badge'
import { EmptyState } from '@/components/empty-state'

export default async function CompletedReceiptsPage() {
  const completedReceipts = await listCompletedReceipts()
  
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/app/receipts">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Receipts
          </Link>
        </Button>
        
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold">Completed Receipts</h1>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
            <CheckCircle2 className="w-4 h-4" />
            {completedReceipts.length} Completed
          </span>
        </div>
        <p className="text-slate-500 mt-1">
          Receipts that have been fully allocated to projects or work orders
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Fully Allocated Receipts</CardTitle>
          <CardDescription>
            All line items have been allocated to job costs
          </CardDescription>
        </CardHeader>
        <CardContent>
          {completedReceipts.length === 0 ? (
            <div className="py-12">
              <EmptyState
                icon={CheckCircle2}
                title="No completed receipts yet"
                description="Receipts will appear here once all line items are fully allocated."
                action={{
                  label: 'View Allocation Queue',
                  href: '/app/receipts/allocate',
                }}
              />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Lines Total</TableHead>
                  <TableHead className="text-right">Allocated</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {completedReceipts.map((receipt) => (
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
                    <TableCell className="text-right text-green-600 font-medium">
                      {formatCurrency(receipt.receipt_allocated_total)}
                    </TableCell>
                    <TableCell>
                      <AllocationStatusBadge status={receipt.allocation_status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/app/receipts/${receipt.receipt_id}`}>
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
