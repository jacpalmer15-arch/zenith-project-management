import { getLocation, listCustomers } from '@/lib/data'
import { LocationForm } from '@/components/location-form'
import { notFound } from 'next/navigation'

export default async function EditLocationPage({ params }: { params: { id: string } }) {
  let location
  
  try {
    location = await getLocation(params.id)
  } catch (error) {
    notFound()
  }

  const customers = await listCustomers()

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 mb-6">Edit Location</h1>
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <LocationForm location={location} customers={customers} />
      </div>
    </div>
  )
}
