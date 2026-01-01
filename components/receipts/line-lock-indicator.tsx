'use client'

import { Lock } from 'lucide-react'

interface LineLockIndicatorProps {
  isLocked: boolean
  allocatedAmount?: number
}

export function LineLockIndicator({ isLocked, allocatedAmount }: LineLockIndicatorProps) {
  if (!isLocked) return null
  
  const tooltipText = allocatedAmount !== undefined
    ? `This line has $${allocatedAmount.toFixed(2)} allocated. Remove allocations to edit.`
    : 'This line has allocations. Remove allocations to edit.'
  
  return (
    <span 
      className="inline-flex items-center gap-1 text-slate-400"
      title={tooltipText}
    >
      <Lock className="w-4 h-4" />
    </span>
  )
}
