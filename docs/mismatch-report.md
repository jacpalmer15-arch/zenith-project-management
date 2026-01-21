# UI ↔ DB Mismatch Report

This punch list captures mismatches between the UI expectations and the current schema, prioritized by impact.

## Security / Data Leakage (Highest Priority)
- **Missing RLS on core UI tables:** `employees`, `locations`, `work_orders`, `work_order_schedule`, `work_order_time_entries`, `audit_logs` lacked RLS, allowing unrestricted access via GRANTs.
- **Over‑permissive RLS policies:** many tables used by the UI (`customers`, `job_cost_entries`, `receipts`, `parts`, etc.) allowed any authenticated user to read/write all rows.
- **Email-based identity mapping:** `employees` lookup by email was ambiguous without uniqueness, enabling privilege confusion.
- **Security‑definer RPCs with no role checks:** `accept_quote` and `get_next_number` could be invoked by any authenticated/anon user, bypassing role intent.
- **View access without grants:** receipt allocation views had no grants for `authenticated`, blocking UI access or forcing service-role workarounds.

## Workflow Blockers
- **`get_next_number('work_order')` fails:** UI calls this for work order creation, but the function rejects unknown kinds and the settings table has no work order sequence columns.
- **`audit_log_entries` is missing:** UI queries this table/view for audit log tables and exports; the schema only has `audit_logs`.

## Data Integrity Gaps
- **Work order numbering not persisted:** no `work_order_number_prefix` / `next_work_order_seq` columns to support deterministic work order numbering.
- **Employee identity not deterministic:** no `employees.user_id` link to `auth.users`, forcing email matching.
- **Audit log entry shape mismatch:** UI expects `table_name`, `record_id`, and `user_email` fields; schema uses a different structure (`audit_logs`).
- **Settings singleton ambiguity:** `settings` had no enforced single-row guarantee, making numbering and defaults nondeterministic.
- **Optional mismatch:** `find_duplicate_receipts` RPC referenced by the UI is not present (UI handles missing RPC, so low impact).

## Performance Risks
- **Missing indexes for primary UI filters:**
  - `work_orders.assigned_to` is filtered frequently in work order lists.
  - `work_order_time_entries.tech_user_id` and `clock_in_at` are used for time entry filters.

The migration addresses the security gaps, workflow blockers, and critical indexes while keeping the schema stable.
