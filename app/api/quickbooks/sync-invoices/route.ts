import { NextResponse } from 'next/server'
import { listQuotes } from '@/lib/data/quotes'
import { createInvoiceFromQuote } from '@/lib/quickbooks/create-invoice'

/**
 * Manually trigger invoice sync for accepted quotes
 */
export async function POST() {
  try {
    // Find accepted quotes without QB invoice
    const quotes = await listQuotes({ status: 'Accepted' })

    const results = []
    let syncedCount = 0
    let errorCount = 0

    for (const quote of quotes) {
      // Skip if already has invoice
      if ((quote as any).qb_invoice_id) {
        continue
      }

      try {
        await createInvoiceFromQuote(quote.id)
        results.push({
          quote_id: quote.id,
          quote_no: quote.quote_no,
          status: 'success',
        })
        syncedCount++
      } catch (error: any) {
        results.push({
          quote_id: quote.id,
          quote_no: quote.quote_no,
          status: 'error',
          error: error.message,
        })
        errorCount++
      }
    }

    return NextResponse.json({
      success: true,
      synced: syncedCount,
      errors: errorCount,
      results,
    })
  } catch (error: any) {
    console.error('Invoice sync error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
