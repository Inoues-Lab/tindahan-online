import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user || user.role !== 'RIDER') {
      return NextResponse.json({ error: 'Rider access required' }, { status: 403 })
    }

    const body = await request.json()
    const { orderId } = body

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 })
    }

    const rider = await prisma.user.findUnique({ where: { id: userId } })
    const REMITTANCE_LIMIT = 20000

    if (rider && rider.cashOnHand >= REMITTANCE_LIMIT) {
      return NextResponse.json({
        error: 'REMITTANCE_LIMIT_REACHED',
        cashOnHand: rider.cashOnHand,
        remittanceLimit: REMITTANCE_LIMIT
      }, { status: 403 })
    }

    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'ACCEPTED',
        delivery: {
          update: {
            status: 'ASSIGNED',
            riderId: userId,
            acceptedAt: new Date()
          }
        }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error accepting order:', error)
    return NextResponse.json({ error: 'Failed to accept order' }, { status: 500 })
  }
}