import { getQuote, listQuoteLines, listProjects, listTaxRules, listQuotes, listParts } from '@/lib/data'
import { QuoteDetails } from '@/components/quote-details'
import { notFound } from 'next/navigation'

interface PageProps {
  params: {
    id: string
  }
}

export default async function QuoteDetailPage({ params }: PageProps) {
  try {
    const [quote, lines, projects, taxRules, quotes, parts] = await Promise.all([
      getQuote(params.id),
      listQuoteLines(params.id),
      listProjects(),
      listTaxRules(),
      listQuotes(),
      listParts({ is_active: true }),
    ])

    return (
      <QuoteDetails
        quote={quote as any}
        lines={lines}
        projects={projects as any}
        taxRules={taxRules}
        quotes={quotes as any}
        parts={parts as any}
      />
    )
  } catch (error) {
    console.error('Error loading quote:', error)
    notFound()
  }
}
