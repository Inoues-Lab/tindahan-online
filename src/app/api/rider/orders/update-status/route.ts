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
    const { orderId, status, proofUrl } = body

    if (!orderId || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { delivery: true }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (order.delivery?.riderId !== userId) {
      return NextResponse.json({ error: 'Not assigned to this rider' }, { status: 403 })
    }

    const amountToRemit = (order.totalAmount || order.deliveryFee || 0) - (order.riderPayout || 0)

    await prisma.user.update({
      where: { id: userId },
      data: {
        cashOnHand: { increment: amountToRemit }
      }
    })

    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'COMPLETED',
        delivery: {
          update: {
            status: 'COMPLETED',
            completedAt: new Date(),
            proofUrl: proofUrl || null
          }
        }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating order status:', error)
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 })
  }
}