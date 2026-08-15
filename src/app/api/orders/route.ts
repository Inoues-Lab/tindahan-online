import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: { include: { product: true } },
        rider: { include: { user: { select: { name: true } } } }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ orders })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const orderId = body.orderId || body.id
    const action = body.action

    if (!orderId || !action) {
      return NextResponse.json({ error: 'Missing orderId or action' }, { status: 400 })
    }

    const existing = await prisma.order.findUnique({ where: { id: orderId } })
    if (!existing || existing.userId !== userId) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // CUSTOMER ACCEPTS THE REVISED ORDER
    if (action === 'ACCEPT_REVISION') {
      const order = await prisma.order.update({
        where: { id: orderId },
        data: { status: 'ACCEPTED' }
      })
      return NextResponse.json({ success: true, order, message: 'Revised order accepted! ✅' })
    }

    // CUSTOMER REJECTS REVISION (cancels)
    if (action === 'REJECT_REVISION') {
      const order = await prisma.order.update({
        where: { id: orderId },
        data: { status: 'CANCELLED', cancelReason: body.reason || 'Customer rejected the revision' }
      })
      return NextResponse.json({ success: true, order, message: 'Order cancelled.' })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json({ error: 'Error updating order' }, { status: 500 })
  }
}
