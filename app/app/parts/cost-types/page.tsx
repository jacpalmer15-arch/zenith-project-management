import Link from 'next/link'
import { listCostTypes } from '@/lib/data'
import { CostTypesSection } from '@/components/cost-types-section'

export default async function CostTypesPage() {
  const costTypes = await listCostTypes()

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Cost Types</h1>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 mb-6 border-b border-slate-200">
        <Link 
          href="/app/parts" 
          className="px-4 py-2 text-slate-600 hover:text-slate-900"
        >
          Parts
        </Link>
        <Link 
          href="/app/parts/categories" 
          className="px-4 py-2 text-slate-600 hover:text-slate-900"
        >
          Categories
        </Link>
        <Link 
          href="/app/parts/cost-types" 
          className="px-4 py-2 border-b-2 border-slate-900 font-medium text-slate-900"
        >
          Cost Types
        </Link>
        <Link 
          href="/app/parts/cost-codes" 
          className="px-4 py-2 text-slate-600 hover:text-slate-900"
        >
          Cost Codes
        </Link>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <CostTypesSection costTypes={costTypes} />
      </div>
    </div>
  )
}
