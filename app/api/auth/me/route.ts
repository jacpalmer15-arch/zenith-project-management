import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/get-user'

export async function GET() {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(null, { status: 401 })
    }
    
    return NextResponse.json(user)
  } catch (error) {
    console.error('Error fetching current user:', error)
    return NextResponse.json(null, { status: 500 })
  }
}
