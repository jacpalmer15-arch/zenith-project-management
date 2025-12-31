'use client'

import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface QbConnection {
  id: string
  realm_id: string
  expires_at: string
  scope: string | null
  created_at: string
  updated_at: string
}

interface QuickBooksConnectionCardProps {
  connection: QbConnection | null
}

export function QuickBooksConnectionCard({ connection }: QuickBooksConnectionCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)

  const handleConnect = () => {
    window.location.href = '/api/quickbooks/connect'
  }

  const handleDisconnect = async () => {
    if (!confirm('Disconnect QuickBooks? This will stop all syncing.')) {
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/quickbooks/disconnect', {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to disconnect')
      }

      toast.success('QuickBooks disconnected successfully')
      window.location.reload()
    } catch (error) {
      console.error('Disconnect error:', error)
      toast.error('Failed to disconnect QuickBooks')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSyncNow = async () => {
    setIsSyncing(true)
    try {
      const response = await fetch('/api/quickbooks/sync-customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ direction: 'bidirectional' }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.details || 'Failed to sync')
      }

      const result = await response.json()
      const totalSuccess = (result.toQb?.successCount || 0) + (result.fromQb?.successCount || 0)
      const totalErrors = (result.toQb?.errorCount || 0) + (result.fromQb?.errorCount || 0)

      if (totalErrors > 0) {
        toast.warning(`Customer sync completed with ${totalSuccess} successful and ${totalErrors} errors`)
      } else {
        toast.success(`Customer sync completed successfully (${totalSuccess} customers)`)
      }

      // Refresh the page to update the last sync time
      window.location.reload()
    } catch (error) {
      console.error('Sync error:', error)
      const message = error instanceof Error ? error.message : 'Unknown error'
      toast.error(`Failed to sync customers: ${message}`)
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>QuickBooks Online Integration</CardTitle>
        <CardDescription>
          Connect your QuickBooks Online account to sync customers and financial data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {connection ? (
          <>
            <div className="flex items-center gap-2">
              <Badge variant="default" className="bg-green-500">Connected</Badge>
              <span className="text-sm text-muted-foreground">
                Realm ID: {connection.realm_id}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Connected: {new Date(connection.created_at).toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground">
              Token expires: {new Date(connection.expires_at).toLocaleString()}
            </p>
            <div className="flex gap-2">
              <Button 
                onClick={handleSyncNow} 
                disabled={isLoading || isSyncing}
              >
                {isSyncing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  'Sync Customers Now'
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleDisconnect}
                disabled={isLoading || isSyncing}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Disconnecting...
                  </>
                ) : (
                  'Disconnect'
                )}
              </Button>
            </div>
          </>
        ) : (
          <>
            <Badge variant="secondary">Not Connected</Badge>
            <p className="text-sm text-muted-foreground">
              Connect QuickBooks Desktop to enable customer sync, invoicing, and bill tracking.
            </p>
            <Button onClick={handleConnect}>Connect QuickBooks</Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}
