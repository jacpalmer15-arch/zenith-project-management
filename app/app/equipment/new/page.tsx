import { EquipmentForm } from '@/components/equipment-form'

export default function NewEquipmentPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 mb-6">New Equipment</h1>

      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <EquipmentForm />
      </div>
    </div>
  )
}
