import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getCustomer } from '@/lib/data'
import { CustomerForm } from '@/components/customer-form'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

interface EditCustomerPageProps {
  params: {
    id: string
  }
}

export default async function EditCustomerPage({ params }: EditCustomerPageProps) {
  let customer
  try {
    customer = await getCustomer(params.id)
  } catch (error) {
    notFound()
  }

  return (
    <div>
      <div className="mb-6">
        <Link href="/app/customers">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Customers
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-slate-900">Edit Customer</h1>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <CustomerForm customer={customer} />
      </div>
    </div>
  )
}
