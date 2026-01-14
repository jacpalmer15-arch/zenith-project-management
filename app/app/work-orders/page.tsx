import Link from 'next/link'
import { listWorkOrdersWithCount, listWorkOrderIdsForTech, getActiveEmployees } from '@/lib/data'
import { Button } from '@/components/ui/button'
import { ClipboardList } from 'lucide-react'
import { EmptyState } from '@/components/empty-state'
import { getCurrentUser } from '@/lib/auth/get-user'
import { hasPermission } from '@/lib/auth/permissions'
import { redirect } from 'next/navigation'
import { WorkOrderFilters } from '@/components/work-order-filters'
import { WorkOrdersTable } from '@/components/work-orders-table'
import { Pagination } from '@/components/pagination'
import type { WorkStatus } from '@/lib/db'

interface WorkOrdersPageProps {
  searchParams: {
    status?: WorkStatus
    assigned_to?: string
    search?: string
    start_date?: string
    end_date?: string
    page?: string
  }
}

const PAGE_SIZE = 10

export default async function WorkOrdersPage({ searchParams }: WorkOrdersPageProps) {
  const user = await getCurrentUser()
  if (!hasPermission(user?.role, 'view_work_orders')) {
    redirect('/app/dashboard')
  }

  const page = Math.max(parseInt(searchParams.page || '1', 10), 1)
  const offset = (page - 1) * PAGE_SIZE

  const workOrderIds =
    user?.role === 'TECH'
      ? user.employee?.id
        ? await listWorkOrderIdsForTech(user.employee.id)
        : []
      : undefined

  const { data: workOrders, count } = await listWorkOrdersWithCount({
    status: searchParams.status,
    assigned_to: user?.role === 'TECH' ? undefined : searchParams.assigned_to,
    search: searchParams.search,
    start_date: searchParams.start_date,
    end_date: searchParams.end_date,
    work_order_ids: workOrderIds,
    limit: PAGE_SIZE,
    offset,
  })

  const employees = await getActiveEmployees()
  const totalPages = Math.ceil(count / PAGE_SIZE)
  const canEdit = hasPermission(user?.role, 'edit_work_orders')

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            {user?.role === 'TECH' ? 'My Work Orders' : 'Work Orders'}
          </h1>
          <p className="text-slate-600 mt-1">Service work orders and field jobs</p>
        </div>
        {canEdit && (
          <Link href="/app/work-orders/new">
            <Button className="w-full sm:w-auto">New Work Order</Button>
          </Link>
        )}
      </div>

      {user?.role !== 'TECH' && (
        <div className="mb-6">
          <WorkOrderFilters employees={employees} />
        </div>
      )}

      {workOrders.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200">
          <EmptyState
            icon={ClipboardList}
            title="No work orders yet"
            description="Create a work order to schedule service."
            action={
              canEdit
                ? {
                    label: 'New Work Order',
                    href: '/app/work-orders/new',
                  }
                : undefined
            }
          />
        </div>
      ) : (
        <div className="space-y-4">
          <WorkOrdersTable
            workOrders={workOrders}
            employees={employees}
            canBulkEdit={canEdit}
          />
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={count}
            itemsPerPage={PAGE_SIZE}
          />
        </div>
      )}
    </div>
  )
}
