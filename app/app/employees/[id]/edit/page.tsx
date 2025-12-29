import { getEmployee } from '@/lib/data'
import { EmployeeForm } from '@/components/employee-form'
import { notFound } from 'next/navigation'

export default async function EditEmployeePage({ params }: { params: { id: string } }) {
  let employee
  
  try {
    employee = await getEmployee(params.id)
  } catch (error) {
    notFound()
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 mb-6">Edit Employee</h1>
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <EmployeeForm employee={employee} />
      </div>
    </div>
  )
}
