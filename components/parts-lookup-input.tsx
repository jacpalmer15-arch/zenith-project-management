import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import { createPortal } from 'react-dom'
import type { Part } from '@/lib/db'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

type PartsLookupVariant = 'sku' | 'description'

interface PartsLookupInputProps {
  parts: Part[]
  value: string
  onChange: (value: string) => void
  onSelectPart: (part: Part) => void
  placeholder?: string
  className?: string
  variant: PartsLookupVariant
  disabled?: boolean
  onBlur?: () => void
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void
}

export function PartsLookupInput({
  parts,
  value,
  onChange,
  onSelectPart,
  placeholder,
  className,
  variant,
  disabled = false,
  onBlur,
  onKeyDown,
}: PartsLookupInputProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [query, setQuery] = useState(value ?? '')
  const [isOpen, setIsOpen] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 })
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const justSelectedRef = useRef(false)
  const blurTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    setQuery(value ?? '')
  }, [value])

  useEffect(() => {
    const updatePosition = () => {
      if (inputRef.current) {
        const rect = inputRef.current.getBoundingClientRect()
        setDropdownPosition({
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
        })
      }
    }

    if (isOpen) {
      updatePosition()
      window.addEventListener('scroll', updatePosition, true)
      window.addEventListener('resize', updatePosition)
      return () => {
        window.removeEventListener('scroll', updatePosition, true)
        window.removeEventListener('resize', updatePosition)
      }
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current) return
      if (!containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const filteredParts = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) {
      return parts.slice(0, 25)
    }

    return parts
      .filter((part) => {
        const haystack = [
          part.sku,
          part.name,
          part.description_default,
          part.category_id,
        ]
          .filter(Boolean)
          .map((value) => value!.toLowerCase())

        return haystack.some((value) => value.includes(term))
      })
      .slice(0, 25)
  }, [parts, query])

  const getDisplayValue = (part: Part) => {
    if (variant === 'sku') {
      return part.sku ?? ''
    }
    return part.description_default || part.name || ''
  }

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value
    setQuery(nextValue)
    onChange(nextValue)
    setIsOpen(true)
    setSelectedIndex(-1)
  }

  const handleSelect = (part: Part) => {
    // Cancel any pending blur handler
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current)
      blurTimeoutRef.current = null
    }
    justSelectedRef.current = true
    setIsOpen(false)
    setSelectedIndex(-1)
    
    // First apply all part data to the line
    onSelectPart(part)
    
    // Then update the display value in this field after setValue calls complete
    setTimeout(() => {
      const displayValue = getDisplayValue(part)
      setQuery(displayValue)
      onChange(displayValue)
      justSelectedRef.current = false
    }, 0)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || filteredParts.length === 0) {
      onKeyDown?.(event)
      return
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        setSelectedIndex(prev => 
          prev < filteredParts.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        event.preventDefault()
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1))
        break
      case 'Enter':
        if (selectedIndex >= 0 && selectedIndex < filteredParts.length) {
          event.preventDefault()
          handleSelect(filteredParts[selectedIndex])
        } else {
          onKeyDown?.(event)
        }
        break
      case 'Escape':
        event.preventDefault()
        setIsOpen(false)
        setSelectedIndex(-1)
        break
      default:
        onKeyDown?.(event)
    }
  }

  const dropdownContent = isOpen && filteredParts.length > 0 && (
    <div
      style={{
        position: 'fixed',
        top: `${dropdownPosition.top}px`,
        left: `${dropdownPosition.left}px`,
        width: `${dropdownPosition.width}px`,
        zIndex: 9999,
      }}
      className="mt-1 max-h-72 overflow-auto rounded-md border border-slate-200 bg-white shadow-lg"
    >
      <ul className="divide-y divide-slate-100">
        {filteredParts.map((part, index) => (
          <li key={part.id}>
            <button
              type="button"
              className={cn(
                "w-full text-left px-3 py-2 hover:bg-slate-100 focus:outline-none",
                selectedIndex === index && "bg-blue-50 hover:bg-blue-100"
              )}
              onMouseEnter={() => setSelectedIndex(index)}
              onMouseDown={(event) => {
                event.preventDefault()
                event.stopPropagation()
                handleSelect(part)
              }}
            >
              <div className="text-sm font-medium text-slate-900">
                {variant === 'sku' ? part.sku || 'No SKU' : part.description_default || part.name}
              </div>
              <div className="text-xs text-slate-600">
                {part.name}
                {part.sku ? ` • ${part.sku}` : ''}
              </div>
              {part.description_default && variant === 'sku' && (
                <div className="text-xs text-slate-500 truncate">
                  {part.description_default}
                </div>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <Input
        ref={inputRef}
        value={query}
        onChange={handleInputChange}
        onFocus={() => {
          setIsOpen(true)
          setSelectedIndex(-1)
        }}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
        onKeyDown={handleKeyDown}
        onBlur={() => {
          blurTimeoutRef.current = setTimeout(() => {
            setIsOpen(false)
            setSelectedIndex(-1)
            if (!justSelectedRef.current) {
              onBlur?.()
            }
            justSelectedRef.current = false
            blurTimeoutRef.current = null
          }, 200)
        }}
      />

      {typeof window !== 'undefined' && createPortal(dropdownContent, document.body)}
    </div>
  )
}
