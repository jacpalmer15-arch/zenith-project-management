import { NextRequest, NextResponse } from 'next/server'
import { getAuditLogsForRecord } from '@/lib/data/audit-logs'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const table = searchParams.get('table')
    const recordId = searchParams.get('record_id')

    if (!table || !recordId) {
      return NextResponse.json(
        { error: 'Missing required parameters: table and record_id' },
        { status: 400 }
      )
    }

    const logs = await getAuditLogsForRecord(table, recordId)
    return NextResponse.json(logs)
  } catch (error) {
    console.error('Error fetching audit logs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch audit logs' },
      { status: 500 }
    )
  }
}
