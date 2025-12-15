'use server'

import { Resend } from 'resend'
import { QuoteEmailTemplate } from '@/components/email/quote-email-template'
import { getQuote, listQuoteLines, getSettings } from '@/lib/data'
import { generateQuotePDF } from './generate-pdf'
import { updateQuoteStatusAction } from './quotes'
import type { Quote, Project, Customer, TaxRule } from '@/lib/db'

// Type for quote with nested relations
type QuoteWithRelations = Quote & {
  project: Project & {
    customer: Customer
  }
  tax_rule: TaxRule
}

export async function sendQuoteEmail(quoteId: string) {
  try {
    // Check environment variables
    const resendApiKey = process.env.RESEND_API_KEY
    const fromEmail = process.env.FROM_EMAIL

    if (!resendApiKey) {
      return { error: 'Email service is not configured. Please add RESEND_API_KEY to environment variables.' }
    }

    if (!fromEmail) {
      return { error: 'FROM_EMAIL is not configured in environment variables.' }
    }

    // Fetch quote data
    const [quote, lines, settings] = await Promise.all([
      getQuote(quoteId),
      listQuoteLines(quoteId),
      getSettings(),
    ])

    if (!quote) {
      return { error: 'Quote not found' }
    }

    const quoteWithRelations = quote as unknown as QuoteWithRelations

    // Check if customer has email
    if (!quoteWithRelations.project?.customer?.email) {
      return { error: 'Customer email not found. Please add an email address to the customer record.' }
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

    const taxAmount = taxableSubtotal * (quoteWithRelations.tax_rule?.rate || 0)
    const total = subtotal + taxAmount

    // Generate PDF
    const pdfResult = await generateQuotePDF(quoteId)
    if (pdfResult.error || !pdfResult.pdf) {
      return { error: pdfResult.error || 'Failed to generate PDF' }
    }

    // Render email template
    const emailHtml = QuoteEmailTemplate({
      customerName: quoteWithRelations.project.customer.name,
      quoteNo: quote.quote_no,
      quoteDate: quote.quote_date,
      validUntil: quote.valid_until || quote.quote_date,
      projectName: quoteWithRelations.project.name,
      subtotal,
      taxAmount,
      total,
      taxRate: quoteWithRelations.tax_rule?.rate || 0,
      companyName: settings?.company_name || 'Zenith Field Service',
    })

    // Initialize Resend
    const resend = new Resend(resendApiKey)

    // Send email with PDF attachment
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: quoteWithRelations.project.customer.email,
      subject: `Quote #${quote.quote_no} - ${quoteWithRelations.project.name}`,
      html: emailHtml,
      attachments: [
        {
          filename: pdfResult.filename || `${quote.quote_no}.pdf`,
          content: pdfResult.pdf,
        },
      ],
    })

    if (error) {
      console.error('Resend error:', error)
      return { error: `Failed to send email: ${error.message}` }
    }

    // Update quote status from Draft to Sent
    if (quote.status === 'Draft') {
      await updateQuoteStatusAction(quoteId, 'Sent')
    }

    return { 
      success: true, 
      emailId: data?.id,
      message: `Quote sent successfully to ${quoteWithRelations.project.customer.email}`,
    }
  } catch (error) {
    console.error('Error sending quote email:', error)
    return { 
      error: error instanceof Error ? error.message : 'Failed to send quote email',
    }
  }
}
