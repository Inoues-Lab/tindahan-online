// src/app/api/admin/riders/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const userRole = cookieStore.get('userRole')?.value

    if (userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Just find many, no include needed for basic fields
    const riders = await prisma.user.findMany({
      where: { role: 'RIDER' }
    })

    return NextResponse.json({ riders })
  } catch (error) {
    console.error('Error fetching riders:', error)
    return NextResponse.json({ error: 'Failed to fetch riders' }, { status: 500 })
  }
}