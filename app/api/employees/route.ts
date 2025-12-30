import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/get-user'
import { requirePermission } from '@/lib/auth/permissions'
import { createEmployee } from '@/lib/data'
import { employeeInsertSchema } from '@/lib/validations/employees'

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    
    // Only ADMIN can create employees
    try {
      requirePermission(user?.role, 'edit_settings')
    } catch (error) {
      return NextResponse.json(
        { error: 'Permission denied: Only admins can create employees' },
        { status: 403 }
      )
    }
    
    const formData = await request.formData()
    
    // Parse form data
    const data = {
      id: formData.get('id') as string,
      display_name: formData.get('display_name') as string,
      email: (formData.get('email') as string) || null,
      phone: (formData.get('phone') as string) || null,
      role: (formData.get('role') as string) || 'TECH',
      is_active: formData.get('is_active') === 'true',
    }

    // Validate with zod
    const parsed = employeeInsertSchema.safeParse(data)
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid form data' },
        { status: 400 }
      )
    }

    const employee = await createEmployee(parsed.data)
    
    return NextResponse.json({ success: true, employee })
  } catch (error) {
    console.error('Error creating employee:', error)
    return NextResponse.json(
      { error: 'Failed to create employee' },
      { status: 500 }
    )
  }
}
