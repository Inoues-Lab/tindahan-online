import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value

    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    // Only use fields that exist in your schema
    const { vehicleType, plateNumber } = body

    // Check if already has a PENDING application
    const existingApp = await prisma.riderProfile.findFirst({
      where: { userId, status: 'PENDING' }
    })

    if (existingApp) {
      return NextResponse.json({ error: 'You already have a pending application' }, { status: 400 })
    }

    // Create or Update application (Profile)
    const application = await prisma.riderProfile.upsert({
      where: { userId },
      update: {
        vehicleType: vehicleType || null,
        plateNumber: plateNumber || null,
        status: 'PENDING'
      },
      create: {
        userId,
        vehicleType: vehicleType || null,
        plateNumber: plateNumber || null,
        status: 'PENDING'
      }
    })

    return NextResponse.json({ success: true, application })
  } catch (error) {
    console.error('Error applying:', error)
    return NextResponse.json({ error: 'Failed to apply' }, { status: 500 })
  }
}