import { getProject, listQuotes } from '@/lib/data'
import { notFound, redirect } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MapPin } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { getCurrentUser } from '@/lib/auth/get-user'
import { hasPermission } from '@/lib/auth/permissions'

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!hasPermission(user?.role, 'view_projects')) {
    redirect('/app/dashboard')
  }

  let project
  try {
    project = await getProject(params.id)
  } catch (error) {
    notFound()
  }

  const quotes = await listQuotes({ project_id: params.id }).catch(() => [])

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{project.name}</h1>
          <p className="text-slate-600 mt-1">{project.project_no}</p>
        </div>
        {hasPermission(user?.role, 'edit_projects') && (
          <Link href={`/app/projects/${params.id}/edit`}>
            <Button>Edit Project</Button>
          </Link>
        )}
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="work-orders">Work Orders</TabsTrigger>
          <TabsTrigger value="notes-files">Notes &amp; Files</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Project Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{project.status}</Badge>
                  </div>
                  <div className="space-y-1 text-sm text-slate-600">
                    <p>Customer: {project.customer?.name}</p>
                    {project.customer?.customer_no && (
                      <p>Customer #: {project.customer.customer_no}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {(project.job_street || project.job_city || project.job_state || project.job_zip) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Job Site
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-slate-700">
                    {project.job_street && <p>{project.job_street}</p>}
                    {(project.job_city || project.job_state || project.job_zip) && (
                      <p>
                        {project.job_city && `${project.job_city}, `}
                        {project.job_state && `${project.job_state} `}
                        {project.job_zip}
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Quotes</CardTitle>
                </CardHeader>
                <CardContent>
                  {quotes.length === 0 ? (
                    <p className="text-sm text-slate-500">No quotes for this project yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {quotes.map((quote) => (
                        <Link
                          key={quote.id}
                          href={`/app/quotes/${quote.id}`}
                          className="flex items-center justify-between rounded-md border border-slate-200 p-3 hover:bg-accent transition-colors"
                        >
                          <div>
                            <p className="font-medium text-slate-900">{quote.quote_no}</p>
                            <p className="text-sm text-slate-600">{quote.quote_type}</p>
                          </div>
                          <Badge variant="outline">{quote.status}</Badge>
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Key Dates</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-slate-600 space-y-2">
                  <p>Created: {new Date(project.created_at).toLocaleDateString()}</p>
                  <p>Updated: {new Date(project.updated_at).toLocaleDateString()}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="work-orders">
          {/* TODO(schema): add project_id to work_orders or allow quotes to link work orders so we can list them here. */}
          <div className="rounded-lg border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
            Work orders are not yet linked to projects in the current schema.
          </div>
        </TabsContent>

        <TabsContent value="notes-files">
          {/* TODO(schema): add project_notes table for structured notes. */}
          <div className="rounded-lg border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
            Notes and files for projects are not yet available.
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
