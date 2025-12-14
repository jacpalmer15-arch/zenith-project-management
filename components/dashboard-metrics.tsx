import Link from 'next/link'
import { Users, FolderOpen, FileText, Package } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface MetricCardProps {
  title: string
  value: number
  icon: React.ElementType
  href: string
  color: 'blue' | 'green' | 'purple' | 'orange'
}

const colorClasses = {
  blue: 'bg-blue-100 text-blue-600',
  green: 'bg-green-100 text-green-600',
  purple: 'bg-purple-100 text-purple-600',
  orange: 'bg-orange-100 text-orange-600',
}

function MetricCard({ title, value, icon: Icon, href, color }: MetricCardProps) {
  return (
    <Link href={href}>
      <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
        <div className="flex items-center gap-4">
          <div className={cn('p-3 rounded-full', colorClasses[color])}>
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className="text-3xl font-bold text-slate-900">{value}</p>
          </div>
        </div>
      </Card>
    </Link>
  )
}

interface DashboardMetricsProps {
  metrics: {
    customers: number
    activeProjects: number
    draftQuotes: number
    activeParts: number
  }
}

export function DashboardMetrics({ metrics }: DashboardMetricsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard
        title="Total Customers"
        value={metrics.customers}
        icon={Users}
        href="/app/customers"
        color="blue"
      />
      <MetricCard
        title="Active Projects"
        value={metrics.activeProjects}
        icon={FolderOpen}
        href="/app/projects?status=Active"
        color="green"
      />
      <MetricCard
        title="Draft Quotes"
        value={metrics.draftQuotes}
        icon={FileText}
        href="/app/quotes?status=Draft"
        color="purple"
      />
      <MetricCard
        title="Total Parts"
        value={metrics.activeParts}
        icon={Package}
        href="/app/parts"
        color="orange"
      />
    </div>
  )
}
