# Database Surface (Schema Extract)

This document summarizes the DB objects touched by the UI workflows and highlights primary keys, foreign keys, required fields, defaults, triggers, and relevant indexes.

## Tables

### audit_logs
- **Primary key:** `id` (uuid).
- **Required fields:** `entity_type`, `action`, `created_at`.
- **FKs:** `actor_user_id → auth.users.id`.
- **Indexes:** `actor_user_id`, `created_at DESC`, `(entity_type, entity_id)`.

### customers
- **Primary key:** `id`.
- **Required fields:** `customer_no` (unique), `name`, `created_at`, `updated_at`.
- **Indexes:** `GIN` tsvector on `name`.

### locations
- **Primary key:** `id`.
- **Required fields:** `customer_id`, `street`, `city`, `state`, `zip`, `is_active`.
- **FKs:** `customer_id → customers.id`.
- **Indexes:** `customer_id`.

### employees
- **Primary key:** `id`.
- **Required fields:** `display_name`, `role`, `is_active`.
- **Identity fields:** `user_id → auth.users.id` (nullable, unique when set).
- **Triggers:** `trg_employees_updated_at` updates `updated_at`.

### projects
- **Primary key:** `id`.
- **Required fields:** `project_no`, `customer_id`, `name`, `status`.
- **FKs:** `customer_id → customers.id`.
- **Indexes:** `customer_id`, `status`.

### quotes
- **Primary key:** `id`.
- **Required fields:** `quote_no`, `project_id` or `work_order_id`, `tax_rule_id`, `status`, `quote_type`.
- **FKs:** `project_id → projects.id`, `work_order_id → work_orders.id`, `tax_rule_id → tax_rules.id`, `parent_quote_id → quotes.id`.
- **Checks:** `ck_quote_parent`, `quotes_one_parent_chk`.
- **Indexes:** `project_id`, `status`, `work_order_id`.

### quote_lines
- **Primary key:** `id`.
- **Required fields:** `quote_id`, `description`, `uom`, `qty`, `unit_price`.
- **FKs:** `quote_id → quotes.id`, `part_id → parts.id`.
- **Indexes:** `quote_id`.

### work_orders
- **Primary key:** `id`.
- **Required fields:** `customer_id`, `location_id`, `status`, `priority`, `summary`, `opened_at`.
- **FKs:** `customer_id → customers.id`, `location_id → locations.id`, `assigned_to → employees.id`.
- **Indexes:** `customer_id`, `location_id`, `status`.

### work_order_schedule
- **Primary key:** `id`.
- **Required fields:** `work_order_id`, `tech_user_id`, `start_at`, `end_at`.
- **FKs:** `work_order_id → work_orders.id`, `tech_user_id → employees.id`.
- **Indexes:** `(tech_user_id, start_at)`.
- **Checks:** `end_at > start_at`.

### work_order_time_entries
- **Primary key:** `id`.
- **Required fields:** `work_order_id`, `tech_user_id`, `clock_in_at`, `break_minutes`.
- **FKs:** `work_order_id → work_orders.id`, `tech_user_id → employees.id`.
- **Indexes:** `work_order_id`.
- **Checks:** `clock_out_at > clock_in_at` (when set).

### job_cost_entries
- **Primary key:** `id`.
- **Required fields:** `cost_type_id`, `cost_code_id`, `qty`, `unit_cost`, `amount`, `source_type`.
- **FKs:** `cost_type_id → cost_types.id`, `cost_code_id → cost_codes.id`, `part_id → parts.id`, `project_id → projects.id`, `work_order_id → work_orders.id`, `receipt_id → receipts.id`, `receipt_line_item_id → receipt_line_items.id`.
- **Checks:** `amount = qty * unit_cost`, owner must be either project or work order.
- **Indexes:** `cost_type_id/cost_code_id`, `project_id/txn_date`, `work_order_id/txn_date`, `part_id`, `source_type/source_id`, `receipt_line_item_id`.

### receipts
- **Primary key:** `id`.
- **Required fields:** `storage_path`, `total_amount`, `is_allocated`.
- **FKs:** `allocated_to_work_order_id → work_orders.id`, `created_by → auth.users.id`, `vendor_id → vendors.id`.
- **Indexes:** `created_at DESC`, `receipt_date`, `allocated_to_work_order_id`, `is_allocated`.
- **Triggers:** `receipts_updated_at_trigger` updates `updated_at`.

### receipt_line_items
- **Primary key:** `id`.
- **Required fields:** `receipt_id`, `description`, `qty`, `unit_cost`, `amount`.
- **FKs:** `receipt_id → receipts.id`, `part_id → parts.id`.
- **Indexes:** `receipt_id`, `part_id`.
- **Checks:** `amount = qty * unit_cost`.

### parts
- **Primary key:** `id`.
- **Required fields:** `name`, `uom`, `is_taxable`, `is_active`.
- **FKs:** `category_id → part_categories.id`, `cost_type_id → cost_types.id`, `cost_code_id → cost_codes.id`.
- **Indexes:** `category_id`, `GIN` tsvector on `name`.

### part_categories
- **Primary key:** `id`.
- **Required fields:** `name`, `sort_order`.

### cost_types / cost_codes
- **Primary key:** `id`.
- **Required fields:** `name` (cost_types), `code`, `name`, `cost_type_id` (cost_codes).
- **Unique constraints:** `cost_types.name`, `cost_codes.code + cost_type_id`.

### inventory_ledger
- **Primary key:** `id`.
- **Required fields:** `part_id`, `txn_type`, `qty_delta`, `unit_cost`, `txn_date`.
- **FKs:** `part_id → parts.id`.
- **Indexes:** `txn_date`, `part_id`.

### equipment / equipment_usage
- **Primary key:** `id`.
- **Required fields:** `equipment.name`, `equipment_usage.work_order_id`, `equipment_usage.equipment_id`, `start_at`.
- **FKs:** `equipment_usage.work_order_id → work_orders.id`, `equipment_usage.equipment_id → equipment.id`.
- **Indexes:** `equipment.is_active`, `equipment.name`, `equipment_usage.equipment_id`, `equipment_usage.work_order_id`, `equipment_usage.start_at`.
- **Triggers:** `update_equipment_updated_at`, `update_equipment_usage_updated_at`.

### files
- **Primary key:** `id`.
- **Required fields:** `entity_type`, `entity_id`, `file_kind`, `storage_path`.
- **Indexes:** `(entity_type, entity_id)`.

### tax_rules
- **Primary key:** `id`.
- **Required fields:** `name`, `rate` (0–1).

### settings
- **Primary key:** `id`.
- **Required fields:** `company_name`, `default_quote_terms`, prefixes/sequences for customer/project/quote.
- **Singleton enforcement:** `is_singleton` unique index to prevent multiple rows.

## Views

### vw_receipt_line_allocation_status
- **Joins:** `receipt_line_items` left join `job_cost_entries`.
- **Fields:** allocation totals and status per line item.

### vw_receipt_allocation_status
- **Joins:** `receipts` + `vw_receipt_line_allocation_status`.
- **Fields:** allocation totals and `needs_allocation` flags per receipt.

## Functions / Triggers
- **accept_quote(p_quote_id):** updates quote status + project rollups.
- **get_next_number(p_kind):** generates customer/project/quote numbers (extended in migration).
- **link_employee_user_id():** links `employees.user_id` to `auth.uid()` when email matches.
- **set_updated_at / set_employees_updated_at / update_equipment_updated_at / update_receipts_updated_at:** timestamp maintenance.
