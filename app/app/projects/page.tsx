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
import { Pencil } from 'lucide-react'
import { Project, ProjectStatus } from '@/lib/db'

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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Projects</h1>
        <Link href="/app/projects/new">
          <Button>Add Project</Button>
        </Link>
      </div>

      <div className="mb-6">
        <ProjectFilters customers={customers} />
      </div>

      {projects.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
          <p className="text-slate-500">
            {searchParams.search || searchParams.customer_id || searchParams.status
              ? 'No projects found matching your filters.'
              : 'No projects yet. Add your first project to get started.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
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
                        <Button variant="ghost" size="icon">
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
      )}
    </div>
  )
}
