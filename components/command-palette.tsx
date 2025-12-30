'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command'
import { 
  Users, 
  ClipboardList, 
  FileText, 
  FolderKanban,
  Search
} from 'lucide-react'
import { globalSearch, type SearchResult } from '@/app/actions/search'
import { useDebounce } from '@/hooks/use-debounce'

const TYPE_CONFIG = {
  customer: { icon: Users, label: 'Customer', plural: 'Customers' },
  work_order: { icon: ClipboardList, label: 'Work Order', plural: 'Work Orders' },
  quote: { icon: FileText, label: 'Quote', plural: 'Quotes' },
  project: { icon: FolderKanban, label: 'Project', plural: 'Projects' }
}

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [isMac, setIsMac] = useState(false)
  const router = useRouter()
  
  const debouncedQuery = useDebounce(query, 300)
  
  // Detect platform
  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0)
  }, [])
  
  // Keyboard shortcut (Cmd+K / Ctrl+K)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])
  
  // Search on query change
  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setResults([])
      return
    }
    
    setLoading(true)
    globalSearch(debouncedQuery)
      .then(setResults)
      .finally(() => setLoading(false))
  }, [debouncedQuery])
  
  const handleSelect = useCallback((result: SearchResult) => {
    setOpen(false)
    setQuery('')
    router.push(result.href)
  }, [router])
  
  // Group results by type
  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.type]) acc[result.type] = []
    acc[result.type].push(result)
    return acc
  }, {} as Record<string, SearchResult[]>)
  
  return (
    <>
      {/* Trigger button in app shell */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground border rounded-md hover:bg-accent transition-colors"
      >
        <Search className="h-4 w-4" />
        <span>Search...</span>
        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">{isMac ? '⌘' : 'Ctrl+'}</span>K
        </kbd>
      </button>
      
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput 
          placeholder="Search customers, work orders, quotes..." 
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          {loading && (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Searching...
            </div>
          )}
          
          {!loading && query.length >= 2 && results.length === 0 && (
            <CommandEmpty>No results found.</CommandEmpty>
          )}
          
          {!loading && Object.entries(groupedResults).map(([type, items]) => {
            const config = TYPE_CONFIG[type as keyof typeof TYPE_CONFIG]
            
            return (
              <CommandGroup key={type} heading={config.plural}>
                {items.map((result) => (
                  <CommandItem
                    key={result.id}
                    value={result.title}
                    onSelect={() => handleSelect(result)}
                  >
                    <config.icon className="mr-2 h-4 w-4" />
                    <div className="flex-1">
                      <div>{result.title}</div>
                      {result.subtitle && (
                        <div className="text-xs text-muted-foreground">
                          {result.subtitle}
                        </div>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )
          })}
        </CommandList>
      </CommandDialog>
    </>
  )
}
