import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getReceipt, getReceiptLineItem, getLineAllocationStatus } from '@/lib/data/receipts'
import { listJobCostEntriesByLineItem } from '@/lib/data/cost-entries'
import { listProjects } from '@/lib/data/projects'
import { listWorkOrders } from '@/lib/data/work-orders'
import { listCostTypes } from '@/lib/data/cost-types'
import { listCostCodes } from '@/lib/data/cost-codes'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/format-currency'
import { AllocationForm } from '@/components/receipts/allocation-form'
import { AllocationHistory } from '@/components/receipts/allocation-history'

export default async function AllocateLineItemPage({ 
  params 
}: { 
  params: { id: string, lineId: string } 
}) {
  // Fetch all required data in parallel
  const [
    receipt,
    lineItem,
    allocationStatus,
    existingAllocations,
    projects,
    workOrders,
    costTypes,
    costCodes
  ] = await Promise.all([
    getReceipt(params.id),
    getReceiptLineItem(params.lineId),
    getLineAllocationStatus(params.lineId),
    listJobCostEntriesByLineItem(params.lineId),
    listProjects(),
    listWorkOrders(),
    listCostTypes(),
    listCostCodes()
  ])
  
  if (!receipt || !lineItem) {
    notFound()
  }
  
  const unallocatedTotal = parseFloat(allocationStatus?.unallocated_total || '0')
  const lineTotal = parseFloat(allocationStatus?.line_total || lineItem.amount.toString())
  const allocatedTotal = parseFloat(allocationStatus?.allocated_total || '0')
  
  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <Link href={`/app/receipts/${params.id}`}>
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Receipt
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Allocate Line Item</h1>
        <p className="text-slate-500 mt-1">
          Receipt: {receipt.vendor_name || 'No vendor'} - Line #{lineItem.line_no}
        </p>
      </div>
      
      {/* Line Item Context */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Line Item Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-slate-500">Description</p>
              <p className="text-base font-medium">{lineItem.description}</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t">
              <div>
                <p className="text-sm text-slate-500">Line Total</p>
                <p className="text-lg font-bold">{formatCurrency(lineTotal)}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Allocated</p>
                <p className="text-lg font-bold text-green-600">
                  {formatCurrency(allocatedTotal)}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Remaining</p>
                <p className="text-lg font-bold text-amber-600">
                  {formatCurrency(unallocatedTotal)}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Status</p>
                <div className="mt-1">
                  {unallocatedTotal === 0 ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Fully Allocated
                    </span>
                  ) : allocatedTotal > 0 ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                      Partially Allocated
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                      Unallocated
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Allocation Form */}
      {unallocatedTotal > 0 ? (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Create New Allocation</h2>
          <AllocationForm
            receiptId={params.id}
            receiptLineItemId={params.lineId}
            unallocatedTotal={unallocatedTotal}
            projects={projects}
            workOrders={workOrders}
            costTypes={costTypes}
            costCodes={costCodes}
          />
        </div>
      ) : (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 font-medium">
            ✓ This line item is fully allocated. Delete an allocation below to create a new one.
          </p>
        </div>
      )}
      
      {/* Existing Allocations */}
      <AllocationHistory
        receiptId={params.id}
        receiptLineItemId={params.lineId}
        allocations={existingAllocations}
      />
    </div>
  )
}
