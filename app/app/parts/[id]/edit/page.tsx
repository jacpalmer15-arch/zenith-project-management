import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPart, listPartCategories, listCostTypes, listCostCodes } from '@/lib/data'
import { PartForm } from '@/components/part-form'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

interface EditPartPageProps {
  params: {
    id: string
  }
}

export default async function EditPartPage({ params }: EditPartPageProps) {
  let part
  try {
    part = await getPart(params.id)
  } catch (error) {
    notFound()
  }

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
        <h1 className="text-3xl font-bold text-slate-900">Edit Part</h1>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <PartForm 
          part={part}
          categories={categories}
          costTypes={costTypes}
          costCodes={costCodes}
        />
      </div>
    </div>
  )
}
