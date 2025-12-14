'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Search } from 'lucide-react'
import type { Part } from '@/lib/db'

interface PartsSelectorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (part: Part) => void
  parts: Part[]
}

export function PartsSelectorDialog({
  open,
  onOpenChange,
  onSelect,
  parts,
}: PartsSelectorDialogProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredParts, setFilteredParts] = useState(parts)

  useEffect(() => {
    if (!searchTerm) {
      setFilteredParts(parts)
      return
    }

    const term = searchTerm.toLowerCase()
    const filtered = parts.filter(
      (part) =>
        part.name.toLowerCase().includes(term) ||
        part.sku?.toLowerCase().includes(term) ||
        (part.description_default?.toLowerCase().includes(term) || false)
    )
    setFilteredParts(filtered)
  }, [searchTerm, parts])

  const handleSelect = (part: Part) => {
    onSelect(part)
    onOpenChange(false)
    setSearchTerm('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Select Part</DialogTitle>
          <DialogDescription>
            Search and select a part to add to the quote
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Search by name, SKU, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex-1 overflow-auto border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>UOM</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredParts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-slate-500">
                      No parts found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredParts.map((part) => (
                    <TableRow key={part.id}>
                      <TableCell className="font-medium">{part.sku}</TableCell>
                      <TableCell>{part.name}</TableCell>
                      <TableCell>{part.uom}</TableCell>
                      <TableCell className="text-right">
                        ${part.sell_price.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => handleSelect(part)}
                        >
                          Select
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
