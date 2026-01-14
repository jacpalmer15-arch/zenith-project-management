import {
  getDashboardMetrics,
  getRecentQuotes,
  getRecentProjects,
  getCompletedThisWeek,
  getUnscheduledBacklog,
  getTopCustomersByQuotes,
} from '@/lib/data/dashboard'
import { calculateProfitSummary } from '@/lib/reporting/profit-preview'
import { listWorkOrders } from '@/lib/data'
import { WorkStatus } from '@/lib/db'
import { DashboardMetrics } from '@/components/dashboard-metrics'
import { RecentQuotes } from '@/components/recent-quotes'
import { RecentProjects } from '@/components/recent-projects'
import { QuickActions } from '@/components/quick-actions'
import { DashboardProfitCard } from '@/components/dashboard-profit-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, Clock, Users } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth/get-user'

export default async function DashboardPage() {
  const user = await getCurrentUser()
  const isTech = user?.role === 'TECH'

  const activeWorkOrders = isTech
    ? []
    : await listWorkOrders({ status: 'IN_PROGRESS' as WorkStatus })

  const [
    metrics,
    recentProjects,
    completedThisWeek,
    unscheduledBacklog,
  ] = await Promise.all([
    getDashboardMetrics(),
    getRecentProjects(5),
    getCompletedThisWeek(),
    getUnscheduledBacklog(),
  ])

  const recentQuotes = isTech ? [] : await getRecentQuotes(5)

  const profitSummary = isTech
    ? null
    : await calculateProfitSummary(activeWorkOrders.map(wo => wo.id))

  const topCustomers = isTech ? [] : await getTopCustomersByQuotes()

  return (
    <div className="space-y-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Dashboard</h1>

      {/* Enhanced Metrics Section - Stack on mobile, grid on desktop */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* Profit Preview */}
        {!isTech && profitSummary && (
          <DashboardProfitCard
            totalRevenue={profitSummary.totalRevenue}
            totalCosts={profitSummary.totalCosts}
            totalProfit={profitSummary.totalProfit}
            averageMarginPct={profitSummary.averageMarginPct}
          />
        )}

        {/* Completed This Week */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed This Week</CardTitle>
            <div className="p-2 rounded-lg bg-green-50">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedThisWeek}</div>
            <p className="text-xs text-slate-500 mt-1">Work orders completed (last 7 days)</p>
          </CardContent>
        </Card>

        {/* Unscheduled Backlog */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unscheduled Backlog</CardTitle>
            <div className="p-2 rounded-lg bg-orange-50">
              <Clock className="w-4 h-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unscheduledBacklog}</div>
            <p className="text-xs text-slate-500 mt-1">Work orders awaiting schedule</p>
          </CardContent>
        </Card>

        {/* Top Customers */}
        {!isTech && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top Customers (30d)</CardTitle>
              <div className="p-2 rounded-lg bg-blue-50">
                <Users className="w-4 h-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{topCustomers.length}</div>
              <p className="text-xs text-slate-500 mt-1">
                By accepted quote totals
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Top Customers Detail */}
      {!isTech && topCustomers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Customers by Quote Total (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topCustomers.map((customer: any) => (
                <div key={customer.id} className="flex justify-between items-center">
                  <span className="font-medium text-slate-900">{customer.name}</span>
                  <span className="text-slate-600">
                    ${customer.total.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Original Metrics Section */}
      <DashboardMetrics metrics={metrics} />

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {!isTech && <RecentQuotes quotes={recentQuotes} />}
        <RecentProjects projects={recentProjects} />
      </div>

      {/* Quick Actions Section */}
      {!isTech && <QuickActions />}
    </div>
  )
}
