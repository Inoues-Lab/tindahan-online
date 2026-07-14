// src/app/api/rider/orders/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function GET() {
  try {
    const user = await requireAuth(['RIDER', 'ADMIN'])
    if (user instanceof NextResponse) return user

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
          riderId: user.id
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