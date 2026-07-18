// src/app/api/rider/orders/accept/route.ts
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

    // Get rider profile
    let riderProfile = await prisma.riderProfile.findUnique({
      where: { userId: userId },
      include: { user: true }
    })

    if (!riderProfile) {
      riderProfile = await prisma.riderProfile.create({
        data: {
          userId: userId,
          vehicleType: 'MOTORCYCLE',
          maxLoadKg: 15.0,
          status: 'ONLINE'
        },
        include: { user: true }
      })
    }

    // Check cash on hand limit (₱20,000)
    const REMITTANCE_LIMIT = 20000
    const currentCashOnHand = riderProfile.user.cashOnHand || 0

    if (currentCashOnHand >= REMITTANCE_LIMIT) {
      return NextResponse.json({ 
        error: 'REMITTANCE_LIMIT_REACHED',
        message: `You have reached the remittance limit of ${REMITTANCE_LIMIT.toLocaleString()}.00. Please remit your cash on hand to the admin before accepting new orders.`,
        cashOnHand: currentCashOnHand,
        remittanceLimit: REMITTANCE_LIMIT
      }, { status: 403 })
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
      await tx.order.update({
        where: { id: orderId },
        data: { status: 'ACCEPTED' }
      })

      if (order.delivery) {
        await tx.delivery.update({
          where: { id: order.delivery.id },
          data: {
            riderId: riderProfile!.id,
            status: 'ASSIGNED',
            acceptedAt: new Date()
          }
        })
      } else {
        await tx.delivery.create({
          data: {
            orderId: orderId,
            riderId: riderProfile!.id,
            status: 'ASSIGNED',
            acceptedAt: new Date()
          }
        })
      }

      // Update rider status
      await tx.riderProfile.update({
        where: { id: riderProfile!.id },
        data: { status: 'ON_DELIVERY' }
      })
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error accepting order:', error)
    return NextResponse.json({ error: 'Failed to accept order', details: String(error) }, { status: 500 })
  }
}