'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { CostCodeDialog } from '@/components/cost-code-dialog'
import { CostType } from '@/lib/db'
import { CostCodeWithRelations } from '@/lib/data/cost-codes'
import { Pencil } from 'lucide-react'

interface CostCodesSectionProps {
  costCodes: CostCodeWithRelations[]
  costTypes: CostType[]
  selectedCostTypeId?: string
}

export function CostCodesSection({ 
  costCodes, 
  costTypes, 
  selectedCostTypeId 
}: CostCodesSectionProps) {
  const router = useRouter()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCostCode, setEditingCostCode] = useState<CostCodeWithRelations | undefined>()

  const handleAdd = () => {
    setEditingCostCode(undefined)
    setDialogOpen(true)
  }

  const handleEdit = (costCode: CostCodeWithRelations) => {
    setEditingCostCode(costCode)
    setDialogOpen(true)
  }

  const handleCostTypeFilter = (value: string) => {
    if (value === 'all') {
      router.push('/app/parts/cost-codes')
    } else {
      router.push(`/app/parts/cost-codes?cost_type_id=${value}`)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-slate-900">Cost Codes</h2>
        <Button onClick={handleAdd} size="sm">
          Add Cost Code
        </Button>
      </div>

      {/* Cost Type Filter */}
      {costTypes.length > 0 && (
        <div className="mb-4">
          <Label htmlFor="cost-type-filter">Filter by Cost Type</Label>
          <Select 
            value={selectedCostTypeId || 'all'} 
            onValueChange={handleCostTypeFilter}
          >
            <SelectTrigger id="cost-type-filter" className="w-64">
              <SelectValue placeholder="All Cost Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cost Types</SelectItem>
              {costTypes.map((costType) => (
                <SelectItem key={costType.id} value={costType.id}>
                  {costType.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {costCodes.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          {selectedCostTypeId 
            ? 'No cost codes found for this cost type.'
            : 'No cost codes yet. Add your first cost code to get started.'}
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cost Code</TableHead>
              <TableHead>Cost Code Name</TableHead>
              <TableHead>Cost Type</TableHead>
              <TableHead>Sort Order</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {costCodes.map((costCode) => (
              <TableRow key={costCode.id}>
                <TableCell className="font-medium">{costCode.code}</TableCell>
                <TableCell>{costCode.name}</TableCell>
                <TableCell>
                  {costCode.cost_type?.name || '-'}
                </TableCell>
                <TableCell>{costCode.sort_order}</TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleEdit(costCode)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <CostCodeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        costCode={editingCostCode}
        costTypes={costTypes}
      />
    </div>
  )
}
