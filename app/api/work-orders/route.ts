import { NextRequest, NextResponse } from 'next/server'
import { listWorkOrders } from '@/lib/data/work-orders'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    
    // Parse status if provided
    const statuses = status ? status.split(',') : undefined
    
    // Get work orders - if multiple statuses, we'll filter client side for simplicity
    // Or we can call listWorkOrders multiple times
    const workOrders = await listWorkOrders()
    
    // Filter by status if provided
    const filtered = statuses 
      ? workOrders.filter(wo => statuses.includes(wo.status))
      : workOrders
    
    // Return simplified work orders
    const simplified = filtered.map(wo => ({
      id: wo.id,
      work_order_no: wo.work_order_no,
      summary: wo.summary,
      status: wo.status
    }))
    
    return NextResponse.json(simplified)
  } catch (error) {
    console.error('Failed to fetch work orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch work orders' },
      { status: 500 }
    )
  }
}
