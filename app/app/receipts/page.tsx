import Link from 'next/link'
import { listReceipts, getAgedReceipts, findDuplicateReceipts } from '@/lib/data/receipts'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AlertCircle, AlertTriangle, Receipt as ReceiptIcon, Plus } from 'lucide-react'
import { ReceiptList } from '@/components/receipt-list'
import { BulkAllocationToolbar } from '@/components/bulk-allocation-toolbar'
import { StandaloneCostEntryDialog } from '@/components/standalone-cost-entry-dialog'
import { EmptyState } from '@/components/empty-state'

export default async function ReceiptsPage() {
  const [allReceipts, unallocated, aged, duplicates] = await Promise.all([
    listReceipts(),
    listReceipts({ is_allocated: false }),
    getAgedReceipts(7),
    findDuplicateReceipts()
  ])
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Receipts</h1>
        <div className="flex gap-2">
          <StandaloneCostEntryDialog />
          <Link href="/app/receipts/new">
            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              New Receipt
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Alert banner for aged receipts */}
      {aged.length > 0 && (
        <Alert variant="warning">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Aged Receipts</AlertTitle>
          <AlertDescription>
            {aged.length} receipts are over 7 days old and unallocated
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
      
      {/* Receipt list with age indicators */}
      {allReceipts.length === 0 ? (
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
      ) : (
        <ReceiptList 
          receipts={unallocated}
          showAge={true}
          showDuplicateWarning={true}
          agedReceipts={aged}
        />
      )}
    </div>
  )
}
