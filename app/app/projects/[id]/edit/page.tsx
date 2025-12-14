import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getProject, listCustomers } from '@/lib/data'
import { ProjectForm } from '@/components/project-form'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

interface EditProjectPageProps {
  params: {
    id: string
  }
}

export default async function EditProjectPage({ params }: EditProjectPageProps) {
  let project
  try {
    project = await getProject(params.id)
  } catch (error) {
    notFound()
  }

  const customers = await listCustomers()

  return (
    <div>
      <div className="mb-6">
        <Link href="/app/projects">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-slate-900">Edit Project</h1>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <ProjectForm project={project} customers={customers} />
      </div>
    </div>
  )
}
