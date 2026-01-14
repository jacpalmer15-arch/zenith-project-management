import { getCustomer, listProjects, listQuotesByProjectIds, listWorkOrderIdsForTech, listWorkOrders, listAuditLogs } from '@/lib/data'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Mail, Phone, MapPin } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RelatedLinks } from '@/components/related-links'
import { Badge } from '@/components/ui/badge'
import { getCurrentUser } from '@/lib/auth/get-user'
import { hasPermission } from '@/lib/auth/permissions'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ActivityFeed } from '@/components/activity-feed'

export default async function CustomerDetailPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!hasPermission(user?.role, 'view_customers')) {
    redirect('/app/dashboard')
  }

  let customer

  try {
    customer = await getCustomer(params.id)
  } catch (error) {
    notFound()
  }

  const projects = await listProjects({ customer_id: params.id }).catch(() => [])
  const projectIds = projects.map((project) => project.id)
  const quotes = await listQuotesByProjectIds(projectIds).catch(() => [])

  const workOrderIds =
    user?.role === 'TECH' && user.employee?.id
      ? await listWorkOrderIdsForTech(user.employee.id)
      : undefined

  const workOrders = await listWorkOrders({
    customer_id: params.id,
    work_order_ids: workOrderIds,
  }).catch(() => [])

  const canViewAuditLogs = hasPermission(user?.role, 'view_audit_logs')
  const { data: auditLogs } = canViewAuditLogs
    ? await listAuditLogs({
        entity_type: 'customers',
        entity_id: params.id,
        limit: 25,
      }).catch(() => ({ data: [], count: 0 }))
    : { data: [], count: 0 }

  const relatedEntities: Array<{
    type: 'customer' | 'project' | 'work_order' | 'quote' | 'location'
    id: string
    label: string
    href: string
    metadata?: string
  }> = []

  workOrders.slice(0, 3).forEach((wo) => {
    if (wo.work_order_no) {
      relatedEntities.push({
        type: 'work_order' as const,
        id: wo.id,
        label: wo.work_order_no,
        href: `/app/work-orders/${wo.id}`,
        metadata: wo.summary || wo.status || undefined,
      })
    }
  })

  projects.slice(0, 3).forEach((project) => {
    if (project.name) {
      relatedEntities.push({
        type: 'project' as const,
        id: project.id,
        label: project.name,
        href: `/app/projects/${project.id}`,
        metadata: project.project_no || undefined,
      })
    }
  })

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{customer.name}</h1>
          <p className="text-slate-600 mt-1">{customer.customer_no}</p>
        </div>
        {hasPermission(user?.role, 'edit_customers') && (
          <Link href={`/app/customers/${params.id}/edit`}>
            <Button>Edit</Button>
          </Link>
        )}
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="quotes">Quotes</TabsTrigger>
          <TabsTrigger value="work-orders">Work Orders</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {customer.contact_name && (
                    <div>
                      <p className="text-sm text-slate-600">Primary Contact</p>
                      <p className="font-medium text-slate-900">{customer.contact_name}</p>
                    </div>
                  )}
                  {customer.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-slate-600" />
                      <a href={`mailto:${customer.email}`} className="text-blue-600 hover:underline">
                        {customer.email}
                      </a>
                    </div>
                  )}
                  {customer.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-slate-600" />
                      <a href={`tel:${customer.phone}`} className="text-blue-600 hover:underline">
                        {customer.phone}
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>

              {(customer.billing_street || customer.billing_city || customer.billing_state || customer.billing_zip) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Billing Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-slate-700">
                      {customer.billing_street && <p>{customer.billing_street}</p>}
                      {(customer.billing_city || customer.billing_state || customer.billing_zip) && (
                        <p>
                          {customer.billing_city && `${customer.billing_city}, `}
                          {customer.billing_state && `${customer.billing_state} `}
                          {customer.billing_zip}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-slate-600">Total Projects</p>
                      <p className="text-2xl font-bold text-slate-900">{projects.length}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Total Quotes</p>
                      <p className="text-2xl font-bold text-slate-900">{quotes.length}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Total Work Orders</p>
                      <p className="text-2xl font-bold text-slate-900">{workOrders.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <RelatedLinks entities={relatedEntities} title="Recent Activity" />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="projects" className="space-y-4">
          {projects.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
              No projects for this customer yet.
            </div>
          ) : (
            <div className="space-y-3">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/app/projects/${project.id}`}
                  className="flex items-center justify-between rounded-lg border border-slate-200 p-4 hover:bg-accent transition-colors"
                >
                  <div>
                    <div className="font-medium text-slate-900">{project.name}</div>
                    <div className="text-sm text-slate-600">{project.project_no}</div>
                  </div>
                  <Badge variant="outline">{project.status}</Badge>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="quotes" className="space-y-4">
          {quotes.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
              No quotes linked to this customer yet.
            </div>
          ) : (
            <div className="space-y-3">
              {quotes.map((quote) => (
                <Link
                  key={quote.id}
                  href={`/app/quotes/${quote.id}`}
                  className="flex items-center justify-between rounded-lg border border-slate-200 p-4 hover:bg-accent transition-colors"
                >
                  <div>
                    <div className="font-medium text-slate-900">{quote.quote_no}</div>
                    <div className="text-sm text-slate-600">
                      {quote.project?.project_no} · {quote.project?.name}
                    </div>
                  </div>
                  <Badge variant="outline">{quote.status}</Badge>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="work-orders" className="space-y-4">
          {workOrders.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
              No work orders for this customer yet.
            </div>
          ) : (
            <div className="space-y-3">
              {workOrders.map((wo) => (
                <Link
                  key={wo.id}
                  href={`/app/work-orders/${wo.id}`}
                  className="flex items-center justify-between rounded-lg border border-slate-200 p-4 hover:bg-accent transition-colors"
                >
                  <div>
                    <div className="font-medium text-slate-900">{wo.work_order_no}</div>
                    <div className="text-sm text-slate-600">{wo.summary || 'No summary'}</div>
                  </div>
                  <Badge variant="outline">{wo.status}</Badge>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          {canViewAuditLogs ? (
            <ActivityFeed
              entries={auditLogs}
              emptyMessage="No customer activity logged yet."
            />
          ) : (
            <div className="rounded-lg border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
              Activity logs are available to Admin users only.
            </div>
          )}
        </TabsContent>
      </Tabs>

    </div>
  )
}
