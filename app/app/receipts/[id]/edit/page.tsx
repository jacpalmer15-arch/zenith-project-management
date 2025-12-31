import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getReceipt } from '@/lib/data/receipts'
import { ReceiptForm } from '@/components/receipt-form'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

interface EditReceiptPageProps {
  params: {
    id: string
  }
}

export default async function EditReceiptPage({ params }: EditReceiptPageProps) {
  let receipt
  
  try {
    receipt = await getReceipt(params.id)
  } catch (error) {
    notFound()
  }

  return (
    <div>
      <div className="mb-6">
        <Link href={`/app/receipts/${params.id}`}>
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Receipt
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-slate-900">Edit Receipt</h1>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <ReceiptForm receipt={receipt} />
      </div>
    </div>
  )
}
