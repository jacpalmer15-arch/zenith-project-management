import { listCustomers } from '@/lib/data'
import { LocationForm } from '@/components/location-form'

interface NewLocationPageProps {
  searchParams: {
    customer_id?: string
  }
}

export default async function NewLocationPage({ searchParams }: NewLocationPageProps) {
  const customers = await listCustomers()

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 mb-6">New Location</h1>
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <LocationForm 
          customers={customers} 
          defaultCustomerId={searchParams.customer_id}
        />
      </div>
    </div>
  )
}
