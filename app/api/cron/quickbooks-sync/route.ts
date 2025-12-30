import { NextRequest, NextResponse } from 'next/server'
import { runSyncWorker } from '@/lib/quickbooks/sync-worker'

/**
 * Scheduled cron job for QuickBooks sync
 * This endpoint should be called by a cron service (e.g., Vercel Cron)
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization')
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`

    if (!process.env.CRON_SECRET) {
      console.error('CRON_SECRET not configured')
      return NextResponse.json({ error: 'Cron not configured' }, { status: 500 })
    }

    if (authHeader !== expectedAuth) {
      console.error('Unauthorized cron request')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Starting scheduled QuickBooks sync...')

    // Run the sync worker
    await runSyncWorker()

    return NextResponse.json({
      success: true,
      message: 'QuickBooks sync completed successfully',
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('Cron job error:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    }, { status: 500 })
  }
}
