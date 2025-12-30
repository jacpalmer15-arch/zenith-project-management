import { getQuote, listQuoteLines, listProjects, listTaxRules, listQuotes, listParts, getWorkOrder } from '@/lib/data'
import { QuoteDetails } from '@/components/quote-details'
import { notFound } from 'next/navigation'
import { RelatedLinks } from '@/components/related-links'

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

    // Fetch related entities
    const workOrder = (quote as any).work_order_id ? await getWorkOrder((quote as any).work_order_id).catch(() => null) : null
    
    const relatedEntities: Array<{
      type: 'customer' | 'project' | 'work_order' | 'quote' | 'location'
      id: string
      label: string
      href: string
      metadata?: string
    }> = []
    
    const quoteWithProject = quote as any
    
    if (quoteWithProject.project?.customer && quoteWithProject.project.customer.name) {
      relatedEntities.push({
        type: 'customer' as const,
        id: quoteWithProject.project.customer.id,
        label: quoteWithProject.project.customer.name,
        href: `/app/customers/${quoteWithProject.project.customer.id}`,
        metadata: quoteWithProject.project.customer.customer_no || undefined
      })
    }
    
    if (quoteWithProject.project && quoteWithProject.project.name) {
      relatedEntities.push({
        type: 'project' as const,
        id: quoteWithProject.project.id,
        label: quoteWithProject.project.name,
        href: `/app/projects/${quoteWithProject.project.id}`,
        metadata: quoteWithProject.project.project_no || undefined
      })
    }
    
    if (workOrder && workOrder.work_order_no) {
      relatedEntities.push({
        type: 'work_order' as const,
        id: workOrder.id,
        label: workOrder.work_order_no,
        href: `/app/work-orders/${workOrder.id}`,
        metadata: workOrder.status || undefined
      })
    }

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <QuoteDetails
            quote={quote as any}
            lines={lines}
            projects={projects as any}
            taxRules={taxRules}
            quotes={quotes as any}
            parts={parts as any}
          />
        </div>
        
        <div className="space-y-6">
          <RelatedLinks 
            entities={relatedEntities} 
            title="Related Records"
          />
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error loading quote:', error)
    notFound()
  }
}
