import { getEquipment } from '@/lib/data'
import { EquipmentForm } from '@/components/equipment-form'
import { notFound } from 'next/navigation'

export default async function EditEquipmentPage({ params }: { params: { id: string } }) {
  let equipment
  
  try {
    equipment = await getEquipment(params.id)
  } catch (error) {
    notFound()
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 mb-6">Edit Equipment</h1>

      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <EquipmentForm equipment={equipment} />
      </div>
    </div>
  )
}
