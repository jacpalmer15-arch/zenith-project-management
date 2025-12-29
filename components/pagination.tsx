'use client'

import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'

interface PaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
}

/**
 * Reusable pagination component with URL state
 */
export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
}: PaginationProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', newPage.toString())
    router.push(`?${params.toString()}`)
  }

  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-3 sm:px-6">
      <div className="flex flex-1 justify-between sm:hidden">
        <Button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          variant="outline"
        >
          Previous
        </Button>
        <Button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          variant="outline"
        >
          Next
        </Button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-slate-700">
            Showing <span className="font-medium">{startItem}</span> to{' '}
            <span className="font-medium">{endItem}</span> of{' '}
            <span className="font-medium">{totalItems}</span> results
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            variant="outline"
            size="sm"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number
              if (totalPages <= 5) {
                pageNum = i + 1
              } else if (currentPage <= 3) {
                pageNum = i + 1
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i
              } else {
                pageNum = currentPage - 2 + i
              }

              return (
                <Button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  variant={currentPage === pageNum ? 'default' : 'outline'}
                  size="sm"
                  className="w-8 h-8 p-0"
                >
                  {pageNum}
                </Button>
              )
            })}
          </div>
          <Button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            variant="outline"
            size="sm"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  )
}
