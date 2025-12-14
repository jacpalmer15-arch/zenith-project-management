import { getSettings } from '@/lib/data/settings'
import { listTaxRules } from '@/lib/data/tax-rules'
import { SettingsForm } from '@/components/settings-form'
import { TaxRulesSection } from '@/components/tax-rules-section'

export default async function SettingsPage() {
  const [settings, taxRules] = await Promise.all([
    getSettings(),
    listTaxRules(),
  ])

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 mb-6">Settings</h1>
      
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
