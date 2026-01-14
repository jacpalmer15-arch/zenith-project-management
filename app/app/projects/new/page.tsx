import Link from 'next/link'
import { listCustomers } from '@/lib/data'
import { ProjectForm } from '@/components/project-form'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth/get-user'
import { hasPermission } from '@/lib/auth/permissions'
import { redirect } from 'next/navigation'

export default async function NewProjectPage() {
  const user = await getCurrentUser()
  if (!hasPermission(user?.role, 'edit_projects')) {
    redirect('/app/dashboard')
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
        <h1 className="text-3xl font-bold text-slate-900">Add Project</h1>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <ProjectForm customers={customers} />
      </div>
    </div>
  )
}
