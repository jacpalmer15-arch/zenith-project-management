# Audit Logging Implementation Summary

## Overview
This implementation adds comprehensive audit logging for all create, update, and delete operations on `job_cost_entries` to maintain a complete history of changes for compliance and troubleshooting.

## What Was Implemented

### 1. Database Layer
**File**: `supabase/migrations/20260101163707_add_cost_entry_audit_logs.sql`

- **New Table**: `audit_log_entries`
  - Captures table_name, record_id, action (INSERT/UPDATE/DELETE)
  - Stores old_values and new_values as JSONB
  - Tracks changed_fields array for efficient diff viewing
  - Records user_id, user_email, ip_address, user_agent
  - Optional reason field for administrative overrides
  - Indexed on table/record, created_at, user_id, and action

- **Trigger Function**: `log_job_cost_entry_changes()`
  - Automatically fires on INSERT, UPDATE, DELETE operations
  - Calculates changed fields by comparing old vs new values
  - Captures user information from JWT claims with fallback
  - Runs with SECURITY DEFINER for reliable execution

- **Row Level Security (RLS)**
  - Admin users can view all audit logs
  - Regular users can view their own audit logs
  - System can always insert audit logs

### 2. Data Layer
**File**: `lib/data/audit-logs.ts`

Added comprehensive functions for querying audit logs:
- `getAuditLogsForRecord(tableName, recordId)` - Get history for a specific record
- `getRecentAuditLogs(limit, offset)` - Paginated recent logs
- `getAuditLogsByUser(userId)` - User-specific logs
- `getAuditLogsByDateRange(startDate, endDate)` - Date-filtered logs
- `getAuditLogEntries(options)` - Full-featured query with all filters

**Exported** from `lib/data/index.ts` for easy imports throughout the app.

### 3. UI Components
**Directory**: `components/audit/`

- **audit-diff-viewer.tsx**: Visual diff component
  - Shows before/after values side by side
  - Highlights changed fields in red (old) and green (new)
  - Handles nested JSON objects
  - Filters out internal fields (id, created_at, etc.)

- **audit-log-detail-modal.tsx**: Detailed view modal
  - Shows full metadata (timestamp, user, table, record ID)
  - Displays reason if provided
  - Shows visual diff for UPDATE actions
  - Shows created values for INSERT
  - Shows deleted values for DELETE
  - Responsive design with scrollable content

- **audit-log-table.tsx**: Reusable table component
  - Color-coded action badges (green=INSERT, blue=UPDATE, red=DELETE)
  - Relative timestamps with full date/time
  - Change summary with field names
  - Expandable detail view
  - Shows reason in italics if provided
  - Can hide table column for single-table views

### 4. Admin Pages
**Directory**: `app/app/audit-logs/`

- **page.tsx**: Server component
  - Checks admin permission (redirects if unauthorized)
  - Fetches audit logs with filters
  - Implements pagination (50 per page)

- **client.tsx**: Client component
  - Filter controls (table, action, record ID, date range)
  - Apply/clear filters functionality
  - Pagination controls
  - CSV export with RFC 4180 compliant escaping
  - Shows total count
  - Responsive grid layout

### 5. Integration Points

**Job Cost Table** (`components/reports/job-cost-table.tsx`)
- Added "View History" dropdown action
- Fetches audit logs via API when clicked
- Shows history in modal dialog
- Works for both project and work order cost views

**API Endpoint** (`app/api/audit-logs/record/route.ts`)
- GET endpoint for fetching logs by record
- Takes table and record_id as query parameters
- Returns JSON array of audit log entries

**Navigation** (`components/app-shell.tsx`)
- Added "Audit Logs" link with Shield icon
- Only visible to admin users
- Positioned before Settings

**Permissions** (`lib/auth/permissions.ts`)
- Added `view_audit_logs` permission
- Granted only to ADMIN role

### 6. Documentation
**File**: `AUDIT_LOG_RETENTION_POLICY.md`

Comprehensive retention policy document covering:
- 7-year minimum retention requirement
- Active vs archive storage strategy
- Implementation notes for automated archival
- Backup strategy alignment
- Compliance considerations
- Review schedule

## Key Features

### ✅ Automatic Logging
Database triggers capture all changes automatically - no code changes needed in business logic.

### ✅ Complete Audit Trail
- Who made the change (user email)
- What was changed (field-level diff)
- When it happened (timestamp)
- What the values were before and after

### ✅ Admin Controls
- Full admin interface for viewing all logs
- Filter by table, action, user, date, record ID
- Export to CSV for compliance reporting
- Pagination for large result sets

### ✅ User History View
- "View History" button on cost entries
- See complete change history for any record
- Visual diff highlighting changes

### ✅ Security
- Admin-only access to full audit logs
- RLS policies at database level
- Users can only see their own actions

### ✅ Performance
- Indexed for fast queries
- Paginated results
- Efficient JSONB storage

## Testing Checklist

To verify the implementation:

1. **Create a job cost entry**
   - Check audit_log_entries table for INSERT record
   - Verify new_values contains the created data
   - Verify user_email is captured

2. **Update a job cost entry**
   - Check for UPDATE record
   - Verify old_values and new_values are different
   - Verify changed_fields array contains modified field names
   - Check diff viewer shows highlighted changes

3. **Delete a job cost entry**
   - Check for DELETE record
   - Verify old_values contains the deleted data

4. **Admin page access**
   - Login as admin user
   - Navigate to /app/audit-logs
   - Verify page loads and shows logs
   - Test filters (table, action, date range)
   - Test pagination
   - Test CSV export

5. **Non-admin access**
   - Login as non-admin user
   - Try to access /app/audit-logs
   - Verify redirect to dashboard

6. **View History button**
   - Go to project or work order costs page
   - Click dropdown on a cost entry
   - Click "View History"
   - Verify modal shows audit trail

## Migration Notes

### Applying the Migration
The migration file `20260101163707_add_cost_entry_audit_logs.sql` should be applied to your Supabase database:

```bash
# If using Supabase CLI
supabase db push

# Or apply manually in Supabase SQL editor
```

### Post-Migration Verification
```sql
-- Verify table exists
SELECT * FROM audit_log_entries LIMIT 1;

-- Verify trigger exists
SELECT * FROM pg_trigger WHERE tgname = 'job_cost_entries_audit_trigger';

-- Verify RLS policies
SELECT * FROM pg_policies WHERE tablename = 'audit_log_entries';
```

### Rollback Plan
If needed, the migration can be rolled back with:
```sql
DROP TRIGGER IF EXISTS job_cost_entries_audit_trigger ON job_cost_entries;
DROP FUNCTION IF EXISTS log_job_cost_entry_changes();
DROP TABLE IF EXISTS audit_log_entries;
```

## Future Enhancements

Consider these additions in the future:

1. **Extended Logging**: Add triggers for other critical tables
2. **IP Address Capture**: Enhance to capture actual client IP
3. **User Agent Tracking**: Store browser/app information
4. **Reason Field UI**: Add reason input when making sensitive changes
5. **Audit Reports**: Pre-built compliance reports
6. **Change Approval**: Workflow for approving sensitive changes
7. **Automated Archival**: Scheduled job to archive old logs
8. **Performance Monitoring**: Track audit log table size and query performance
9. **Advanced Search**: Full-text search across audit log values
10. **Alerts**: Notify on suspicious patterns or bulk changes

## Compliance Notes

This implementation provides:
- **SOX Compliance**: Complete audit trail of financial data changes
- **Change Tracking**: Who, what, when, and why for all modifications
- **Data Retention**: 7-year retention policy documented
- **Access Control**: Admin-only access to full audit logs
- **Non-Repudiation**: Database-level capture prevents tampering

Consult with your compliance team to ensure all requirements are met for your specific industry and jurisdiction.
