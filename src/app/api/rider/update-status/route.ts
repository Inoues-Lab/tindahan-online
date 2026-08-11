import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value

    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { status, vehicleType } = body

    // Update or Create Rider Profile with valid fields only
    const riderProfile = await prisma.riderProfile.upsert({
      where: { userId },
      update: {
        // Removed maxLoadKg because it's not in the schema
        status: status || 'PENDING', 
        vehicleType: vehicleType || 'MOTORCYCLE'
      },
      create: {
        userId,
        status: status || 'PENDING',
        vehicleType: vehicleType || 'MOTORCYCLE'
      }
    })

    return NextResponse.json({ success: true, profile: riderProfile })
  } catch (error) {
    console.error('Error updating rider status:', error)
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 })
  }
}