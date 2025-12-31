import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getReceipt, listReceiptLineItems } from '@/lib/data/receipts'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ArrowLeft, Pencil, Trash2, Plus } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/format-currency'
import { format } from 'date-fns'
import { DeleteReceiptButton } from '@/components/delete-receipt-button'
import { DeleteLineItemButton } from '@/components/receipts/delete-line-item-button'
import { ReceiptLineItem } from '@/lib/db'

interface ReceiptDetailPageProps {
  params: {
    id: string
  }
}

export default async function ReceiptDetailPage({ params }: ReceiptDetailPageProps) {
  let receipt
  let lineItems: ReceiptLineItem[] = []
  
  try {
    receipt = await getReceipt(params.id)
    lineItems = await listReceiptLineItems(params.id)
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

      {/* Line Items Section */}
      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Line Items</CardTitle>
          <Link href={`/app/receipts/${receipt.id}/lines/new`}>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Line Item
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {lineItems.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <p>No line items yet. Add line items to break down this receipt.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">#</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Unit Cost</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lineItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.line_no}</TableCell>
                    <TableCell>
                      {item.description}
                      {item.uom && <span className="text-slate-500 text-sm ml-2">({item.uom})</span>}
                    </TableCell>
                    <TableCell className="text-right">{item.qty.toFixed(2)}</TableCell>
                    <TableCell className="text-right">${item.unit_cost.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-medium">${item.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Link href={`/app/receipts/${receipt.id}/lines/${item.id}/edit`}>
                          <Button size="sm" variant="ghost">
                            <Pencil className="w-3 h-3" />
                          </Button>
                        </Link>
                        <DeleteLineItemButton lineItemId={item.id} receiptId={receipt.id} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          
          {/* Show total of line items */}
          {lineItems.length > 0 && (
            <div className="mt-4 pt-4 border-t flex justify-between items-center">
              <span className="text-slate-600">Line Items Total:</span>
              <span className="font-bold text-lg">
                ${lineItems.reduce((sum, item) => sum + item.amount, 0).toFixed(2)}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
