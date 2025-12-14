import { Database } from '@/lib/supabase/types'

// Enum types
export type ProjectStatus = Database['public']['Enums']['project_status']
export type QuoteStatus = Database['public']['Enums']['quote_status']
export type QuoteType = Database['public']['Enums']['quote_type']
export type InventoryTxnType = Database['public']['Enums']['inventory_txn_type']
export type FileEntityType = Database['public']['Enums']['file_entity_type']
export type FileKind = Database['public']['Enums']['file_kind']

// Table types
export type Settings = Database['public']['Tables']['settings']['Row']
export type SettingsInsert = Database['public']['Tables']['settings']['Insert']
export type SettingsUpdate = Database['public']['Tables']['settings']['Update']

export type TaxRule = Database['public']['Tables']['tax_rules']['Row']
export type TaxRuleInsert = Database['public']['Tables']['tax_rules']['Insert']
export type TaxRuleUpdate = Database['public']['Tables']['tax_rules']['Update']

export type Customer = Database['public']['Tables']['customers']['Row']
export type CustomerInsert = Database['public']['Tables']['customers']['Insert']
export type CustomerUpdate = Database['public']['Tables']['customers']['Update']

export type Project = Database['public']['Tables']['projects']['Row']
export type ProjectInsert = Database['public']['Tables']['projects']['Insert']
export type ProjectUpdate = Database['public']['Tables']['projects']['Update']

export type PartCategory = Database['public']['Tables']['part_categories']['Row']
export type PartCategoryInsert = Database['public']['Tables']['part_categories']['Insert']
export type PartCategoryUpdate = Database['public']['Tables']['part_categories']['Update']

export type CostType = Database['public']['Tables']['cost_types']['Row']
export type CostTypeInsert = Database['public']['Tables']['cost_types']['Insert']
export type CostTypeUpdate = Database['public']['Tables']['cost_types']['Update']

export type CostCode = Database['public']['Tables']['cost_codes']['Row']
export type CostCodeInsert = Database['public']['Tables']['cost_codes']['Insert']
export type CostCodeUpdate = Database['public']['Tables']['cost_codes']['Update']

export type Part = Database['public']['Tables']['parts']['Row']
export type PartInsert = Database['public']['Tables']['parts']['Insert']
export type PartUpdate = Database['public']['Tables']['parts']['Update']

export type Quote = Database['public']['Tables']['quotes']['Row']
export type QuoteInsert = Database['public']['Tables']['quotes']['Insert']
export type QuoteUpdate = Database['public']['Tables']['quotes']['Update']

export type QuoteLine = Database['public']['Tables']['quote_lines']['Row']
export type QuoteLineInsert = Database['public']['Tables']['quote_lines']['Insert']
export type QuoteLineUpdate = Database['public']['Tables']['quote_lines']['Update']

export type InventoryLedger = Database['public']['Tables']['inventory_ledger']['Row']
export type InventoryLedgerInsert = Database['public']['Tables']['inventory_ledger']['Insert']

export type File = Database['public']['Tables']['files']['Row']
export type FileInsert = Database['public']['Tables']['files']['Insert']
