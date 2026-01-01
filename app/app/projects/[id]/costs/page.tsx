import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { 
  getProject,
  getProjectJobCosts,
  getJobCostSummaryByCostType,
  getJobCostSummaryByCostCode,
  getMaterialUsageByPart,
  listCostTypes,
  listCostCodes
} from '@/lib/data'
import { ExportCostsButton } from '@/components/reports/export-costs-button'
import { ProjectCostsClient } from '@/components/reports/project-costs-client'

interface PageProps {
  params: { id: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function ProjectCostsPage({
  params,
  searchParams
}: PageProps) {
  let project
  let costTypes
  let costCodes
  
  try {
    [project, costTypes, costCodes] = await Promise.all([
      getProject(params.id),
      listCostTypes(),
      listCostCodes()
    ])
  } catch (error) {
    notFound()
  }
  
  if (!project) notFound()

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
      getProjectJobCosts(params.id, filters),
      getJobCostSummaryByCostType('project', params.id),
      getJobCostSummaryByCostCode('project', params.id),
      getMaterialUsageByPart('project', params.id)
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
            <Link href={`/app/projects/${project.id}`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Project
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Job Costs</h1>
            <p className="text-slate-500 mt-1">
              {project.project_no} - {project.name}
            </p>
          </div>
        </div>
        <ExportCostsButton 
          targetType="project" 
          targetId={project.id}
          targetName={project.project_no}
          filters={filters}
        />
      </div>
      
      <div className="space-y-6">
        <ProjectCostsClient
          projectId={params.id}
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
