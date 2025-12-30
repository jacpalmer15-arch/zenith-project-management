'use server'

import { getAuthenticatedQbClient } from './auth'
import { getReceipt, updateReceipt } from '@/lib/data/receipts'
import { getQbMapping, createQbMapping } from '@/lib/data/qb-mappings'
import { createQbSyncLog } from '@/lib/data/qb-sync-logs'

/**
 * Find or create a vendor in QuickBooks
 */
async function findOrCreateVendor(vendorName: string) {
  const qbClient = await getAuthenticatedQbClient()

  // Sanitize vendor name for query
  const sanitizedName = vendorName.replace(/'/g, "\\'")

  // Query for existing vendor
  const queryResponse = await qbClient.query(
    `SELECT * FROM Vendor WHERE DisplayName = '${sanitizedName}'`
  )

  if (queryResponse.QueryResponse.Vendor && queryResponse.QueryResponse.Vendor.length > 0) {
    return { value: queryResponse.QueryResponse.Vendor[0].Id }
  }

  // Create new vendor
  const response = await qbClient.create('Vendor', {
    DisplayName: vendorName,
  })

  return { value: response.Vendor.Id }
}

/**
 * Create a QuickBooks bill from an allocated receipt
 */
export async function createBillFromReceipt(receiptId: string) {
  try {
    // Get the receipt
    const receipt = await getReceipt(receiptId) as any

    if (!receipt || !receipt.is_allocated) {
      throw new Error('Receipt must be allocated before creating bill')
    }

    // Check if bill already exists
    if (receipt.qb_bill_id) {
      throw new Error('Bill already exists for this receipt')
    }

    // Get vendor (use receipt vendor_name or default vendor)
    const vendorName = receipt.vendor_name || 'General Vendor'
    const vendorRef = await findOrCreateVendor(vendorName)

    // Link to work order job if allocated to work order
    let customerRef = null
    if (receipt.allocated_to_work_order_id) {
      const workOrderMapping = await getQbMapping('work_order', receipt.allocated_to_work_order_id)
      if (workOrderMapping) {
        customerRef = { value: workOrderMapping.qb_list_id }
      }
    }

    // Build bill payload
    const billPayload: any = {
      VendorRef: vendorRef,
      TxnDate: receipt.receipt_date
        ? new Date(receipt.receipt_date).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      Line: [
        {
          DetailType: 'AccountBasedExpenseLineDetail',
          Amount: parseFloat(receipt.total_amount?.toString() || '0'),
          AccountBasedExpenseLineDetail: {
            AccountRef: { value: 'Expenses' },
            BillableStatus: 'NotBillable',
          },
          Description: receipt.notes || `Receipt ${receipt.id.slice(0, 8)}`,
        },
      ],
      PrivateNote: `Zenith Receipt ID: ${receipt.id}`,
    }

    // Link to job for job costing if available
    if (customerRef) {
      billPayload.Line[0].AccountBasedExpenseLineDetail.CustomerRef = customerRef
    }

    // Create bill in QuickBooks
    const qbClient = await getAuthenticatedQbClient()
    const response = await qbClient.create('Bill', billPayload)

    const bill = response.Bill

    // Update receipt with QB bill reference
    await updateReceipt(receipt.id, {
      qb_bill_id: bill.Id,
      qb_bill_number: bill.DocNumber,
      qb_bill_status: 'unpaid',
      qb_bill_synced_at: new Date().toISOString(),
    } as any)

    // Create mapping
    await createQbMapping({
      zenith_entity_type: 'receipt',
      zenith_entity_id: receipt.id,
      qb_entity_type: 'Bill',
      qb_list_id: bill.Id,
      qb_full_name: bill.DocNumber,
    })

    // Log the sync operation
    await createQbSyncLog({
      sync_type: 'bill_create',
      direction: 'to_qb',
      status: 'success',
      entity_type: 'receipt',
      entity_id: receipt.id,
      qb_response: JSON.stringify(response),
      processed_count: 1,
    })

    return bill
  } catch (error: any) {
    // Log the error
    await createQbSyncLog({
      sync_type: 'bill_create',
      direction: 'to_qb',
      status: 'error',
      entity_type: 'receipt',
      entity_id: receiptId,
      error_message: error.message,
      processed_count: 0,
    })

    throw error
  }
}

/**
 * Update bill status from QuickBooks
 */
export async function updateBillStatus(billId: string): Promise<void> {
  const qbClient = await getAuthenticatedQbClient()

  // Fetch bill from QuickBooks
  const response = await qbClient.read('Bill', billId)
  const bill = response.Bill

  // Find the receipt linked to this bill
  const mapping = await getQbMapping('receipt', billId)
  if (!mapping) {
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
