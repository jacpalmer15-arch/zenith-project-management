import { getWorkOrder, listCustomers, getActiveEmployees, getLocationsByCustomer } from '@/lib/data'
import { WorkOrderForm } from '@/components/work-order-form'
import { notFound } from 'next/navigation'

export default async function EditWorkOrderPage({ params }: { params: { id: string } }) {
  let workOrder
  
  try {
    workOrder = await getWorkOrder(params.id)
  } catch (error) {
    notFound()
  }

  const [customers, employees, locations] = await Promise.all([
    listCustomers(),
    getActiveEmployees(),
    getLocationsByCustomer(workOrder.customer_id),
  ])

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 mb-6">Edit Work Order</h1>
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <WorkOrderForm 
          workOrder={workOrder} 
          customers={customers} 
          employees={employees}
          initialLocations={locations}
        />
      </div>
    </div>
  )
}
