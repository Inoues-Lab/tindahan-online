import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const rider = await prisma.riderProfile.findUnique({
      where: { userId },
      select: { id: true }
    })
    if (!rider) return NextResponse.json({ error: 'Rider profile not found' }, { status: 404 })

    const deliveries = await prisma.order.findMany({
      where: {
        riderId: rider.id,
        status: { in: ['DELIVERED', 'COMPLETED'] }
      },
      select: {
        id: true,
        deliveryFee: true,
        totalAmount: true,
        serviceType: true,
        deliveryAddress: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ deliveries })
  } catch (error) {
    console.error('Error fetching rider income:', error)
    return NextResponse.json({ error: 'Failed to fetch income' }, { status: 500 })
  }
}
