'use client'

import { useState } from 'react'
import { Receipt } from '@/lib/db'
import { ReceiptWithAge } from '@/lib/data/receipts'
import { formatCurrency } from '@/lib/utils/format-currency'
import { format } from 'date-fns'
import { BulkAllocationToolbar } from '@/components/bulk-allocation-toolbar'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Clock, AlertTriangle } from 'lucide-react'

interface ReceiptListProps {
  receipts: Receipt[]
  showAge?: boolean
  showDuplicateWarning?: boolean
  agedReceipts?: ReceiptWithAge[]
}

export function ReceiptList({ 
  receipts, 
  showAge = false, 
  showDuplicateWarning = false,
  agedReceipts = []
}: ReceiptListProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  
  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(x => x !== id)
        : [...prev, id]
    )
  }
  
  const toggleAll = () => {
    if (selectedIds.length === receipts.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(receipts.map(r => r.id))
    }
  }
  
  const getAge = (receipt: Receipt): number | undefined => {
    if (!showAge) return undefined
    const aged = agedReceipts.find(a => a.id === receipt.id)
    return aged?.age_days
  }
  
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-left">
                <Checkbox
                  checked={selectedIds.length === receipts.length && receipts.length > 0}
                  onCheckedChange={toggleAll}
                />
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Date</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Vendor</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Amount</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Status</th>
            </tr>
          </thead>
          <tbody>
            {receipts.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  No unallocated receipts
                </td>
              </tr>
            ) : (
              receipts.map((receipt) => {
                const age = getAge(receipt)
                const isAged = age && age > 7
                
                return (
                  <tr 
                    key={receipt.id} 
                    className="border-b border-slate-100 hover:bg-slate-50"
                  >
                    <td className="px-4 py-3">
                      <Checkbox
                        checked={selectedIds.includes(receipt.id)}
                        onCheckedChange={() => toggleSelection(receipt.id)}
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-900">
                      {receipt.receipt_date ? format(new Date(receipt.receipt_date), 'MMM d, yyyy') : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-900">
                      {receipt.vendor_name}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-900">
                      {formatCurrency(receipt.total_amount)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {isAged && (
                          <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                            <Clock className="h-3 w-3 mr-1" />
                            {age} days
                          </Badge>
                        )}
                        {!isAged && (
                          <Badge variant="outline">Unallocated</Badge>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
      
      {/* Bulk allocation toolbar */}
      <BulkAllocationToolbar 
        selectedIds={selectedIds} 
        onClearSelection={() => setSelectedIds([])}
      />
    </div>
  )
}
