import { EmployeeForm } from '@/components/employee-form'

export default function NewEmployeePage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 mb-6">New Employee</h1>
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <EmployeeForm />
      </div>
    </div>
  )
}
