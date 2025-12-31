import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getReceipt } from '@/lib/data/receipts'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/format-currency'
import { format } from 'date-fns'
import { DeleteReceiptButton } from '@/components/delete-receipt-button'

interface ReceiptDetailPageProps {
  params: {
    id: string
  }
}

export default async function ReceiptDetailPage({ params }: ReceiptDetailPageProps) {
  let receipt
  
  try {
    receipt = await getReceipt(params.id)
  } catch (error) {
    notFound()
  }

  return (
    <div>
      <div className="mb-6">
        <Link href="/app/receipts">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Receipts
          </Button>
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Receipt Details</h1>
            <p className="text-sm text-slate-500 mt-1">ID: {receipt.id}</p>
          </div>
          <div className="flex gap-2">
            <Link href={`/app/receipts/${receipt.id}/edit`}>
              <Button variant="outline">
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </Link>
            <DeleteReceiptButton receiptId={receipt.id} />
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Receipt Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500">Vendor Name</p>
              <p className="text-base text-slate-900 mt-1">
                {receipt.vendor_name || '-'}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-slate-500">Receipt Date</p>
              <p className="text-base text-slate-900 mt-1">
                {receipt.receipt_date 
                  ? format(new Date(receipt.receipt_date), 'MMMM d, yyyy')
                  : '-'}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-slate-500">Total Amount</p>
              <p className="text-xl font-semibold text-slate-900 mt-1">
                {formatCurrency(receipt.total_amount)}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-slate-500">Created At</p>
              <p className="text-base text-slate-900 mt-1">
                {format(new Date(receipt.created_at), 'MMMM d, yyyy h:mm a')}
              </p>
            </div>
          </div>

          {receipt.notes && (
            <div className="pt-4 border-t border-slate-200">
              <p className="text-sm font-medium text-slate-500">Notes</p>
              <p className="text-base text-slate-900 mt-1 whitespace-pre-wrap">
                {receipt.notes}
              </p>
            </div>
          )}

          {receipt.storage_path && (
            <div className="pt-4 border-t border-slate-200">
              <p className="text-sm font-medium text-slate-500">Storage Path</p>
              <p className="text-base text-slate-900 mt-1">
                {receipt.storage_path}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
