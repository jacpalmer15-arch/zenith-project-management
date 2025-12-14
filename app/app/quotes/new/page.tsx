import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { NewQuoteForm } from '@/components/new-quote-form'
import { listProjects, listTaxRules, listQuotes, listParts } from '@/lib/data'

export default async function NewQuotePage() {
  const [projects, taxRules, quotes, parts] = await Promise.all([
    listProjects(),
    listTaxRules(),
    listQuotes(),
    listParts({ is_active: true }),
  ])

  return (
    <div className="space-y-6">
      <div>
        <Link href="/app/quotes">
          <Button variant="ghost" size="sm" className="mb-2 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Quotes
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-slate-900">Create Quote</h1>
      </div>

      <NewQuoteForm
        projects={projects as any}
        taxRules={taxRules}
        quotes={quotes as any}
        parts={parts as any}
      />
    </div>
  )
}
