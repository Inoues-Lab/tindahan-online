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

    // Get pending orders (with UNASSIGNED delivery)
    const pendingOrders = await prisma.order.findMany({
      where: {
        status: 'PENDING',
        delivery: {
          status: 'UNASSIGNED'
        }
      },
      include: {
        customer: true,
        items: { include: { product: true } },
        delivery: true
      },
      orderBy: { createdAt: 'desc' }
    })

    // Get my accepted orders
    const myOrders = await prisma.order.findMany({
      where: {
        delivery: {
          riderId: userId
        }
      },
      include: {
        customer: true,
        items: { include: { product: true } },
        delivery: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      pendingOrders,
      myOrders
    })
  } catch (error) {
    console.error('Error fetching rider orders:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}