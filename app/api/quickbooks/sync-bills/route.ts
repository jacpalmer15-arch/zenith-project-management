import { NextResponse } from 'next/server'
import { listReceipts } from '@/lib/data/receipts'
import { createBillFromReceipt } from '@/lib/quickbooks/create-bill'

/**
 * Manually trigger bill sync for allocated receipts
 */
export async function POST() {
  try {
    // Find allocated receipts without QB bill
    const receipts = await listReceipts({ is_allocated: true })

    const results = []
    let syncedCount = 0
    let errorCount = 0

    for (const receipt of receipts) {
      // Skip if already has bill
      if ((receipt as any).qb_bill_id) {
        continue
      }

      try {
        await createBillFromReceipt(receipt.id)
        results.push({
          receipt_id: receipt.id,
          status: 'success',
        })
        syncedCount++
      } catch (error: any) {
        results.push({
          receipt_id: receipt.id,
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
    console.error('Bill sync error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
