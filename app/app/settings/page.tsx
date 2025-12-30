import { getSettings } from '@/lib/data/settings'
import { listTaxRules } from '@/lib/data/tax-rules'
import { getQbConnection } from '@/lib/data/qb-connections'
import { SettingsForm } from '@/components/settings-form'
import { TaxRulesSection } from '@/components/tax-rules-section'
import { QuickBooksConnectionCard } from '@/components/quickbooks-connection-card'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/serverClient'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { User, Clock } from 'lucide-react'
import { format } from 'date-fns'

export default async function SettingsPage() {
  const supabase = await createClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  
  const [settings, taxRules, qbConnection] = await Promise.all([
    getSettings(),
    listTaxRules(),
    getQbConnection(),
  ])

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 mb-6">Settings</h1>

      {/* User Directory Placeholder */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                User Directory
              </CardTitle>
              <CardDescription>Current authenticated user</CardDescription>
            </div>
            <Link href="/app/settings/audit-log">
              <Button variant="outline" size="sm">
                <Clock className="w-4 h-4 mr-2" />
                View Audit Log
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                <span className="text-lg font-medium text-slate-700">
                  {user?.email?.[0].toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-medium text-slate-900">{user?.email}</p>
                <p className="text-sm text-slate-500">
                  Last sign in: {user?.last_sign_in_at ? format(new Date(user.last_sign_in_at), 'PPp') : 'N/A'}
                </p>
              </div>
            </div>
            <div className="text-sm text-slate-500 border-t pt-3">
              <p className="italic">User management coming soon</p>
              <p className="mt-1">
                Full user directory and role management will be available in a future update.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* QuickBooks Connection Card */}
      <div className="mb-6">
        <QuickBooksConnectionCard connection={qbConnection} />
      </div>
      
      {/* Main Settings Form */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
        <SettingsForm settings={settings} taxRules={taxRules} />
      </div>

      {/* Tax Rules Section */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <TaxRulesSection taxRules={taxRules} />
      </div>
    </div>
  )
}
