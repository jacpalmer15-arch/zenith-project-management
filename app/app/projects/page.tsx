import Link from 'next/link'
import { listProjects, listCustomers } from '@/lib/data'
import { ProjectFilters } from '@/components/project-filters'
import { StatusBadge } from '@/components/status-badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Pencil, Briefcase } from 'lucide-react'
import { Project, ProjectStatus } from '@/lib/db'
import { EmptyState } from '@/components/empty-state'

interface ProjectsPageProps {
  searchParams: {
    search?: string
    customer_id?: string
    status?: string
  }
}

type ProjectWithCustomer = Project & {
  customer?: {
    id: string
    customer_no: string
    name: string
    contact_name: string | null
  } | null
}

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const projects = await listProjects({
    search: searchParams.search,
    customer_id: searchParams.customer_id,
    status: searchParams.status as ProjectStatus | undefined,
  })
  
  const customers = await listCustomers()

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Projects</h1>
        <Link href="/app/projects/new">
          <Button className="w-full sm:w-auto">Add Project</Button>
        </Link>
      </div>

      <div className="mb-6">
        <ProjectFilters customers={customers} />
      </div>

      {projects.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200">
          {searchParams.search || searchParams.customer_id || searchParams.status ? (
            <div className="p-8 text-center">
              <p className="text-slate-500">
                No projects found matching your filters.
              </p>
            </div>
          ) : (
            <EmptyState
              icon={Briefcase}
              title="No projects yet"
              description="Create a project to start quoting."
              action={{
                label: 'Add Project',
                href: '/app/projects/new',
              }}
            />
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          {/* Desktop view - table */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project #</TableHead>
                  <TableHead>Project Name</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Job Location</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(projects as ProjectWithCustomer[]).map((project) => {
                  const jobLocation = [project.job_city, project.job_state]
                    .filter(Boolean)
                    .join(', ') || '-'
                  
                  return (
                    <TableRow key={project.id}>
                      <TableCell className="font-medium">{project.project_no}</TableCell>
                      <TableCell>{project.name}</TableCell>
                      <TableCell>
                        {project.customer?.name || '-'}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={project.status} />
                      </TableCell>
                      <TableCell>{jobLocation}</TableCell>
                      <TableCell>
                        <Link href={`/app/projects/${project.id}/edit`}>
                          <Button variant="ghost" size="icon" aria-label="Edit project">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          {/* Mobile view - cards */}
          <div className="md:hidden divide-y divide-slate-200">
            {(projects as ProjectWithCustomer[]).map((project) => {
              const jobLocation = [project.job_city, project.job_state]
                .filter(Boolean)
                .join(', ') || '-'
              
              return (
                <div key={project.id} className="p-4 space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 truncate">{project.name}</p>
                      <p className="text-sm text-slate-500">{project.project_no}</p>
                    </div>
                    <Link href={`/app/projects/${project.id}/edit`}>
                      <Button variant="ghost" size="icon" aria-label="Edit project" className="min-h-[44px] min-w-[44px]">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <StatusBadge status={project.status} />
                  </div>
                  {project.customer?.name && (
                    <p className="text-sm text-slate-600">{project.customer.name}</p>
                  )}
                  {jobLocation !== '-' && (
                    <p className="text-sm text-slate-500">{jobLocation}</p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
