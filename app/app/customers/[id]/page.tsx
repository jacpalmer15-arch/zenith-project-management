import { getCustomer, listProjects, listWorkOrders } from '@/lib/data'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Pencil, Mail, Phone, MapPin } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RelatedLinks } from '@/components/related-links'
import { Badge } from '@/components/ui/badge'

export default async function CustomerDetailPage({ params }: { params: { id: string } }) {
  let customer
  
  try {
    customer = await getCustomer(params.id)
  } catch (error) {
    notFound()
  }

  // Fetch related data
  const [projects, workOrders] = await Promise.all([
    listProjects({ customer_id: params.id }).catch(() => []),
    listWorkOrders({ customer_id: params.id }).catch(() => [])
  ])

  const relatedEntities: Array<{
    type: 'customer' | 'project' | 'work_order' | 'quote' | 'location'
    id: string
    label: string
    href: string
    metadata?: string
  }> = []
  
  // Add recent work orders (limit to 3)
  workOrders.slice(0, 3).forEach(wo => {
    if (wo.work_order_no) {
      relatedEntities.push({
        type: 'work_order' as const,
        id: wo.id,
        label: wo.work_order_no,
        href: `/app/work-orders/${wo.id}`,
        metadata: wo.summary || wo.status || undefined
      })
    }
  })
  
  // Add projects (limit to 3)
  projects.slice(0, 3).forEach(p => {
    if (p.name) {
      relatedEntities.push({
        type: 'project' as const,
        id: p.id,
        label: p.name,
        href: `/app/projects/${p.id}`,
        metadata: p.project_no || undefined
      })
    }
  })

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{customer.name}</h1>
          <p className="text-slate-600 mt-1">{customer.customer_no}</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/app/customers/${params.id}/edit`}>
            <Button>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
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

          {/* Address Information */}
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

          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-600">Total Projects</p>
                  <p className="text-2xl font-bold text-slate-900">{projects.length}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Total Work Orders</p>
                  <p className="text-2xl font-bold text-slate-900">{workOrders.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Projects */}
          {projects.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {projects.slice(0, 5).map(project => (
                    <Link
                      key={project.id}
                      href={`/app/projects/${project.id}`}
                      className="flex items-center justify-between p-3 rounded-md border hover:bg-accent transition-colors"
                    >
                      <div>
                        <div className="font-medium">{project.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {project.project_no}
                        </div>
                      </div>
                      <Badge variant="outline">{project.status}</Badge>
                    </Link>
                  ))}
                </div>
                {projects.length > 5 && (
                  <div className="mt-4">
                    <Link href={`/app/projects?customer_id=${params.id}`}>
                      <Button variant="outline" className="w-full">
                        View All Projects ({projects.length})
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Recent Work Orders */}
          {workOrders.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Work Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {workOrders.slice(0, 5).map(wo => (
                    <Link
                      key={wo.id}
                      href={`/app/work-orders/${wo.id}`}
                      className="flex items-center justify-between p-3 rounded-md border hover:bg-accent transition-colors"
                    >
                      <div>
                        <div className="font-medium">{wo.work_order_no}</div>
                        <div className="text-sm text-muted-foreground">
                          {wo.summary || 'No summary'}
                        </div>
                      </div>
                      <Badge variant="outline">{wo.status}</Badge>
                    </Link>
                  ))}
                </div>
                {workOrders.length > 5 && (
                  <div className="mt-4">
                    <Link href={`/app/work-orders?customer_id=${params.id}`}>
                      <Button variant="outline" className="w-full">
                        View All Work Orders ({workOrders.length})
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <RelatedLinks 
            entities={relatedEntities}
            title="Recent Activity"
          />
        </div>
      </div>
    </div>
  )
}
