// src/app/api/rider/orders/accept/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    // Get rider from cookie
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value
    const userRole = cookieStore.get('userRole')?.value

    if (!userId || userRole !== 'RIDER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get rider's RiderProfile (Delivery.riderId references RiderProfile, not User)
    const riderProfile = await prisma.riderProfile.findUnique({
      where: { userId: userId }
    })

    if (!riderProfile) {
      return NextResponse.json({ error: 'Rider profile not found' }, { status: 404 })
    }

    const body = await request.json()
    const { orderId } = body

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 })
    }

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

    await prisma.$transaction(async (tx) => {
      // Update order status
      await tx.order.update({
        where: { id: orderId },
        data: { status: 'ACCEPTED' }
      })

      // Update delivery with RiderProfile.id (not User.id)
      if (order.delivery) {
        await tx.delivery.update({
          where: { id: order.delivery.id },
          data: {
            riderId: riderProfile.id,  // Use RiderProfile.id!
            status: 'ASSIGNED',
            acceptedAt: new Date()
          }
        })
      } else {
        await tx.delivery.create({
          data: {
            orderId: orderId,
            riderId: riderProfile.id,  // Use RiderProfile.id!
            status: 'ASSIGNED',
            acceptedAt: new Date()
          }
        })
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error accepting order:', error)
    return NextResponse.json({ error: 'Failed to accept order', details: String(error) }, { status: 500 })
  }
}