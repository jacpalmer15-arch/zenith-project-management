import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, Clock, Package, FileText } from 'lucide-react'

export default function ReportsPage() {
  const reports = [
    {
      title: 'Work Order Profitability',
      description: 'View estimated margins for work orders with accepted quotes',
      icon: BarChart3,
      href: '/app/reports/work-order-profitability',
      color: 'bg-blue-50 text-blue-600',
    },
    {
      title: 'Tech Hours Summary',
      description: 'Track employee hours worked across work orders',
      icon: Clock,
      href: '/app/reports/tech-hours',
      color: 'bg-green-50 text-green-600',
    },
    {
      title: 'Parts Usage & Inventory',
      description: 'View on-hand quantities and parts usage history',
      icon: Package,
      href: '/app/reports/inventory',
      color: 'bg-orange-50 text-orange-600',
    },
    {
      title: 'Quotes Pipeline',
      description: 'Analyze quote status, conversion rates, and pipeline metrics',
      icon: FileText,
      href: '/app/reports/quotes-pipeline',
      color: 'bg-purple-50 text-purple-600',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Reports</h1>
        <p className="text-slate-500 mt-2">
          Access comprehensive reports for work orders, time tracking, inventory, and quotes
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {reports.map((report) => {
          const Icon = report.icon
          return (
            <Link key={report.href} href={report.href}>
              <Card className="hover:border-slate-400 transition-colors cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{report.title}</CardTitle>
                      <CardDescription className="mt-2">{report.description}</CardDescription>
                    </div>
                    <div className={`p-3 rounded-lg ${report.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
