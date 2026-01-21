# Validation Guide

This guide explains how to validate the RLS policies and workflow queries using the SQL checks.

## Prerequisites
- Run the migration that adds role-aware RLS, view fixes, and work-order numbering support.
- Use a Postgres session that can `SET ROLE` (e.g., `psql` connected as `postgres` or `service_role`).

## Steps
1. Open a SQL session against the Supabase database.
2. Run the validation script:

```sql
\i sql/validation_checks.sql
```

## What the Script Covers
- Seeds sample users (admin/office/tech) in `auth.users` + `employees` and creates a sample customer, location, work order, schedule entry, and time entry.
- Simulates JWT claims for each role using `request.jwt.claims`.
- Confirms:
  - Admin/office can read and write the expected tables.
  - Tech can only access assigned work orders and their own time entries.
  - Tech cannot modify work orders or read receipts.
  - `get_next_number('work_order')` works for admin/office roles.

## Cleanup
The script runs in a transaction and ends with `ROLLBACK`, so no persistent data is created.
