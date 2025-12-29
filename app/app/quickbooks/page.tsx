import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Lock, AlertCircle } from 'lucide-react'

export default function QuickBooksPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">QuickBooks Integration</h1>
        <p className="text-slate-500 mt-2">
          Connect your QuickBooks Desktop account to sync customers, invoices, and bills
        </p>
      </div>

      {/* Connection Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-slate-100">
              <Lock className="w-6 h-6 text-slate-600" />
            </div>
            <div>
              <CardTitle>QuickBooks Desktop Integration</CardTitle>
              <CardDescription>Status: Not Connected</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-slate-600">
            Connect your QuickBooks Desktop account to automatically sync:
          </p>
          <ul className="list-disc list-inside space-y-2 text-slate-600 ml-4">
            <li>Customer and sub-customer records</li>
            <li>Invoices and payments</li>
            <li>Bills and vendor credits</li>
            <li>Time activities</li>
            <li>Items and services</li>
          </ul>
          <div className="pt-4">
            <Button disabled className="relative">
              <Lock className="w-4 h-4 mr-2" />
              Connect QuickBooks
              <span className="ml-2 text-xs opacity-75">(Coming Soon)</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Benefits Card */}
      <Card>
        <CardHeader>
          <CardTitle>Benefits of QuickBooks Integration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="font-medium text-slate-900 mb-2">Automated Sync</h3>
              <p className="text-sm text-slate-600">
                Automatically sync data between Zenith and QuickBooks, eliminating manual entry
              </p>
            </div>
            <div>
              <h3 className="font-medium text-slate-900 mb-2">Accurate Costing</h3>
              <p className="text-sm text-slate-600">
                Compare estimated costs from Zenith with actual costs from QuickBooks
              </p>
            </div>
            <div>
              <h3 className="font-medium text-slate-900 mb-2">Invoice Creation</h3>
              <p className="text-sm text-slate-600">
                Create QuickBooks invoices directly from accepted quotes and work orders
              </p>
            </div>
            <div>
              <h3 className="font-medium text-slate-900 mb-2">Financial Reporting</h3>
              <p className="text-sm text-slate-600">
                Access comprehensive financial reports combining field and accounting data
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Placeholder Report Card */}
      <Card className="border-dashed border-2 border-slate-300">
        <CardHeader>
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-slate-400" />
            <div>
              <CardTitle className="text-slate-600">Actual vs Estimated (QuickBooks Required)</CardTitle>
              <CardDescription>Compare estimated and actual costs for work orders</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-500">
            <Lock className="w-12 h-12 mx-auto mb-3 text-slate-400" />
            <p className="font-medium">Connect QuickBooks to unlock this feature</p>
            <p className="text-sm mt-1">
              View actual costs from QuickBooks alongside your Zenith estimates
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
