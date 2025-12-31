import { notFound } from 'next/navigation'
import { getReceipt, getReceiptLineItem } from '@/lib/data/receipts'
import { listParts } from '@/lib/data/parts'
import { LineItemForm } from '@/components/receipts/line-item-form'

export default async function EditLineItemPage({ 
  params 
}: { 
  params: { id: string, lineId: string } 
}) {
  const [receipt, lineItem, parts] = await Promise.all([
    getReceipt(params.id),
    getReceiptLineItem(params.lineId),
    listParts({ is_active: true })
  ])
  
  if (!receipt || !lineItem) {
    notFound()
  }
  
  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Edit Line Item</h1>
        <p className="text-slate-500 mt-1">
          Receipt: {receipt.vendor_name || 'No vendor'} - Line #{lineItem.line_no}
        </p>
      </div>
      
      <LineItemForm 
        receiptId={receipt.id}
        lineItem={lineItem}
        parts={parts}
      />
    </div>
  )
}
