'use client'

import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { formatCurrency } from '@/lib/utils/format-currency'
import { format } from 'date-fns'
import Link from 'next/link'
import { History, MoreVertical } from 'lucide-react'
import { AuditLogEntry } from '@/lib/data/audit-logs'
import { AuditLogTable } from '@/components/audit/audit-log-table'

interface JobCostTableProps {
  costs: any[]
  showActions?: boolean
}

export function JobCostTable({ costs, showActions = true }: JobCostTableProps) {
  const [selectedCostId, setSelectedCostId] = useState<string | null>(null)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [historyLogs, setHistoryLogs] = useState<AuditLogEntry[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)

  const handleViewHistory = async (costId: string) => {
    setSelectedCostId(costId)
    setHistoryOpen(true)
    setIsLoadingHistory(true)

    try {
      const response = await fetch(`/api/audit-logs/record?table=job_cost_entries&record_id=${costId}`)
      if (response.ok) {
        const logs = await response.json()
        setHistoryLogs(logs)
      }
    } catch (error) {
      console.error('Failed to fetch history:', error)
    } finally {
      setIsLoadingHistory(false)
    }
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Cost Type</TableHead>
            <TableHead>Cost Code</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Qty</TableHead>
            <TableHead className="text-right">Unit Cost</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Source</TableHead>
            {showActions && <TableHead>Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {costs.map((cost) => (
            <TableRow key={cost.id}>
              <TableCell>
                {cost.txn_date ? format(new Date(cost.txn_date), 'MMM d, yyyy') : '-'}
              </TableCell>
              <TableCell>{cost.cost_type?.name || '-'}</TableCell>
              <TableCell>
                <span className="font-mono text-sm">
                  {cost.cost_code?.code || '-'}
                </span>
              </TableCell>
              <TableCell className="max-w-xs truncate">
                {cost.description || cost.part?.name || '-'}
              </TableCell>
              <TableCell className="text-right">{cost.qty}</TableCell>
              <TableCell className="text-right">{formatCurrency(cost.unit_cost)}</TableCell>
              <TableCell className="text-right font-bold">{formatCurrency(cost.amount)}</TableCell>
              <TableCell>
                {cost.receipt ? (
                  <Link 
                    href={`/app/receipts/${cost.receipt_id}`}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Receipt: {cost.receipt.vendor_name}
                  </Link>
                ) : (
                  <Badge variant="secondary">Manual</Badge>
                )}
              </TableCell>
              {showActions && (
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewHistory(cost.id)}>
                        <History className="w-4 h-4 mr-2" />
                        View History
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* History Dialog */}
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Cost Entry History</DialogTitle>
          </DialogHeader>
          {isLoadingHistory ? (
            <div className="py-8 text-center text-gray-500">Loading history...</div>
          ) : historyLogs.length > 0 ? (
            <AuditLogTable logs={historyLogs} showTable={false} />
          ) : (
            <div className="py-8 text-center text-gray-500">No history found</div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

