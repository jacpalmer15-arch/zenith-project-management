'use client'

import { useEffect, useState } from 'react'
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface QbConnection {
  is_connected: boolean
  sync_status: string
  last_sync_at: string | null
  sync_error: string | null
}

export function QuickBooksSyncStatus() {
  const [connection, setConnection] = useState<QbConnection | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStatus()
    // Refresh status every 30 seconds
    const interval = setInterval(fetchStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  async function fetchStatus() {
    try {
      const response = await fetch('/api/quickbooks/status')
      if (response.ok) {
        const data = await response.json()
        setConnection(data)
      }
    } catch (error) {
      console.error('Failed to fetch QuickBooks status:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return null
  }

  if (!connection?.is_connected) {
    return null
  }

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      {connection.sync_status === 'syncing' && (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Syncing with QuickBooks...</span>
        </>
      )}
      {connection.sync_status === 'error' && (
        <>
          <AlertCircle className="h-4 w-4 text-red-500" />
          <span className="text-red-500">
            Sync error
            {connection.sync_error && `: ${connection.sync_error}`}
          </span>
        </>
      )}
      {connection.sync_status === 'idle' && connection.last_sync_at && (
        <>
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span>
            Last synced:{' '}
            {formatDistanceToNow(new Date(connection.last_sync_at), { addSuffix: true })}
          </span>
        </>
      )}
    </div>
  )
}
