import { getQuotesPipeline } from '@/lib/data/reports'
import { QuotesPipelineClient } from './client'

export default async function QuotesPipelinePage() {
  const data = await getQuotesPipeline()

  return <QuotesPipelineClient initialData={data} />
}
