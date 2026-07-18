// src/app/api/rider/orders/update-status/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value
    const userRole = cookieStore.get('userRole')?.value

    if (!userId || userRole !== 'RIDER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let riderProfile = await prisma.riderProfile.findUnique({
      where: { userId: userId }
    })

    if (!riderProfile) {
      riderProfile = await prisma.riderProfile.create({
        data: {
          userId: userId,
          vehicleType: 'MOTORCYCLE',
          maxLoadKg: 15.0,
          status: 'ON_DELIVERY'
        }
      })
    }

    const body = await request.json()
    const { orderId, status, proofUrl } = body

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 })
    }

    if (status === 'COMPLETED' && !proofUrl) {
      return NextResponse.json({ error: 'Photo proof is required' }, { status: 400 })
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { delivery: true }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (order.delivery?.riderId !== riderProfile.id) {
      return NextResponse.json({ error: 'Not assigned to this order' }, { status: 403 })
    }

    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: { status }
      })

      if (order.delivery) {
        await tx.delivery.update({
          where: { id: order.delivery.id },
          data: {
            status: status === 'COMPLETED' ? 'COMPLETED' : 'IN_PROGRESS',
            ...(proofUrl && { proofUrl, completedAt: new Date() })
          }
        })
      }

      if (status === 'COMPLETED') {
        await tx.riderProfile.update({
          where: { id: riderProfile.id },
          data: { status: 'ONLINE' }
        })

        // Calculate what rider needs to remit to admin:
        // Total order amount MINUS rider's earnings
        const amountToRemit = order.totalAmount - order.riderPayout

        // Add to rider's cash on hand (money to remit to admin)
        await tx.user.update({
          where: { id: userId },
          data: {
            cashOnHand: { increment: amountToRemit }
          }
        })
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating status:', error)
    return NextResponse.json({ error: 'Failed to update status', details: String(error) }, { status: 500 })
  }
}