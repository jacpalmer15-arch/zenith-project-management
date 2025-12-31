'use server'

import { getAuthenticatedQbClient } from './auth'
import { createInvoiceFromQuote } from './create-invoice'
import { createBillFromReceipt } from './create-bill'
import { syncCustomersToQuickBooks, syncCustomersFromQuickBooks } from './sync-customers'
import { listQuotes } from '@/lib/data/quotes'
import { listReceipts } from '@/lib/data/receipts'
import { listWorkOrders } from '@/lib/data/work-orders'
import { getQboEntityMapByQbId, getQboEntityMap } from '@/lib/data/qb-mappings'
import { upsertActualCost } from '@/lib/data/qb-actual-costs'
import { getQboConnection, updateQboConnection } from '@/lib/data/qb-connections'

/**
 * Run the full QuickBooks sync worker
 */
export async function runSyncWorker() {
  console.log('Starting QuickBooks sync worker...')

  try {
    // Get connection to verify it exists
    const connection = await getQboConnection()
    if (!connection) {
      throw new Error('QuickBooks connection not found')
    }

    // 1. Sync customers (bidirectional)
    console.log('Syncing customers to QuickBooks...')
    await syncCustomersToQuickBooks()
    
    console.log('Syncing customers from QuickBooks...')
    await syncCustomersFromQuickBooks()

    // 2. Create invoices for newly accepted quotes
    console.log('Syncing accepted quotes to invoices...')
    await syncAcceptedQuotesToInvoices()

    // 3. Create bills for newly allocated receipts
    console.log('Syncing allocated receipts to bills...')
    await syncAllocatedReceiptsToBills()

    // 4. Snapshot actual costs for reporting
    console.log('Snapshotting actual costs...')
    await snapshotActualCosts()

    console.log('QuickBooks sync completed successfully')
  } catch (error: any) {
    console.error('QuickBooks sync failed:', error)
    throw error
  }
}

/**
 * Sync accepted quotes to QuickBooks invoices
 */
async function syncAcceptedQuotesToInvoices() {
  // Find accepted quotes without QB invoice
  const quotes = await listQuotes({ status: 'ACCEPTED' })

  let syncedCount = 0
  let errorCount = 0

  for (const quote of quotes) {
    // Skip if already has invoice
    if ((quote as any).qb_invoice_id) {
      continue
    }

    try {
      await createInvoiceFromQuote(quote.id)
      console.log(`Created invoice for quote ${quote.quote_no}`)
      syncedCount++
    } catch (error: any) {
      console.error(`Failed to create invoice for quote ${quote.quote_no}:`, error.message)
      errorCount++
    }
  }

  console.log(`Invoice sync complete: ${syncedCount} created, ${errorCount} errors`)
}

/**
 * Sync allocated receipts to QuickBooks bills
 */
async function syncAllocatedReceiptsToBills() {
  // Find allocated receipts without QB bill
  const receipts = await listReceipts({ is_allocated: true })

  let syncedCount = 0
  let errorCount = 0

  for (const receipt of receipts) {
    // Skip if already has bill
    if ((receipt as any).qb_bill_id) {
      continue
    }

    try {
      await createBillFromReceipt(receipt.id)
      console.log(`Created bill for receipt ${receipt.id}`)
      syncedCount++
    } catch (error: any) {
      console.error(`Failed to create bill for receipt ${receipt.id}:`, error.message)
      errorCount++
    }
  }

  console.log(`Bill sync complete: ${syncedCount} created, ${errorCount} errors`)
}

/**
 * Snapshot actual costs from QuickBooks for reporting
 */
async function snapshotActualCosts() {
  const qbClient = await getAuthenticatedQbClient()

  // Query all jobs (subcustomers) with transactions
  const jobsResponse = await qbClient.query(`SELECT * FROM Customer WHERE Job = true`)
  const jobs = jobsResponse.QueryResponse.Customer || []

  let snapshotCount = 0

  for (const job of jobs) {
    try {
      // Find linked work order
      const mapping = await getQboEntityMapByQbId('Job', job.Id)
      if (!mapping) {
        continue
      }

      // Get invoices for this job
      const invoicesResponse = await qbClient.query(
        `SELECT * FROM Invoice WHERE CustomerRef = '${job.Id}'`
      )
      const invoices = invoicesResponse.QueryResponse.Invoice || []

      // Get bills for this job
      const billsResponse = await qbClient.query(
        `SELECT * FROM Bill WHERE CustomerRef = '${job.Id}'`
      )
      const bills = billsResponse.QueryResponse.Bill || []

      // Calculate actual costs
      const laborCost = calculateLaborFromInvoices(invoices)
      const materialCost = calculateMaterialFromBills(bills)

      // Save snapshots
      if (laborCost > 0) {
        await upsertActualCost({
          work_order_id: mapping.zenith_entity_id,
          cost_type: 'labor',
          actual_amount: laborCost,
          qb_source_type: 'Invoice',
          qb_source_id: job.Id,
        })
        snapshotCount++
      }

      if (materialCost > 0) {
        await upsertActualCost({
          work_order_id: mapping.zenith_entity_id,
          cost_type: 'material',
          actual_amount: materialCost,
          qb_source_type: 'Bill',
          qb_source_id: job.Id,
        })
        snapshotCount++
      }
    } catch (error: any) {
      console.error(`Failed to snapshot costs for job ${job.Id}:`, error.message)
    }
  }

  console.log(`Actual costs snapshot complete: ${snapshotCount} cost entries`)
}

/**
 * Calculate labor costs from invoices
 */
function calculateLaborFromInvoices(invoices: any[]): number {
  let total = 0

  for (const invoice of invoices) {
    if (invoice.TotalAmt) {
      total += parseFloat(invoice.TotalAmt)
    }
  }

  return total
}

/**
 * Calculate material costs from bills
 */
function calculateMaterialFromBills(bills: any[]): number {
  let total = 0

  for (const bill of bills) {
    if (bill.TotalAmt) {
      total += parseFloat(bill.TotalAmt)
    }
  }

  return total
}
