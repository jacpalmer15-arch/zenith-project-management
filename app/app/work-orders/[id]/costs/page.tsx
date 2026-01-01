import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { 
  getWorkOrder,
  getWorkOrderJobCosts,
  getJobCostSummaryByCostType,
  getJobCostSummaryByCostCode,
  getMaterialUsageByPart,
  listCostTypes,
  listCostCodes
} from '@/lib/data'
import { ExportCostsButton } from '@/components/reports/export-costs-button'
import { WorkOrderCostsClient } from '@/components/reports/work-order-costs-client'

interface PageProps {
  params: { id: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function WorkOrderCostsPage({
  params,
  searchParams
}: PageProps) {
  let workOrder
  let costTypes
  let costCodes
  
  try {
    [workOrder, costTypes, costCodes] = await Promise.all([
      getWorkOrder(params.id),
      listCostTypes(),
      listCostCodes()
    ])
  } catch (error) {
    notFound()
  }
  
  if (!workOrder) notFound()

  // Parse filters from searchParams
  const filters = {
    start_date: typeof searchParams.start_date === 'string' ? searchParams.start_date : undefined,
    end_date: typeof searchParams.end_date === 'string' ? searchParams.end_date : undefined,
    cost_type_ids: typeof searchParams.cost_type_ids === 'string' 
      ? searchParams.cost_type_ids.split(',').filter(Boolean)
      : undefined,
    cost_code_ids: typeof searchParams.cost_code_ids === 'string'
      ? searchParams.cost_code_ids.split(',').filter(Boolean)
      : undefined,
    source_type: typeof searchParams.source === 'string'
      ? (searchParams.source as 'receipt' | 'manual' | 'qb_synced')
      : undefined,
  }

  // Fetch data with filters
  let jobCosts: any[] = []
  let costTypeSummary: any[] = []
  let costCodeSummary: any[] = []
  let materialUsage: any[] = []

  try {
    [jobCosts, costTypeSummary, costCodeSummary, materialUsage] = await Promise.all([
      getWorkOrderJobCosts(params.id, filters),
      getJobCostSummaryByCostType('work_order', params.id),
      getJobCostSummaryByCostCode('work_order', params.id),
      getMaterialUsageByPart('work_order', params.id)
    ])
  } catch (error) {
    console.error('Error fetching job costs:', error)
    jobCosts = []
    costTypeSummary = []
    costCodeSummary = []
    materialUsage = []
  }
  
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
      
      <div className="space-y-6">
        <WorkOrderCostsClient
          workOrderId={params.id}
          costTypes={costTypes}
          costCodes={costCodes}
          onFiltersChange={() => {}}
          jobCosts={jobCosts}
          costTypeSummary={costTypeSummary}
          costCodeSummary={costCodeSummary}
          materialUsage={materialUsage}
        />
      </div>
    </div>
  )
}
