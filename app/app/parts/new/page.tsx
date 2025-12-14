import Link from 'next/link'
import { listPartCategories, listCostTypes, listCostCodes } from '@/lib/data'
import { PartForm } from '@/components/part-form'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default async function NewPartPage() {
  const [categories, costTypes, costCodes] = await Promise.all([
    listPartCategories(),
    listCostTypes(),
    listCostCodes(),
  ])

  return (
    <div>
      <div className="mb-6">
        <Link href="/app/parts">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Parts
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-slate-900">Add Part</h1>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <PartForm 
          categories={categories}
          costTypes={costTypes}
          costCodes={costCodes}
        />
      </div>
    </div>
  )
}
