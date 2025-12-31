import { notFound } from 'next/navigation'
import { getReceipt } from '@/lib/data/receipts'
import { listParts } from '@/lib/data/parts'
import { LineItemForm } from '@/components/receipts/line-item-form'

export default async function NewLineItemPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const receipt = await getReceipt(params.id)
  
  if (!receipt) {
    notFound()
  }
  
  // Get parts for optional part_id selection
  const parts = await listParts({ is_active: true })
  
  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Add Line Item</h1>
        <p className="text-slate-500 mt-1">
          Receipt: {receipt.vendor_name || 'No vendor'} - {receipt.receipt_date || 'No date'}
        </p>
      </div>
      
      <LineItemForm 
        receiptId={receipt.id} 
        parts={parts}
      />
    </div>
  )
}
