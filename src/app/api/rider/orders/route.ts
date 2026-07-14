// src/app/api/rider/orders/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value
    const userRole = cookieStore.get('userRole')?.value

    if (!userId || userRole !== 'RIDER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get or create rider profile
    let riderProfile = await prisma.riderProfile.findUnique({
      where: { userId: userId }
    })

    // Auto-create RiderProfile if it doesn't exist
    if (!riderProfile) {
      riderProfile = await prisma.riderProfile.create({
        data: {
          userId: userId,
          vehicleType: 'MOTORCYCLE',
          maxLoadKg: 15.0,
          status: 'ONLINE'
        }
      })
    }

    // Get all pending orders with unassigned deliveries
    const pendingOrders = await prisma.order.findMany({
      where: {
        status: 'PENDING',
        delivery: {
          status: 'UNASSIGNED'
        }
      },
      include: {
        items: { include: { product: true } },
        customer: true,
        delivery: true
      },
      orderBy: { createdAt: 'desc' }
    })

    // Get orders assigned to this rider
    const myOrders = await prisma.order.findMany({
      where: {
        delivery: {
          riderId: riderProfile.id
        }
      },
      include: {
        items: { include: { product: true } },
        customer: true,
        delivery: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ pendingOrders, myOrders })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}