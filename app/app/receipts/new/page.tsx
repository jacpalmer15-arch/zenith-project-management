import Link from 'next/link'
import { ReceiptForm } from '@/components/receipt-form'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default async function NewReceiptPage() {
  return (
    <div>
      <div className="mb-6">
        <Link href="/app/receipts">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Receipts
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-slate-900">New Receipt</h1>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <ReceiptForm />
      </div>
    </div>
  )
}
