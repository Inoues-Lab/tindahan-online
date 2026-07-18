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

    // Get or create rider profile
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

    // Only COMPLETED status requires proof
    if (status === 'COMPLETED' && !proofUrl) {
      return NextResponse.json({ error: 'Photo proof is required to mark as delivered' }, { status: 400 })
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { delivery: true }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Verify this rider owns the delivery
    if (order.delivery?.riderId !== riderProfile.id) {
      return NextResponse.json({ error: 'You are not assigned to this order' }, { status: 403 })
    }

    await prisma.$transaction(async (tx) => {
      // Update order status
      await tx.order.update({
        where: { id: orderId },
        data: { status: status }
      })

      // Update delivery with proof if provided
      if (order.delivery) {
        const updateData: any = {
          status: status === 'COMPLETED' ? 'COMPLETED' : 'IN_PROGRESS'
        }

        if (proofUrl) {
          updateData.proofUrl = proofUrl
          updateData.completedAt = new Date()
        }

        await tx.delivery.update({
          where: { id: order.delivery.id },
          data: updateData
        })
      }

      // If completed, update rider status back to ONLINE and add to cash on hand
      if (status === 'COMPLETED') {
        await tx.riderProfile.update({
          where: { id: riderProfile.id },
          data: {
            status: 'ONLINE'
          }
        })

        // Add delivery fee to rider's cash on hand
        await tx.user.update({
          where: { id: userId },
          data: {
            cashOnHand: {
              increment: order.riderPayout
            }
          }
        })
      } else {
        // Update rider status to ON_DELIVERY
        await tx.riderProfile.update({
          where: { id: riderProfile.id },
          data: { status: 'ON_DELIVERY' }
        })
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating order status:', error)
    return NextResponse.json({ error: 'Failed to update status', details: String(error) }, { status: 500 })
  }
}