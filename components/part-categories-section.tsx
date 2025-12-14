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
import { PartCategoryDialog } from '@/components/part-category-dialog'
import { PartCategory } from '@/lib/db'
import { Pencil } from 'lucide-react'

interface PartCategoriesSectionProps {
  categories: PartCategory[]
}

export function PartCategoriesSection({ categories }: PartCategoriesSectionProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<PartCategory | undefined>()

  const handleAdd = () => {
    setEditingCategory(undefined)
    setDialogOpen(true)
  }

  const handleEdit = (category: PartCategory) => {
    setEditingCategory(category)
    setDialogOpen(true)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-slate-900">Categories</h2>
        <Button onClick={handleAdd} size="sm">
          Add Category
        </Button>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          No categories yet. Add your first category to get started.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category Name</TableHead>
              <TableHead>Sort Order</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell>{category.sort_order}</TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleEdit(category)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <PartCategoryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        category={editingCategory}
      />
    </div>
  )
}
