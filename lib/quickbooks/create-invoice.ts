'use server'

import { getAuthenticatedQbClient } from './auth'
import { getQuote, listQuoteLines, updateQuote } from '@/lib/data/quotes'
import { getQbMapping, createQbMapping } from '@/lib/data/qb-mappings'
import { createQbSyncLog } from '@/lib/data/qb-sync-logs'

/**
 * Create a QuickBooks invoice from an accepted quote
 */
export async function createInvoiceFromQuote(quoteId: string) {
  try {
    // Get the quote with project and customer details
    const quote = await getQuote(quoteId)

    if (!quote || quote.status !== 'Accepted') {
      throw new Error('Quote must be accepted before creating invoice')
    }

    // Check if invoice already exists
    if (quote.qb_invoice_id) {
      throw new Error('Invoice already exists for this quote')
    }

    // Get customer mapping
    const customerMapping = await getQbMapping('customer', quote.project.customer.id)
    if (!customerMapping) {
      throw new Error('Customer not synced to QuickBooks. Sync customers first.')
    }

    // Get work order subcustomer mapping (if linked)
    let customerRef = { value: customerMapping.qb_list_id }
    if (quote.work_order_id) {
      const workOrderMapping = await getQbMapping('work_order', quote.work_order_id)
      if (workOrderMapping) {
        // Use subcustomer (job) as the customer reference
        customerRef = { value: workOrderMapping.qb_list_id }
      }
    }

    // Get quote lines
    const lines = await listQuoteLines(quote.id)

    if (!lines || lines.length === 0) {
      throw new Error('Quote has no line items')
    }

    // Build QB invoice line items
    const qbLines = lines.map((line: any, index: number) => ({
      DetailType: 'SalesItemLineDetail',
      Amount: parseFloat(line.qty) * parseFloat(line.unit_price),
      SalesItemLineDetail: {
        Qty: parseFloat(line.qty),
        UnitPrice: parseFloat(line.unit_price),
        ItemRef: {
          name: line.description || 'Service',
        },
        TaxCodeRef: line.is_taxable ? { value: 'TAX' } : { value: 'NON' },
      },
      Description: line.description,
      LineNum: index + 1,
    }))

    // Build invoice payload
    const invoicePayload: any = {
      CustomerRef: customerRef,
      CustomerMemo: {
        value: `Quote ${quote.quote_no} - ${quote.project.name}`,
      },
      TxnDate: new Date().toISOString().split('T')[0],
      Line: qbLines,
    }

    // Add due date if valid_until exists
    if (quote.valid_until) {
      invoicePayload.DueDate = new Date(quote.valid_until).toISOString().split('T')[0]
    }

    // Add tax information if available
    if (quote.tax_amount && quote.tax_rule) {
      invoicePayload.TxnTaxDetail = {
        TotalTax: parseFloat(quote.tax_amount.toString()),
      }
    }

    // Create invoice in QuickBooks
    const qbClient = await getAuthenticatedQbClient()
    const response = await qbClient.create('Invoice', invoicePayload)

    const invoice = response.Invoice

    // Update quote with QB invoice reference
    await updateQuote(quote.id, {
      qb_invoice_id: invoice.Id,
      qb_invoice_number: invoice.DocNumber,
      qb_invoice_status: 'sent',
      qb_invoice_synced_at: new Date().toISOString(),
    })

    // Create mapping
    await createQbMapping({
      zenith_entity_type: 'quote',
      zenith_entity_id: quote.id,
      qb_entity_type: 'Invoice',
      qb_list_id: invoice.Id,
      qb_full_name: invoice.DocNumber,
    })

    // Log the sync operation
    await createQbSyncLog({
      sync_type: 'invoice_create',
      direction: 'to_qb',
      status: 'success',
      entity_type: 'quote',
      entity_id: quote.id,
      qb_response: JSON.stringify(response),
      processed_count: 1,
    })

    return invoice
  } catch (error: any) {
    // Log the error
    await createQbSyncLog({
      sync_type: 'invoice_create',
      direction: 'to_qb',
      status: 'error',
      entity_type: 'quote',
      entity_id: quoteId,
      error_message: error.message,
      processed_count: 0,
    })

    throw error
  }
}

/**
 * Update invoice status from QuickBooks
 */
export async function updateInvoiceStatus(invoiceId: string): Promise<void> {
  const qbClient = await getAuthenticatedQbClient()

  // Fetch invoice from QuickBooks
  const response = await qbClient.read('Invoice', invoiceId)
  const invoice = response.Invoice

  // Find the quote linked to this invoice
  const mapping = await getQbMapping('quote', invoiceId)
  if (!mapping) {
    return
  }

  // Determine payment status
  const balance = parseFloat(invoice.Balance || 0)
  const totalAmt = parseFloat(invoice.TotalAmt || 0)

  let paymentStatus = 'sent'
  if (balance === 0) {
    paymentStatus = 'paid'
  } else if (balance < totalAmt) {
    paymentStatus = 'partial'
  } else if (invoice.DueDate) {
    const dueDate = new Date(invoice.DueDate)
    if (dueDate < new Date()) {
      paymentStatus = 'overdue'
    }
  }

  // Update quote status
  await updateQuote(mapping.zenith_entity_id, {
    qb_invoice_status: paymentStatus,
  })
}
