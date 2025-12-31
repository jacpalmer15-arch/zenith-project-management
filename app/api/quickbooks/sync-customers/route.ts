import { NextRequest, NextResponse } from 'next/server'
import { syncCustomersToQuickBooks, syncCustomersFromQuickBooks } from '@/lib/quickbooks/sync-customers'
import { updateQboConnection, getQboConnection } from '@/lib/data/qb-connections'

/**
 * Trigger manual customer sync
 */
export async function POST(request: NextRequest) {
  try {
    const connection = await getQboConnection()
    
    if (!connection?.is_connected) {
      return NextResponse.json(
        { error: 'QuickBooks not connected' },
        { status: 400 }
      )
    }
    
    // Parse request body to check direction
    const body = await request.json().catch(() => ({}))
    const direction = body.direction || 'bidirectional'
    
    // Update sync status
    await updateQboConnection(connection.id, {
      sync_status: 'syncing',
      sync_error: null,
    })
    
    let toQbResult = null
    let fromQbResult = null
    
    try {
      // Sync to QuickBooks
      if (direction === 'to_qb' || direction === 'bidirectional') {
        toQbResult = await syncCustomersToQuickBooks()
      }
      
      // Sync from QuickBooks
      if (direction === 'from_qb' || direction === 'bidirectional') {
        fromQbResult = await syncCustomersFromQuickBooks()
      }
      
      // Update sync status
      await updateQboConnection(connection.id, {
        sync_status: 'idle',
        last_sync_at: new Date().toISOString(),
      })
      
      return NextResponse.json({
        success: true,
        toQb: toQbResult,
        fromQb: fromQbResult,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      
      await updateQboConnection(connection.id, {
        sync_status: 'error',
        sync_error: message,
      })
      
      throw error
    }
  } catch (error) {
    console.error('Customer sync error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to sync customers', details: message },
      { status: 500 }
    )
  }
}
