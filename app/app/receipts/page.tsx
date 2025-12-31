import { listReceipts, getAgedReceipts, findDuplicateReceipts } from '@/lib/data/receipts'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, AlertTriangle } from 'lucide-react'
import { ReceiptList } from '@/components/receipt-list'
import { BulkAllocationToolbar } from '@/components/bulk-allocation-toolbar'
import { StandaloneCostEntryDialog } from '@/components/standalone-cost-entry-dialog'

export default async function ReceiptsPage() {
  const [unallocated, aged, duplicates] = await Promise.all([
    listReceipts({ is_allocated: false }),
    getAgedReceipts(7),
    findDuplicateReceipts()
  ])
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900">Receipts</h1>
        <StandaloneCostEntryDialog />
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
      <ReceiptList 
        receipts={unallocated}
        showAge={true}
        showDuplicateWarning={true}
        agedReceipts={aged}
      />
    </div>
  )
}
