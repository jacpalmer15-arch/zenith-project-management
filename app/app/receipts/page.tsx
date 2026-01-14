import Link from 'next/link'
import { getAgedReceipts, findDuplicateReceipts, listReceiptsWithAllocationStatus } from '@/lib/data/receipts'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AlertCircle, AlertTriangle, Receipt as ReceiptIcon, Plus } from 'lucide-react'
import { StandaloneCostEntryDialog } from '@/components/standalone-cost-entry-dialog'
import { EmptyState } from '@/components/empty-state'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { format } from 'date-fns'
import { formatCurrency } from '@/lib/utils/format-currency'
import { AllocationStatusBadge } from '@/components/receipts/allocation-status-badge'

interface ReceiptsPageProps {
  searchParams: {
    filter?: 'all' | 'needs_allocation' | 'completed' | 'partial'
  }
}

// Age threshold for receipts in days
const AGED_RECEIPT_THRESHOLD_DAYS = 7

export default async function ReceiptsPage({ searchParams }: ReceiptsPageProps) {
  const filter = searchParams.filter || 'all'
  
  // Fetch receipts with allocation status
  const [allReceiptsWithStatus, aged, duplicates] = await Promise.all([
    listReceiptsWithAllocationStatus(),
    getAgedReceipts(AGED_RECEIPT_THRESHOLD_DAYS),
    findDuplicateReceipts()
  ])
  
  // Filter based on selected filter
  let displayReceipts = allReceiptsWithStatus
  if (filter === 'needs_allocation') {
    displayReceipts = allReceiptsWithStatus.filter(r => r.needs_allocation)
  } else if (filter === 'completed') {
    displayReceipts = allReceiptsWithStatus.filter(r => r.allocation_status === 'ALLOCATED')
  } else if (filter === 'partial') {
    displayReceipts = allReceiptsWithStatus.filter(r => r.allocation_status === 'PARTIAL')
  }
  
  // Count for each filter
  const counts = {
    all: allReceiptsWithStatus.length,
    needs_allocation: allReceiptsWithStatus.filter(r => r.needs_allocation).length,
    completed: allReceiptsWithStatus.filter(r => r.allocation_status === 'ALLOCATED').length,
    partial: allReceiptsWithStatus.filter(r => r.allocation_status === 'PARTIAL').length,
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Receipts</h1>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/app/receipts/allocate">
              View Allocation Queue
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/app/receipts/completed">
              View Completed
            </Link>
          </Button>
          <StandaloneCostEntryDialog />
          <Link href="/app/receipts/new">
            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              New Receipt
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Filter tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <Link href="/app/receipts?filter=all">
          <Button 
            variant={filter === 'all' ? 'default' : 'ghost'}
            className="rounded-b-none"
          >
            All ({counts.all})
          </Button>
        </Link>
        <Link href="/app/receipts?filter=needs_allocation">
          <Button 
            variant={filter === 'needs_allocation' ? 'default' : 'ghost'}
            className="rounded-b-none"
          >
            Needs Allocation ({counts.needs_allocation})
          </Button>
        </Link>
        <Link href="/app/receipts?filter=partial">
          <Button 
            variant={filter === 'partial' ? 'default' : 'ghost'}
            className="rounded-b-none"
          >
            Partial ({counts.partial})
          </Button>
        </Link>
        <Link href="/app/receipts?filter=completed">
          <Button 
            variant={filter === 'completed' ? 'default' : 'ghost'}
            className="rounded-b-none"
          >
            Completed ({counts.completed})
          </Button>
        </Link>
      </div>
      
      {/* Alert banner for aged receipts */}
      {aged.length > 0 && filter !== 'completed' && (
        <Alert variant="warning">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Aged Receipts</AlertTitle>
          <AlertDescription>
            {aged.length} receipts are over {AGED_RECEIPT_THRESHOLD_DAYS} days old and unallocated
          </AlertDescription>
        </Alert>
      )}
      
      {/* Alert banner for duplicates */}
      {duplicates.length > 0 && (
        <Alert variant="warning">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Possible Duplicates</AlertTitle>
          <AlertDescription>
            {duplicates.length} potential duplicate receipts detected
          </AlertDescription>
        </Alert>
      )}
      
      {/* Receipt list */}
      {allReceiptsWithStatus.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200">
          <EmptyState
            icon={ReceiptIcon}
            title="No receipts yet"
            description="Create a receipt to track expenses."
            action={{
              label: 'New Receipt',
              href: '/app/receipts/new',
            }}
          />
        </div>
      ) : displayReceipts.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <EmptyState
              icon={ReceiptIcon}
              title={`No ${filter.replace('_', ' ')} receipts`}
              description="Try a different filter to see receipts."
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead className="text-right">Lines Total</TableHead>
                  <TableHead className="text-right">Allocated</TableHead>
                  <TableHead className="text-right">Unallocated</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayReceipts.map((receipt) => (
                  <TableRow key={receipt.receipt_id}>
                    <TableCell>
                      {receipt.receipt_date 
                        ? format(new Date(receipt.receipt_date), 'MMM d, yyyy')
                        : 'No date'}
                    </TableCell>
                    <TableCell className="font-medium">
                      {receipt.vendor_name || 'No vendor'}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(receipt.receipt_lines_total || 0)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(receipt.receipt_allocated_total || 0)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(receipt.receipt_unallocated_total || 0)}
                    </TableCell>
                    <TableCell>
                      <AllocationStatusBadge status={receipt.allocation_status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost" asChild>
                        <Link href={`/app/receipts/${receipt.receipt_id}`}>
                          View
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
