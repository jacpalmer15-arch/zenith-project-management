import { getDashboardMetrics, getRecentQuotes, getRecentProjects } from '@/lib/data'
import { DashboardMetrics } from '@/components/dashboard-metrics'
import { RecentQuotes } from '@/components/recent-quotes'
import { RecentProjects } from '@/components/recent-projects'
import { QuickActions } from '@/components/quick-actions'

export default async function DashboardPage() {
  // Fetch all dashboard data in parallel
  const [metrics, recentQuotes, recentProjects] = await Promise.all([
    getDashboardMetrics(),
    getRecentQuotes(5),
    getRecentProjects(5),
  ])

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
      
      {/* Metrics Section */}
      <DashboardMetrics metrics={metrics} />
      
      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentQuotes quotes={recentQuotes} />
        <RecentProjects projects={recentProjects} />
      </div>
      
      {/* Quick Actions Section */}
      <QuickActions />
    </div>
  )
}
