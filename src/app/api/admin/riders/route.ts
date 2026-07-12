// src/app/api/admin/riders/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value
    const userRole = cookieStore.get('userRole')?.value

    console.log('Admin fetching riders - userId:', userId, 'role:', userRole)

    // Check if user is admin
    if (userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Fetch all riders
    const riders = await prisma.user.findMany({
      where: {
        role: 'RIDER'
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        cashOnHand: true,
        remittanceLimit: true,
        createdAt: true
      }
    })

    console.log('Found riders:', riders.length)

    return NextResponse.json({ riders })
  } catch (error: any) {
    console.error('Error fetching riders:', error)
    console.error('Error details:', error.message)
    return NextResponse.json({ 
      error: 'Failed to fetch riders',
      message: error.message 
    }, { status: 500 })
  }
}