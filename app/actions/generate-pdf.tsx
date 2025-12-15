'use server'

import React from 'react'
import { renderToBuffer } from '@react-pdf/renderer'
import { getQuote, listQuoteLines, getSettings } from '@/lib/data'
import { QuotePDF } from '@/components/pdf/quote-pdf'

export async function generateQuotePDF(quoteId: string) {
  try {
    // Fetch all required data
    const [quote, lines, settings] = await Promise.all([
      getQuote(quoteId),
      listQuoteLines(quoteId),
      getSettings(),
    ])

    if (!quote) {
      return { error: 'Quote not found' }
    }

    // Calculate totals
    const subtotal = lines.reduce((sum, line) => {
      return sum + (line.qty * line.unit_price)
    }, 0)

    const taxableSubtotal = lines.reduce((sum, line) => {
      if (line.is_taxable) {
        return sum + (line.qty * line.unit_price)
      }
      return sum
    }, 0)

    const taxAmount = taxableSubtotal * ((quote as any).tax_rule?.rate || 0)
    const total = subtotal + taxAmount

    const calculations = {
      subtotal,
      taxableSubtotal,
      taxAmount,
      total,
    }

    // Generate PDF buffer
    const pdfBuffer = await renderToBuffer(
      <QuotePDF 
        quote={quote as any}
        lines={lines}
        settings={settings}
        calculations={calculations}
      />
    )

    // Convert buffer to base64 for client download
    const base64 = pdfBuffer.toString('base64')

    return {
      success: true,
      pdf: base64,
      filename: `${quote.quote_no}.pdf`,
    }
  } catch (error) {
    console.error('PDF generation error:', error)
    return { error: 'Failed to generate PDF' }
  }
}
