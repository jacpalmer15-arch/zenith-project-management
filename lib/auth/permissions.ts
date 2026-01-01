export type UserRole = 'ADMIN' | 'OFFICE' | 'TECH'

export type Permission = 
  | 'view_dashboard'
  | 'view_customers'
  | 'edit_customers'
  | 'view_projects'
  | 'edit_projects'
  | 'view_work_orders'
  | 'edit_work_orders'
  | 'view_quotes'
  | 'edit_quotes'
  | 'view_schedule'
  | 'edit_schedule'
  | 'view_time'
  | 'edit_time'
  | 'view_costs'
  | 'edit_costs'
  | 'view_receipts'
  | 'edit_receipts'
  | 'view_parts'
  | 'edit_parts'
  | 'view_reports'
  | 'view_employees'
  | 'edit_employees'
  | 'view_settings'
  | 'edit_settings'
  | 'delete_records'
  | 'view_audit_logs'

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  ADMIN: [
    'view_dashboard',
    'view_customers',
    'edit_customers',
    'view_projects',
    'edit_projects',
    'view_work_orders',
    'edit_work_orders',
    'view_quotes',
    'edit_quotes',
    'view_schedule',
    'edit_schedule',
    'view_time',
    'edit_time',
    'view_costs',
    'edit_costs',
    'view_receipts',
    'edit_receipts',
    'view_parts',
    'edit_parts',
    'view_reports',
    'view_employees',
    'edit_employees',
    'view_settings',
    'edit_settings',
    'delete_records',
    'view_audit_logs'
  ],
  OFFICE: [
    'view_dashboard',
    'view_customers',
    'edit_customers',
    'view_projects',
    'edit_projects',
    'view_work_orders',
    'edit_work_orders',
    'view_quotes',
    'edit_quotes',
    'view_schedule',
    'edit_schedule',
    'view_time',
    'view_costs',
    'view_receipts',
    'edit_receipts',
    'view_parts',
    'edit_parts',
    'view_reports',
    'view_employees'
  ],
  TECH: [
    'view_dashboard',
    'view_customers',
    'view_work_orders',
    'view_schedule',
    'view_time',
    'edit_time'
  ]
}

export function normalizeRole(role: string | undefined): UserRole | undefined {
  if (!role) return undefined
  const upper = role.toUpperCase()
  if (upper === 'ADMIN' || upper === 'OFFICE' || upper === 'TECH') {
    return upper as UserRole
  }
  return undefined
}

export function hasPermission(
  role: UserRole | string | undefined,
  permission: Permission
): boolean {
  const normalizedRole = normalizeRole(role)
  if (!normalizedRole) return false
  return ROLE_PERMISSIONS[normalizedRole].includes(permission)
}

export function requirePermission(
  role: UserRole | string | undefined,
  permission: Permission
): void {
  if (!hasPermission(role, permission)) {
    throw new Error(`Permission denied: ${permission}`)
  }
}
