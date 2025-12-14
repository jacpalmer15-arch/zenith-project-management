import Link from 'next/link'
import { Plus, Briefcase } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/status-badge'
import { formatRelativeTime } from '@/lib/utils/format-date'
import type { ProjectStatus } from '@/lib/db'

interface RecentProject {
  id: string
  project_no: string
  name: string
  status: ProjectStatus
  updated_at: string
  customer: {
    id: string
    name: string
  } | null
}

interface RecentProjectsProps {
  projects: RecentProject[]
}

export function RecentProjects({ projects }: RecentProjectsProps) {
  if (projects.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 mb-4">
              No projects yet. Create your first project to get started.
            </p>
            <Link href="/app/projects/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Project
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Projects</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-slate-900">{project.project_no}</p>
                  <StatusBadge status={project.status} />
                </div>
                <p className="text-sm text-slate-600 truncate">{project.name}</p>
                <p className="text-xs text-slate-500">
                  {project.customer?.name || 'N/A'}
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  Updated {formatRelativeTime(project.updated_at)}
                </p>
              </div>
              <Link href={`/app/projects/${project.id}`}>
                <Button variant="outline" size="sm">
                  View
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
