'use server'

import { getAuthenticatedQbClient } from './auth'
import { listWebhookEvents, updateWebhookEvent } from '@/lib/data/qb-webhook-events'
import { QboWebhookEvent } from '@/lib/db'
import { getQboEntityMapByQboId } from '@/lib/data/qb-mappings'
import { updateQuote, getQuote } from '@/lib/data/quotes'
import { updateReceipt } from '@/lib/data/receipts'
import { getWorkOrder } from '@/lib/data/work-orders'
import { transitionWorkOrder } from '@/lib/workflows/work-order-lifecycle'
import { validateWorkOrderClose } from '@/lib/workflows/work-order-closeout'

/**
 * Process all unprocessed webhook events
 */
export async function processWebhookEvents() {
  const unprocessedEvents = await listWebhookEvents({ status: 'PENDING', limit: 100 })

  console.log(`Processing ${unprocessedEvents.length} unprocessed webhook events...`)

  for (const event of unprocessedEvents) {
    try {
      // Extract event data from payload
      const payload = event.payload as any
      const entities = payload.dataChangeEvent?.entities || []
      
      for (const entity of entities) {
        const eventName = entity.name
        const eventOperation = entity.operation
        const entityId = entity.id
        
        switch (eventName) {
          case 'Invoice':
            await processInvoiceWebhook(entityId, eventOperation)
            break
          case 'Payment':
            await processPaymentWebhook(entityId, eventOperation)
            break
          case 'Bill':
            await processBillWebhook(entityId, eventOperation)
            break
          case 'Customer':
            await processCustomerWebhook(entityId, eventOperation)
            break
          default:
            console.log(`Skipping unsupported event type: ${eventName}`)
        }
      }

      // Mark as processed
      await updateWebhookEvent(event.id, {
        status: 'COMPLETED',
        processed_at: new Date().toISOString(),
      })

      console.log(`Processed webhook event ${event.id}`)
    } catch (error: any) {
      console.error(`Failed to process webhook event ${event.id}:`, error)
      
      await updateWebhookEvent(event.id, {
        status: 'FAILED',
        last_error: error.message,
        attempts: event.attempts + 1,
      })
    }
  }
}

/**
 * Process invoice webhook event
 */
async function processInvoiceWebhook(entityId: string, operation: string) {
  if (operation === 'Delete') {
    // Handle invoice deletion - mark quote as unsynced
    const mapping = await getQboEntityMapByQboId('Invoice', entityId)
    if (mapping) {
      await updateQuote(mapping.local_id, {
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
  const response = await qbClient.read('Invoice', entityId)
  const invoice = response.Invoice

  // Find the quote linked to this invoice
  const mapping = await getQboEntityMapByQboId('Invoice', entityId)
  if (!mapping) {
    console.log(`No mapping found for invoice ${entityId}`)
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
  await updateQuote(mapping.local_id, {
    qb_invoice_status: paymentStatus,
  } as any)
}

/**
 * Process payment webhook event
 */
async function processPaymentWebhook(entityId: string, operation: string) {
  const qbClient = await getAuthenticatedQbClient()

  // Fetch payment details from QB
  const response = await qbClient.read('Payment', entityId)
  const payment = response.Payment

  if (!payment) {
    console.log(`Payment ${entityId} not found`)
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
          const mapping = await getQboEntityMapByQboId('Invoice', invoiceId)

          if (mapping) {
            // Fetch updated invoice status
            const invoiceResponse = await qbClient.read('Invoice', invoiceId)
            const invoice = invoiceResponse.Invoice

            // Determine payment status
            const balance = parseFloat(invoice.Balance || 0)
            const totalAmt = parseFloat(invoice.TotalAmt || 0)

            const paymentStatus = balance === 0 ? 'paid' : balance < totalAmt ? 'partial' : 'sent'

            // Update quote status
            await updateQuote(mapping.local_id, {
              qb_invoice_status: paymentStatus,
            } as any)

            // If fully paid, consider closing work order
            const quote = await getQuote(mapping.local_id)
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
async function processBillWebhook(entityId: string, operation: string) {
  if (operation === 'Delete') {
    // Handle bill deletion - mark receipt as unsynced
    const mapping = await getQboEntityMapByQboId('Bill', entityId)
    if (mapping) {
      await updateReceipt(mapping.local_id, {
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
  const response = await qbClient.read('Bill', entityId)
  const bill = response.Bill

  // Find the receipt linked to this bill
  const mapping = await getQboEntityMapByQboId('Bill', entityId)
  if (!mapping) {
    console.log(`No mapping found for bill ${entityId}`)
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
  await updateReceipt(mapping.local_id, {
    qb_bill_status: paymentStatus,
  } as any)
}

/**
 * Process customer webhook event
 */
async function processCustomerWebhook(entityId: string, operation: string) {
  // Customer webhooks could trigger re-sync if needed
  // For now, we'll just log them
  console.log(`Customer webhook received for ${entityId}`)
}
