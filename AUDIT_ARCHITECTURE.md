# Audit Logging Architecture Diagram

## Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER ACTIONS                              │
│  (Create/Update/Delete Job Cost Entry)                          │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   SUPABASE DATABASE                              │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         job_cost_entries TABLE                           │  │
│  │  (INSERT/UPDATE/DELETE operations)                       │  │
│  └────────────────┬─────────────────────────────────────────┘  │
│                   │                                             │
│                   │ ← Trigger Fires Automatically               │
│                   ▼                                             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │   log_job_cost_entry_changes() FUNCTION                  │  │
│  │   - Captures old_values & new_values                     │  │
│  │   - Calculates changed_fields                            │  │
│  │   - Extracts user info from JWT                          │  │
│  │   - Determines action type (INSERT/UPDATE/DELETE)        │  │
│  └────────────────┬─────────────────────────────────────────┘  │
│                   │                                             │
│                   │ Inserts audit record                        │
│                   ▼                                             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         audit_log_entries TABLE                          │  │
│  │  - id, table_name, record_id, action                     │  │
│  │  - old_values (JSONB), new_values (JSONB)                │  │
│  │  - changed_fields (TEXT[])                               │  │
│  │  - user_id, user_email, created_at                       │  │
│  │  - reason (optional)                                     │  │
│  └────────────────┬─────────────────────────────────────────┘  │
│                   │                                             │
│  RLS POLICIES:    │                                             │
│  - Admin: View all logs                                        │
│  - Users: View own logs                                        │
│  - System: Always insert                                       │
└───────────────────┼─────────────────────────────────────────────┘
                    │
                    │ Queries via Supabase Client
                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATA LAYER (Server)                           │
│                  lib/data/audit-logs.ts                          │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  getAuditLogsForRecord(table, recordId)                  │  │
│  │  getRecentAuditLogs(limit, offset)                       │  │
│  │  getAuditLogsByUser(userId)                              │  │
│  │  getAuditLogsByDateRange(start, end)                     │  │
│  │  getAuditLogEntries(options)                             │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────────┘
                         │
        ┌────────────────┴────────────────┐
        │                                 │
        ▼                                 ▼
┌──────────────────┐            ┌──────────────────────┐
│   API ENDPOINT   │            │   SERVER PAGES       │
│                  │            │                      │
│  /api/audit-logs │            │  /app/audit-logs     │
│     /record      │            │  (Admin Page)        │
│                  │            │                      │
│  GET with params │            │  - Server Component  │
│  Returns JSON    │            │  - Permission check  │
└────────┬─────────┘            │  - Data fetching     │
         │                      └──────────┬───────────┘
         │                                 │
         ▼                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                    UI COMPONENTS (Client)                        │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  /app/audit-logs/client.tsx (Admin Interface)          │    │
│  │  - Filters (table, action, user, date, record ID)      │    │
│  │  - Pagination controls                                  │    │
│  │  - CSV export                                           │    │
│  │  - Uses: AuditLogTable component                        │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  components/audit/audit-log-table.tsx                   │    │
│  │  - Displays audit log entries                           │    │
│  │  - Color-coded action badges                            │    │
│  │  - Relative timestamps                                  │    │
│  │  - "View Details" button                                │    │
│  │  - Uses: AuditLogDetailModal                            │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  components/audit/audit-log-detail-modal.tsx            │    │
│  │  - Shows full audit log details                         │    │
│  │  - Metadata (timestamp, user, table, record ID)         │    │
│  │  - Changed fields list                                  │    │
│  │  - Uses: AuditDiffViewer for UPDATE actions             │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  components/audit/audit-diff-viewer.tsx                 │    │
│  │  - Side-by-side before/after comparison                 │    │
│  │  - Red highlighting for old values                      │    │
│  │  - Green highlighting for new values                    │    │
│  │  - JSON pretty-printing                                 │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  components/reports/job-cost-table.tsx                  │    │
│  │  - Shows job cost entries                               │    │
│  │  - "View History" dropdown action                       │    │
│  │  - Fetches via API, displays in modal                   │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

## Component Hierarchy

```
AppShell (Navigation)
└── /app/audit-logs (Admin Only)
    └── AuditLogsClient
        ├── Filters (table, action, user, date, record_id)
        ├── AuditLogTable
        │   └── AuditLogDetailModal
        │       └── AuditDiffViewer
        ├── Pagination
        └── CSV Export

JobCostTable
└── "View History" Button
    └── API Call to /api/audit-logs/record
        └── AuditLogTable (in modal)
            └── AuditLogDetailModal
                └── AuditDiffViewer
```

## Security Layers

```
┌─────────────────────────────────────────────────────────┐
│  1. PERMISSION CHECK (lib/auth/permissions.ts)         │
│     - Only ADMIN role has 'view_audit_logs'            │
│     - Checked in page.tsx before rendering             │
│     - Redirects non-admin to dashboard                 │
└───────────────────┬─────────────────────────────────────┘
                    ▼
┌─────────────────────────────────────────────────────────┐
│  2. ROW LEVEL SECURITY (Database)                       │
│     - Admin policy: View all logs                       │
│     - User policy: View only own logs                   │
│     - System policy: Always insert                      │
└───────────────────┬─────────────────────────────────────┘
                    ▼
┌─────────────────────────────────────────────────────────┐
│  3. IMMUTABLE LOGS                                      │
│     - No UPDATE or DELETE permissions                   │
│     - Trigger runs as SECURITY DEFINER                  │
│     - Cannot be disabled by regular users               │
└─────────────────────────────────────────────────────────┘
```

## Data Capture Process

```
User Action (e.g., Update Cost Entry)
    ↓
Database Operation (UPDATE job_cost_entries)
    ↓
Trigger Fires AFTER Operation
    ↓
log_job_cost_entry_changes() Function
    │
    ├─→ Capture OLD values (to_jsonb(OLD))
    ├─→ Capture NEW values (to_jsonb(NEW))
    ├─→ Calculate changed fields (compare OLD vs NEW)
    ├─→ Get user_id from auth.uid()
    ├─→ Get user_email from JWT claims
    └─→ Insert into audit_log_entries
            │
            ├─→ table_name: 'job_cost_entries'
            ├─→ record_id: NEW.id or OLD.id
            ├─→ action: 'INSERT', 'UPDATE', or 'DELETE'
            ├─→ old_values: JSONB of old record
            ├─→ new_values: JSONB of new record
            ├─→ changed_fields: Array of field names
            ├─→ user_id: UUID
            ├─→ user_email: Text
            └─→ created_at: NOW()
```

## Query Patterns

### 1. Admin Views All Logs
```
/app/audit-logs
    ↓
getAuditLogEntries({ limit, offset, filters })
    ↓
RLS: Admin policy allows all
    ↓
Returns paginated results
```

### 2. View Record History
```
JobCostTable → "View History" button
    ↓
/api/audit-logs/record?table=job_cost_entries&record_id=xxx
    ↓
getAuditLogsForRecord('job_cost_entries', 'xxx')
    ↓
RLS: Admin can see all, users can see if they made changes
    ↓
Returns array of audit logs for that record
```

### 3. Export to CSV
```
AuditLogsClient → "Export CSV" button
    ↓
Client-side processing (current page data)
    ↓
RFC 4180 compliant escaping
    ↓
Blob download with timestamp filename
```

## Index Usage

```
idx_audit_log_table_record (table_name, record_id)
    Used by: getAuditLogsForRecord()
    
idx_audit_log_created_at (created_at DESC)
    Used by: All queries (default ordering)
    
idx_audit_log_user_id (user_id)
    Used by: getAuditLogsByUser(), user filtering
    
idx_audit_log_action (action)
    Used by: Action filtering
```

## Performance Considerations

1. **Trigger Overhead**: Minimal - JSONB conversion is fast
2. **Storage Growth**: ~1-2KB per audit log entry
3. **Query Performance**: Indexes ensure fast lookups
4. **Pagination**: Prevents large result sets
5. **RLS Filtering**: Done at database level (efficient)

## Future Scaling

```
Current: audit_log_entries (single table)
    ↓
    ├─→ Hot data (0-2 years): Keep in main table
    ├─→ Warm data (3-7 years): Move to archive table
    └─→ Cold data (7+ years): Consider cold storage or deletion
```
