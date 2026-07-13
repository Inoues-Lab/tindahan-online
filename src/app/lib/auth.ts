// src/lib/auth.ts
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// Get the currently logged-in user securely
export async function getAuthenticatedUser() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value
  const userRole = cookieStore.get('userRole')?.value

  if (!userId || !userRole) {
    return null
  }

  // Verify the user actually exists in the database
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true, phone: true }
  })

  // If user doesn't exist or role doesn't match cookie, block them
  if (!user || user.role !== userRole) {
    return null
  }

  return user
}

// Helper to protect API routes based on roles
export async function requireAuth(allowedRoles: string[]) {
  const user = await getAuthenticatedUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized: Please login' }, { status: 401 })
  }
  
  if (!allowedRoles.includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden: You do not have permission' }, { status: 403 })
  }

  return user
}