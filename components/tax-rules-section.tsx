'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { TaxRuleDialog } from '@/components/tax-rule-dialog'
import { TaxRule } from '@/lib/db'
import { Pencil } from 'lucide-react'

interface TaxRulesSectionProps {
  taxRules: TaxRule[]
}

export function TaxRulesSection({ taxRules }: TaxRulesSectionProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTaxRule, setEditingTaxRule] = useState<TaxRule | undefined>()

  const handleAdd = () => {
    setEditingTaxRule(undefined)
    setDialogOpen(true)
  }

  const handleEdit = (taxRule: TaxRule) => {
    setEditingTaxRule(taxRule)
    setDialogOpen(true)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-slate-900">Tax Rules</h2>
        <Button onClick={handleAdd} size="sm">
          Add Tax Rule
        </Button>
      </div>

      {taxRules.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          No tax rules configured. Add your first tax rule to get started.
        </div>
      ) : (
        <div className="space-y-2">
          {taxRules.map((taxRule) => (
            <div
              key={taxRule.id}
              className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-medium text-slate-900">{taxRule.name}</h3>
                  {!taxRule.is_active && (
                    <span className="px-2 py-0.5 text-xs font-medium text-slate-600 bg-slate-200 rounded">
                      Inactive
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-600 mt-1">
                  Rate: {(taxRule.rate * 100).toFixed(2)}%
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEdit(taxRule)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <TaxRuleDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        taxRule={editingTaxRule}
      />
    </div>
  )
}
