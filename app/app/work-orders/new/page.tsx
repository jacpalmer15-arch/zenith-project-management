import { listCustomers, getActiveEmployees } from '@/lib/data'
import { WorkOrderForm } from '@/components/work-order-form'

export default async function NewWorkOrderPage() {
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
