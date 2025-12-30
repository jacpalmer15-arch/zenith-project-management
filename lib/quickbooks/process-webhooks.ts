'use server'

import { getAuthenticatedQbClient } from './auth'
import { listWebhookEvents, updateWebhookEvent, QbWebhookEvent } from '@/lib/data/qb-webhook-events'
import { getQbMappingByQbId } from '@/lib/data/qb-mappings'
import { updateQuote, getQuote } from '@/lib/data/quotes'
import { updateReceipt } from '@/lib/data/receipts'
import { getWorkOrder } from '@/lib/data/work-orders'
import { transitionWorkOrder } from '@/lib/workflows/work-order-lifecycle'
import { validateWorkOrderClose } from '@/lib/workflows/work-order-closeout'

/**
 * Process all unprocessed webhook events
 */
export async function processWebhookEvents() {
  const unprocessedEvents = await listWebhookEvents({ processed: false, limit: 100 })

  console.log(`Processing ${unprocessedEvents.length} unprocessed webhook events...`)

  for (const event of unprocessedEvents) {
    try {
      switch (event.event_name) {
        case 'Invoice':
          await processInvoiceWebhook(event)
          break
        case 'Payment':
          await processPaymentWebhook(event)
          break
        case 'Bill':
          await processBillWebhook(event)
          break
        case 'Customer':
          await processCustomerWebhook(event)
          break
        default:
          console.log(`Skipping unsupported event type: ${event.event_name}`)
      }

      // Mark as processed
      await updateWebhookEvent(event.id, {
        processed: true,
        processed_at: new Date().toISOString(),
      })

      console.log(`Processed webhook event ${event.id} (${event.event_name})`)
    } catch (error: any) {
      console.error(`Failed to process webhook event ${event.id}:`, error)
      
      await updateWebhookEvent(event.id, {
        error_message: error.message,
      })
    }
  }
}

/**
 * Process invoice webhook event
 */
async function processInvoiceWebhook(event: QbWebhookEvent) {
  if (event.event_operation === 'Delete') {
    // Handle invoice deletion - mark quote as unsynced
    const mapping = await getQbMappingByQbId('Invoice', event.entity_id)
    if (mapping) {
      await updateQuote(mapping.zenith_entity_id, {
        qb_invoice_id: null,
        qb_invoice_number: null,
        qb_invoice_status: null,
        qb_invoice_synced_at: null,
      } as any)
    }
    return
  }

  // Fetch updated invoice from QuickBooks
  const qbClient = await getAuthenticatedQbClient()
  const response = await qbClient.read('Invoice', event.entity_id)
  const invoice = response.Invoice

  // Find the quote linked to this invoice
  const mapping = await getQbMappingByQbId('Invoice', event.entity_id)
  if (!mapping) {
    console.log(`No mapping found for invoice ${event.entity_id}`)
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
  } as any)
}

/**
 * Process payment webhook event
 */
async function processPaymentWebhook(event: QbWebhookEvent) {
  const qbClient = await getAuthenticatedQbClient()

  // Fetch payment details from QB
  const response = await qbClient.read('Payment', event.entity_id)
  const payment = response.Payment

  if (!payment) {
    console.log(`Payment ${event.entity_id} not found`)
    return
  }

  // Find linked invoices
  const lines = payment.Line || []
  
  for (const line of lines) {
    if (line.LinkedTxn && line.LinkedTxn.length > 0) {
      for (const linkedTxn of line.LinkedTxn) {
        if (linkedTxn.TxnType === 'Invoice') {
          const invoiceId = linkedTxn.TxnId

          // Find Zenith quote linked to this invoice
          const mapping = await getQbMappingByQbId('Invoice', invoiceId)

          if (mapping) {
            // Fetch updated invoice status
            const invoiceResponse = await qbClient.read('Invoice', invoiceId)
            const invoice = invoiceResponse.Invoice

            // Determine payment status
            const balance = parseFloat(invoice.Balance || 0)
            const totalAmt = parseFloat(invoice.TotalAmt || 0)

            const paymentStatus = balance === 0 ? 'paid' : balance < totalAmt ? 'partial' : 'sent'

            // Update quote status
            await updateQuote(mapping.zenith_entity_id, {
              qb_invoice_status: paymentStatus,
            } as any)

            // If fully paid, consider closing work order
            const quote = await getQuote(mapping.zenith_entity_id)
            if (paymentStatus === 'paid' && quote.work_order_id) {
              const workOrder = await getWorkOrder(quote.work_order_id)
              if (workOrder.status === 'COMPLETED') {
                // Validate close-out before attempting
                const validation = await validateWorkOrderClose(quote.work_order_id)
                if (validation.canClose) {
                  try {
                    await transitionWorkOrder(
                      quote.work_order_id, 
                      'CLOSED',
                      'Automatically closed: Invoice fully paid'
                    )
                    console.log(`Work order ${quote.work_order_id} automatically closed after full payment`)
                  } catch (error) {
                    console.error(`Failed to auto-close work order ${quote.work_order_id}:`, error)
                  }
                } else {
                  console.log(`Cannot auto-close work order ${quote.work_order_id}: ${validation.issues.join(', ')}`)
                }
              }
            }
          }
        }
      }
    }
  }
}

/**
 * Process bill webhook event
 */
async function processBillWebhook(event: QbWebhookEvent) {
  if (event.event_operation === 'Delete') {
    // Handle bill deletion - mark receipt as unsynced
    const mapping = await getQbMappingByQbId('Bill', event.entity_id)
    if (mapping) {
      await updateReceipt(mapping.zenith_entity_id, {
        qb_bill_id: null,
        qb_bill_number: null,
        qb_bill_status: null,
        qb_bill_synced_at: null,
      } as any)
    }
    return
  }

  // Fetch updated bill from QuickBooks
  const qbClient = await getAuthenticatedQbClient()
  const response = await qbClient.read('Bill', event.entity_id)
  const bill = response.Bill

  // Find the receipt linked to this bill
  const mapping = await getQbMappingByQbId('Bill', event.entity_id)
  if (!mapping) {
    console.log(`No mapping found for bill ${event.entity_id}`)
    return
  }

  // Determine payment status
  const balance = parseFloat(bill.Balance || 0)
  const totalAmt = parseFloat(bill.TotalAmt || 0)

  let paymentStatus = 'unpaid'
  if (balance === 0) {
    paymentStatus = 'paid'
  } else if (balance < totalAmt) {
    paymentStatus = 'partial'
  }

  // Update receipt status
  await updateReceipt(mapping.zenith_entity_id, {
    qb_bill_status: paymentStatus,
  } as any)
}

/**
 * Process customer webhook event
 */
async function processCustomerWebhook(event: QbWebhookEvent) {
  // Customer webhooks could trigger re-sync if needed
  // For now, we'll just log them
  console.log(`Customer webhook received for ${event.entity_id}`)
}
