import Link from 'next/link'
import { listPartCategories } from '@/lib/data'
import { PartCategoriesSection } from '@/components/part-categories-section'

export default async function CategoriesPage() {
  const categories = await listPartCategories()

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Part Categories</h1>
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
          className="px-4 py-2 border-b-2 border-slate-900 font-medium text-slate-900"
        >
          Categories
        </Link>
        <Link 
          href="/app/parts/cost-types" 
          className="px-4 py-2 text-slate-600 hover:text-slate-900"
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
        <PartCategoriesSection categories={categories} />
      </div>
    </div>
  )
}
