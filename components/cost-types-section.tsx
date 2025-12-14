'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { CostTypeDialog } from '@/components/cost-type-dialog'
import { CostType } from '@/lib/db'
import { Pencil } from 'lucide-react'

interface CostTypesSectionProps {
  costTypes: CostType[]
}

export function CostTypesSection({ costTypes }: CostTypesSectionProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCostType, setEditingCostType] = useState<CostType | undefined>()

  const handleAdd = () => {
    setEditingCostType(undefined)
    setDialogOpen(true)
  }

  const handleEdit = (costType: CostType) => {
    setEditingCostType(costType)
    setDialogOpen(true)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-slate-900">Cost Types</h2>
        <Button onClick={handleAdd} size="sm">
          Add Cost Type
        </Button>
      </div>

      {costTypes.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          No cost types yet. Add your first cost type to get started.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cost Type Name</TableHead>
              <TableHead>Sort Order</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {costTypes.map((costType) => (
              <TableRow key={costType.id}>
                <TableCell className="font-medium">{costType.name}</TableCell>
                <TableCell>{costType.sort_order}</TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleEdit(costType)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <CostTypeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        costType={editingCostType}
      />
    </div>
  )
}
