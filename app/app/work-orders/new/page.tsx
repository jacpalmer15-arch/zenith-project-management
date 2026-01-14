import { listCustomers, getActiveEmployees } from '@/lib/data'
import { WorkOrderForm } from '@/components/work-order-form'
import { getCurrentUser } from '@/lib/auth/get-user'
import { hasPermission } from '@/lib/auth/permissions'
import { redirect } from 'next/navigation'

export default async function NewWorkOrderPage() {
  const user = await getCurrentUser()
  if (!hasPermission(user?.role, 'edit_work_orders')) {
    redirect('/app/dashboard')
  }

  const [customers, employees] = await Promise.all([
    listCustomers(),
    getActiveEmployees(),
  ])

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 mb-6">New Work Order</h1>
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <WorkOrderForm customers={customers} employees={employees} />
      </div>
    </div>
  )
}
