import { listJobCostEntries } from '@/lib/data/cost-entries'
import { formatCurrency } from '@/lib/utils/format-currency'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { CostEntryDialog } from '@/components/cost-entry-dialog'

interface CostEntriesListProps {
  workOrderId: string
}

export async function CostEntriesList({ workOrderId }: CostEntriesListProps) {
  const entries = await listJobCostEntries({ work_order_id: workOrderId })
  
  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-slate-900">Cost Entries</h3>
        <CostEntryDialog workOrderId={workOrderId} />
      </div>
      
      <table className="w-full">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Date</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Description</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Bucket</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Origin</th>
            <th className="px-4 py-3 text-right text-sm font-medium text-slate-700">Qty</th>
            <th className="px-4 py-3 text-right text-sm font-medium text-slate-700">Unit Cost</th>
            <th className="px-4 py-3 text-right text-sm font-medium text-slate-700">Total</th>
          </tr>
        </thead>
        <tbody>
          {entries.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                No cost entries yet
              </td>
            </tr>
          ) : (
            entries.map((entry) => (
              <tr 
                key={entry.id} 
                className="border-b border-slate-100 hover:bg-slate-50"
              >
                <td className="px-4 py-3 text-sm text-slate-900">
                  {format(new Date(entry.occurred_at), 'MMM d, yyyy')}
                </td>
                <td className="px-4 py-3 text-sm text-slate-900">
                  {entry.description}
                </td>
                <td className="px-4 py-3 text-sm">
                  <Badge variant="outline">{entry.bucket}</Badge>
                </td>
                <td className="px-4 py-3 text-sm">
                  <Badge variant="outline">{entry.origin}</Badge>
                </td>
                <td className="px-4 py-3 text-sm text-slate-900 text-right">
                  {entry.qty}
                </td>
                <td className="px-4 py-3 text-sm text-slate-900 text-right">
                  {formatCurrency(entry.unit_cost)}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-slate-900 text-right">
                  {formatCurrency(entry.total_cost)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
