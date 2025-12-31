import { Database } from '@/lib/supabase/types'

// Enum types
export type ProjectStatus = Database['public']['Enums']['project_status']
export type QuoteStatus = Database['public']['Enums']['quote_status']
export type QuoteType = Database['public']['Enums']['quote_type']
export type InventoryTxnType = Database['public']['Enums']['inventory_txn_type']
export type FileEntityType = Database['public']['Enums']['file_entity_type']
export type FileKind = Database['public']['Enums']['file_kind']
export type WorkStatus = Database['public']['Enums']['work_status']

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

export type Employee = Database['public']['Tables']['employees']['Row']
export type EmployeeInsert = Database['public']['Tables']['employees']['Insert']
export type EmployeeUpdate = Database['public']['Tables']['employees']['Update']

export type Location = Database['public']['Tables']['locations']['Row']
export type LocationInsert = Database['public']['Tables']['locations']['Insert']
export type LocationUpdate = Database['public']['Tables']['locations']['Update']

export type Project = Database['public']['Tables']['projects']['Row']
export type ProjectInsert = Database['public']['Tables']['projects']['Insert']
export type ProjectUpdate = Database['public']['Tables']['projects']['Update']

export type WorkOrder = Database['public']['Tables']['work_orders']['Row']
export type WorkOrderInsert = Database['public']['Tables']['work_orders']['Insert']
export type WorkOrderUpdate = Database['public']['Tables']['work_orders']['Update']

export type WorkOrderSchedule = Database['public']['Tables']['work_order_schedule']['Row']
export type WorkOrderScheduleInsert = Database['public']['Tables']['work_order_schedule']['Insert']
export type WorkOrderScheduleUpdate = Database['public']['Tables']['work_order_schedule']['Update']

export type WorkOrderTimeEntry = Database['public']['Tables']['work_order_time_entries']['Row']
export type WorkOrderTimeEntryInsert = Database['public']['Tables']['work_order_time_entries']['Insert']
export type WorkOrderTimeEntryUpdate = Database['public']['Tables']['work_order_time_entries']['Update']

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

export type Receipt = Database['public']['Tables']['receipts']['Row']
export type ReceiptInsert = Database['public']['Tables']['receipts']['Insert']
export type ReceiptUpdate = Database['public']['Tables']['receipts']['Update']

export type JobCostEntry = Database['public']['Tables']['job_cost_entries']['Row']
export type JobCostEntryInsert = Database['public']['Tables']['job_cost_entries']['Insert']
export type JobCostEntryUpdate = Database['public']['Tables']['job_cost_entries']['Update']

export type Equipment = Database['public']['Tables']['equipment']['Row']
export type EquipmentInsert = Database['public']['Tables']['equipment']['Insert']
export type EquipmentUpdate = Database['public']['Tables']['equipment']['Update']

export type EquipmentUsage = Database['public']['Tables']['equipment_usage']['Row']
export type EquipmentUsageInsert = Database['public']['Tables']['equipment_usage']['Insert']
export type EquipmentUsageUpdate = Database['public']['Tables']['equipment_usage']['Update']

export type QboConnection = Database['public']['Tables']['qbo_connections']['Row']
export type QboConnectionInsert = Database['public']['Tables']['qbo_connections']['Insert']
export type QboConnectionUpdate = Database['public']['Tables']['qbo_connections']['Update']

export type QboEntityMap = Database['public']['Tables']['qbo_entity_map']['Row']
export type QboEntityMapInsert = Database['public']['Tables']['qbo_entity_map']['Insert']
export type QboEntityMapUpdate = Database['public']['Tables']['qbo_entity_map']['Update']

export type QbSyncLog = Database['public']['Tables']['qb_sync_logs']['Row']
export type QbSyncLogInsert = Database['public']['Tables']['qb_sync_logs']['Insert']

export type ReceiptLineItem = Database['public']['Tables']['receipt_line_items']['Row']
export type ReceiptLineItemInsert = Database['public']['Tables']['receipt_line_items']['Insert']
export type ReceiptLineItemUpdate = Database['public']['Tables']['receipt_line_items']['Update']

export type JobQueue = Database['public']['Tables']['job_queue']['Row']
export type JobQueueInsert = Database['public']['Tables']['job_queue']['Insert']
export type JobQueueUpdate = Database['public']['Tables']['job_queue']['Update']

export type AuditLog = Database['public']['Tables']['audit_logs']['Row']
export type AuditLogInsert = Database['public']['Tables']['audit_logs']['Insert']
export type AuditLogUpdate = Database['public']['Tables']['audit_logs']['Update']

export type QboWebhookEvent = Database['public']['Tables']['qbo_webhook_events']['Row']
export type QboWebhookEventInsert = Database['public']['Tables']['qbo_webhook_events']['Insert']
export type QboWebhookEventUpdate = Database['public']['Tables']['qbo_webhook_events']['Update']

// Join types for convenience
export type WorkOrderWithCustomerLocation = WorkOrder & {
  customer: Customer
  location: Location
  assigned_employee?: Employee
}

export type ScheduleEntryWithDetails = WorkOrderSchedule & {
  work_order: WorkOrder & {
    customer: Customer
  }
  employee: Employee
}

export type TimeEntryWithDetails = WorkOrderTimeEntry & {
  work_order: WorkOrder & {
    customer: Customer
  }
  employee: Employee
}

export type LocationWithCustomer = Location & {
  customer: Customer
}

export type JobCostEntryWithRelations = JobCostEntry & {
  project?: Project & {
    customer: Customer
  }
  work_order?: WorkOrder & {
    customer: Customer
  }
  part?: Part
  cost_type?: CostType
  cost_code?: CostCode
}

export type EquipmentUsageWithEquipment = EquipmentUsage & {
  equipment: Equipment
  work_order: WorkOrder & {
    customer: Customer
  }
}

export type FileWithEntity = File & {
  customer?: Customer
  project?: Project
  quote?: Quote
  work_order?: WorkOrder & {
    customer: Customer
  }
}
