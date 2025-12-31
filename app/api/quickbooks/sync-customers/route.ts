import { NextRequest, NextResponse } from 'next/server'
import { syncCustomersToQuickBooks, syncCustomersFromQuickBooks } from '@/lib/quickbooks/sync-customers'
import { getQboConnection } from '@/lib/data/qb-connections'

/**
 * Trigger manual customer sync
 */
export async function POST(request: NextRequest) {
  try {
    const connection = await getQboConnection()
    
    if (!connection) {
      return NextResponse.json(
        { error: 'QuickBooks not connected' },
        { status: 400 }
      )
    }
    
    // Parse request body to check direction
    const body = await request.json().catch(() => ({}))
    const direction = body.direction || 'bidirectional'
    
    let toQbResult = null
    let fromQbResult = null
    
    // Sync to QuickBooks
    if (direction === 'to_qb' || direction === 'bidirectional') {
      toQbResult = await syncCustomersToQuickBooks()
    }
    
    // Sync from QuickBooks
    if (direction === 'from_qb' || direction === 'bidirectional') {
      fromQbResult = await syncCustomersFromQuickBooks()
    }
    
    return NextResponse.json({
      success: true,
      toQb: toQbResult,
      fromQb: fromQbResult,
    })
  } catch (error) {
    console.error('Customer sync error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to sync customers', details: message },
      { status: 500 }
    )
  }
}
