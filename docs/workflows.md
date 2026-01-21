# UI Workflows → Supabase Queries → Tables/Views

This document inventories the current web app workflows by reading the data-access code (server actions + `lib/data/*`) and summarizing the Supabase queries, expected fields, and ownership assumptions.

## Authentication + Current User Context
- **Workflow:** App layout/user bootstrap.
- **Queries:**
  - `auth.getUser()` then `employees` lookup by `user_id`.
  - If no employee is linked, call `link_employee_user_id()` RPC to claim the matching email record.
- **Tables:** `employees`.
- **Required fields:** `employees.user_id`, `employees.email`, `employees.role`, `employees.display_name`.
- **Ownership assumptions:** Authenticated user should read their own employee row via `user_id` linkage.

## Dashboard
- **Workflow:** Dashboard metrics and recent activity.
- **Queries:**
  - Counts: `customers`, `projects` (status = Active), `quotes` (status = DRAFT), `parts` (is_active = true).
  - Recent projects: `projects` ordered by `created_at`.
  - Recent quotes: `quotes` joined to `projects` + `customers`.
  - Work order metrics: `work_orders` (status + date filters).
  - Profit preview: `work_orders` + `job_cost_entries` + `quotes` join.
- **Tables:** `customers`, `projects`, `quotes`, `parts`, `work_orders`, `job_cost_entries`.
- **Sorting/pagination:** Order by `created_at`, filter by status/date.
- **Ownership assumptions:** Tech dashboard is read-only; admin/office can access all metrics.

## Global Search
- **Workflow:** Typeahead search across key entities.
- **Queries:**
  - `customers` (`name`, `customer_no`), `work_orders` (`work_order_no`, `summary`), `quotes` (`quote_no`), `projects` (`name`, `project_no`).
- **Tables:** `customers`, `work_orders`, `quotes`, `projects`.
- **Sorting/pagination:** `limit(5)` each.
- **Ownership assumptions:** Results should respect role visibility.

## Customers
- **Workflow:** List, detail, create, update.
- **Queries:**
  - List + count: `customers` with `ilike` search, email/phone filters, sorted by `name`.
  - Detail: `customers` by `id`.
  - Create/Update: `customers` insert/update.
- **Tables:** `customers`, `audit_logs` (writes from actions).
- **Required fields:** `customer_no`, `name` (non-null).
- **Ownership assumptions:** Admin/office can edit; tech can view.

## Locations
- **Workflow:** List by customer, create, update.
- **Queries:**
  - `locations` filtered by `customer_id`, sorted by `label`/`street`.
  - Insert/update rows.
- **Tables:** `locations`, `audit_logs` (writes from actions).
- **Required fields:** `customer_id`, `street`, `city`, `state`, `zip`.
- **Ownership assumptions:** Admin/office edit; tech view only.

## Employees
- **Workflow:** List, create, update.
- **Queries:**
  - List `employees` with `ilike` search and filters on `role`/`is_active`.
  - Insert/update employee rows.
- **Tables:** `employees`.
- **Required fields:** `id`, `display_name`, `role`, `is_active`.
- **Ownership assumptions:** Admin/office manage employees; users can read their own employee profile.

## Projects
- **Workflow:** List, detail, create, update.
- **Queries:**
  - `projects` list with filters on status/customer.
  - Detail `projects` by `id` and related `customers`.
  - Insert/update.
- **Tables:** `projects`, `customers`, `audit_logs`.
- **Required fields:** `project_no`, `customer_id`, `name`.
- **Ownership assumptions:** Admin/office edit; others read-only if allowed.

## Quotes + Quote Lines
- **Workflow:** List, detail, create, update, delete; accept quote RPC.
- **Queries:**
  - `quotes` with joins to `projects`, `customers`, `tax_rules`, and parent quote.
  - `quote_lines` for quote detail; insert/update/delete lines.
  - RPC `accept_quote` on approval.
- **Tables:** `quotes`, `quote_lines`, `projects`, `customers`, `tax_rules`.
- **Required fields:** `quote_no`, `project_id` or `work_order_id`, `tax_rule_id`, `status`, `quote_type`.
- **Ownership assumptions:** Admin/office edit; acceptance should be restricted to those roles.

## Work Orders
- **Workflow:** List with filters, detail, create, update, delete, status transitions.
- **Queries:**
  - `work_orders` with joins to `customers`, `locations`, `employees`.
  - Filters: status, assigned_to, customer_id, date range; paging via range.
  - Insert/update/delete.
- **Tables:** `work_orders`, `customers`, `locations`, `employees`, `audit_logs`.
- **Required fields:** `customer_id`, `location_id`, `status`, `priority`, `summary`.
- **Ownership assumptions:** Tech sees only assigned/scheduled work orders; admin/office can edit all.

## Schedule
- **Workflow:** List, create, update, delete schedule entries.
- **Queries:**
  - `work_order_schedule` with filters for `tech_user_id`, date range, and `work_order_id`.
  - Insert/update/delete schedule entries.
- **Tables:** `work_order_schedule`, `work_orders`, `employees`, `audit_logs`.
- **Required fields:** `work_order_id`, `tech_user_id`, `start_at`, `end_at`.
- **Ownership assumptions:** Tech sees only their schedule entries; admin/office edit all.

## Time Tracking
- **Workflow:** List, create, update, delete time entries.
- **Queries:**
  - `work_order_time_entries` with joins to `work_orders`, `customers`, `employees`.
  - Filters: `tech_user_id`, `work_order_id`, date range, clock-out status.
  - Insert/update/delete.
- **Tables:** `work_order_time_entries`, `work_orders`, `customers`, `employees`, `audit_logs`.
- **Required fields:** `work_order_id`, `tech_user_id`, `clock_in_at`.
- **Ownership assumptions:** Tech can CRUD only their own entries; admin/office manage all.

## Job Costs / Cost Entries
- **Workflow:** Create/update/delete job costs; list cost entries for work order/project.
- **Queries:**
  - `job_cost_entries` list with filters on `work_order_id`, `project_id`, `cost_type_id`, `cost_code_id`.
  - Insert/update/delete.
  - Joins to `cost_types`, `cost_codes`, `parts`, `receipts`.
- **Tables:** `job_cost_entries`, `cost_types`, `cost_codes`, `parts`, `receipts`, `receipt_line_items`, `audit_logs`.
- **Required fields:** `cost_type_id`, `cost_code_id`, `qty`, `unit_cost`.
- **Ownership assumptions:** Admin/office only.

## Receipts + Line Items
- **Workflow:** Create, update, delete receipts; allocate to work orders; manage line items.
- **Queries:**
  - `receipts` list with filters by `is_allocated`, `allocated_to_work_order_id`.
  - `receipt_line_items` CRUD; join to `parts`.
  - Views: `vw_receipt_allocation_status`, `vw_receipt_line_allocation_status`.
- **Tables/Views:** `receipts`, `receipt_line_items`, `parts`, `vw_receipt_allocation_status`, `vw_receipt_line_allocation_status`, `audit_logs`.
- **Required fields:** `storage_path` on receipts; line items require `receipt_id`, `description`, `qty`, `unit_cost`.
- **Ownership assumptions:** Admin/office only.

## Parts Catalog + Cost Codes/Types
- **Workflow:** List, create, update parts; manage categories, cost codes, cost types.
- **Queries:**
  - `parts` list with `ilike` search; join to `part_categories`, `cost_types`, `cost_codes`.
  - CRUD on `part_categories`, `cost_types`, `cost_codes`.
- **Tables:** `parts`, `part_categories`, `cost_types`, `cost_codes`.
- **Required fields:** `parts.name`, `parts.uom` (non-null); category/name fields for lookup tables.
- **Ownership assumptions:** Admin/office only.

## Inventory Ledger + Reports
- **Workflow:** Inventory and cost reports.
- **Queries:**
  - `inventory_ledger` grouped by `part_id`.
  - `work_orders`, `job_cost_entries`, `work_order_time_entries`, `receipts` for reporting views.
- **Tables:** `inventory_ledger`, `parts`, `job_cost_entries`, `work_order_time_entries`, `work_orders`, `receipts`.
- **Ownership assumptions:** Admin/office only.

## Equipment + Usage
- **Workflow:** Manage equipment and usage (for cost reporting).
- **Queries:**
  - `equipment` list and CRUD.
  - `equipment_usage` list filtered by `work_order_id`.
- **Tables:** `equipment`, `equipment_usage`.
- **Ownership assumptions:** Admin/office only.

## Settings
- **Workflow:** View/update company settings.
- **Queries:**
  - `settings` select/update.
  - RPC `get_next_number` for sequences used by customers/projects/quotes/work orders.
- **Tables:** `settings`.
- **Ownership assumptions:** Admin only for settings; admin/office for sequence generation.

## Audit Logs
- **Workflow:** View audit trail per record or global.
- **Queries:**
  - `audit_logs` for legacy list.
  - `audit_log_entries` (expected view) for UI tables/exports.
- **Tables/Views:** `audit_logs`, `audit_log_entries`.
- **Ownership assumptions:** Admin-only view; inserts from any authenticated action.
