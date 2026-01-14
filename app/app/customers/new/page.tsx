import Link from 'next/link'
import { CustomerForm } from '@/components/customer-form'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth/get-user'
import { hasPermission } from '@/lib/auth/permissions'
import { redirect } from 'next/navigation'

export default async function NewCustomerPage() {
  const user = await getCurrentUser()
  if (!hasPermission(user?.role, 'edit_customers')) {
    redirect('/app/dashboard')
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
        <h1 className="text-3xl font-bold text-slate-900">Add Customer</h1>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <CustomerForm />
      </div>
    </div>
  )
}
