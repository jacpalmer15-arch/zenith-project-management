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
  | 'view_settings'
  | 'edit_settings'
  | 'delete_records'

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
    'view_settings',
    'edit_settings',
    'delete_records'
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
    'view_reports'
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

export function hasPermission(
  role: UserRole | undefined,
  permission: Permission
): boolean {
  if (!role) return false
  return ROLE_PERMISSIONS[role].includes(permission)
}

export function requirePermission(
  role: UserRole | undefined,
  permission: Permission
): void {
  if (!hasPermission(role, permission)) {
    throw new Error(`Permission denied: ${permission}`)
  }
}
