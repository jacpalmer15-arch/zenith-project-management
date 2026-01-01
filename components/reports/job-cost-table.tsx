import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils/format-currency'
import { format } from 'date-fns'
import Link from 'next/link'

interface JobCostTableProps {
  costs: any[]
}

export function JobCostTable({ costs }: JobCostTableProps) {
  return (
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
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
