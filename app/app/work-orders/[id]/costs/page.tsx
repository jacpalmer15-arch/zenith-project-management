import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import { 
  getWorkOrder,
  getWorkOrderJobCosts,
  getJobCostSummaryByCostType,
  getJobCostSummaryByCostCode,
  getMaterialUsageByPart
} from '@/lib/data'
import { JobCostTable } from '@/components/reports/job-cost-table'
import { ExportCostsButton } from '@/components/reports/export-costs-button'
import { formatCurrency } from '@/lib/utils/format-currency'

export default async function WorkOrderCostsPage({
  params
}: {
  params: { id: string }
}) {
  let workOrder
  let jobCosts
  let costTypeSummary
  let costCodeSummary
  let materialUsage
  
  try {
    [
      workOrder,
      jobCosts,
      costTypeSummary,
      costCodeSummary,
      materialUsage
    ] = await Promise.all([
      getWorkOrder(params.id),
      getWorkOrderJobCosts(params.id),
      getJobCostSummaryByCostType('work_order', params.id),
      getJobCostSummaryByCostCode('work_order', params.id),
      getMaterialUsageByPart('work_order', params.id)
    ])
  } catch (error) {
    notFound()
  }
  
  if (!workOrder) notFound()
  
  const totalCosts = jobCosts.reduce((sum, cost) => sum + cost.amount, 0)
  const receiptSourcedCosts = jobCosts
    .filter(cost => cost.receipt_id)
    .reduce((sum, cost) => sum + cost.amount, 0)
  
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/app/work-orders/${workOrder.id}`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Work Order
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Job Costs</h1>
            <p className="text-slate-500 mt-1">
              {workOrder.work_order_no} - {workOrder.summary}
            </p>
          </div>
        </div>
        <ExportCostsButton 
          targetType="work_order" 
          targetId={workOrder.id}
          targetName={workOrder.work_order_no}
        />
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-500">Total Job Costs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatCurrency(totalCosts)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-500">From Receipts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatCurrency(receiptSourcedCosts)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-500">Total Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{jobCosts.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-500">Cost Codes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{costCodeSummary.length}</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Cost by Type */}
      {costTypeSummary.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Costs by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {costTypeSummary.map((item) => (
                <div key={item.cost_type} className="flex justify-between items-center">
                  <span className="font-medium">{item.cost_type}</span>
                  <span className="text-lg font-bold">{formatCurrency(item.total)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Cost by Code */}
      {costCodeSummary.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Costs by Code</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {costCodeSummary.map((item) => (
                <div key={item.cost_code} className="flex justify-between items-center py-2 border-b">
                  <div>
                    <span className="font-mono font-medium">{item.cost_code}</span>
                    <span className="text-slate-600 ml-2">{item.cost_code_name}</span>
                  </div>
                  <span className="font-bold">{formatCurrency(item.total)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Material Usage */}
      {materialUsage.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Material Usage by Part</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {materialUsage.map((item: any) => (
                <div key={item.part.id} className="flex justify-between items-center py-2 border-b">
                  <div>
                    <span className="font-medium">{item.part.name}</span>
                    {item.part.sku && (
                      <span className="text-slate-500 text-sm ml-2">({item.part.sku})</span>
                    )}
                    <div className="text-sm text-slate-600">
                      {item.total_qty} {item.part.uom || 'units'}
                    </div>
                  </div>
                  <span className="font-bold">{formatCurrency(item.total_cost)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Detailed Job Cost Entries */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Cost Entries</CardTitle>
        </CardHeader>
        <CardContent>
          {jobCosts.length > 0 ? (
            <JobCostTable costs={jobCosts} />
          ) : (
            <p className="text-slate-500 text-center py-8">
              No job costs recorded yet. Start allocating receipts or add manual entries.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
