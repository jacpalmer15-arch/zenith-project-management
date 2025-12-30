import { NextResponse } from 'next/server'
import { runSyncWorker } from '@/lib/quickbooks/sync-worker'

/**
 * Manually trigger full sync worker
 */
export async function POST() {
  try {
    await runSyncWorker()

    return NextResponse.json({
      success: true,
      message: 'Sync worker completed successfully',
    })
  } catch (error: any) {
    console.error('Sync worker error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
