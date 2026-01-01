import { notFound, redirect } from 'next/navigation'
import { getReceipt, getReceiptLineItem, getLineAllocationStatus } from '@/lib/data/receipts'
import { listParts } from '@/lib/data/parts'
import { LineItemForm } from '@/components/receipts/line-item-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, ArrowLeft, Lock } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils/format-currency'

export default async function EditLineItemPage({ 
  params 
}: { 
  params: { id: string, lineId: string } 
}) {
  const [receipt, lineItem, parts, allocationStatus] = await Promise.all([
    getReceipt(params.id),
    getReceiptLineItem(params.lineId),
    listParts({ is_active: true }),
    getLineAllocationStatus(params.lineId).catch(() => null)
  ])
  
  if (!receipt || !lineItem) {
    notFound()
  }
  
  // Check if line item has allocations
  const hasAllocations = allocationStatus && allocationStatus.allocated_total > 0
  
  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <Link href={`/app/receipts/${params.id}`}>
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Receipt
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Edit Line Item</h1>
        <p className="text-slate-500 mt-1">
          Receipt: {receipt.vendor_name || 'No vendor'} - Line #{lineItem.line_no}
        </p>
      </div>
      
      {hasAllocations ? (
        <Card className="border-amber-300 bg-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-900">
              <Lock className="w-5 h-5" />
              Cannot Edit This Line Item
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <p className="text-amber-900 font-medium">
                  This line item has {formatCurrency(allocationStatus.allocated_total)} allocated to job costs.
                </p>
                <p className="text-amber-800">
                  To edit this line item, you must first delete all allocations associated with it.
                </p>
              </div>
            </div>
            
            <div className="pt-4 border-t border-amber-200">
              <h4 className="font-medium text-amber-900 mb-2">Read-Only View:</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-amber-700">Description:</span>
                  <p className="text-amber-900 font-medium mt-1">{lineItem.description}</p>
                </div>
                <div>
                  <span className="text-amber-700">Quantity:</span>
                  <p className="text-amber-900 font-medium mt-1">{lineItem.qty.toFixed(2)}</p>
                </div>
                <div>
                  <span className="text-amber-700">Unit Cost:</span>
                  <p className="text-amber-900 font-medium mt-1">{formatCurrency(lineItem.unit_cost)}</p>
                </div>
                <div>
                  <span className="text-amber-700">Total Amount:</span>
                  <p className="text-amber-900 font-medium mt-1">{formatCurrency(lineItem.amount)}</p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button asChild>
                <Link href={`/app/receipts/${params.id}/lines/${params.lineId}/allocate`}>
                  View Allocations
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href={`/app/receipts/${params.id}`}>
                  Back to Receipt
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <LineItemForm 
          receiptId={receipt.id}
          lineItem={lineItem}
          parts={parts}
        />
      )}
    </div>
  )
}
