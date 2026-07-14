// src/app/api/rider/orders/accept/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const rider = await requireAuth(['RIDER'])
    if (rider instanceof NextResponse) return rider

    const body = await request.json()
    const { orderId } = body

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 })
    }

    // Check if order is still pending
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { delivery: true }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (order.status !== 'PENDING') {
      return NextResponse.json({ error: 'Order already taken' }, { status: 400 })
    }

    // Create or update delivery assignment
    await prisma.$transaction(async (tx) => {
      // Update order status
      await tx.order.update({
        where: { id: orderId },
        data: { status: 'ACCEPTED' }
      })

      // Create delivery record
      if (order.delivery) {
        await tx.delivery.update({
          where: { id: order.delivery.id },
          data: {
            riderId: rider.id,
            status: 'ASSIGNED',
            acceptedAt: new Date()
          }
        })
      } else {
        await tx.delivery.create({
          data: {
            orderId: orderId,
            riderId: rider.id,
            status: 'ASSIGNED',
            acceptedAt: new Date()
          }
        })
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error accepting order:', error)
    return NextResponse.json({ error: 'Failed to accept order' }, { status: 500 })
  }
}