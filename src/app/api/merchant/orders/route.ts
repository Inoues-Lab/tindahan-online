import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const merchant = await prisma.merchantProfile.findUnique({ where: { userId } })
    if (!merchant) return NextResponse.json({ error: 'Merchant profile not found' }, { status: 403 })

    const orders = await prisma.order.findMany({
      where: {
        items: { some: { product: { merchantId: merchant.id } } }
      },
      include: {
        user: { select: { name: true, phone: true, address: true } },
        items: { include: { product: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ orders })
  } catch (error) {
    console.error('Error fetching merchant orders:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const merchant = await prisma.merchantProfile.findUnique({ where: { userId } })
    if (!merchant) return NextResponse.json({ error: 'Merchant profile not found' }, { status: 403 })

    const body = await request.json()
    const orderId = body.orderId || body.id
    const action = body.action || body.status

    if (!orderId || !action) {
      return NextResponse.json({ error: 'Missing orderId or action' }, { status: 400 })
    }

    // CONFIRM ORDER
    if (action === 'ACCEPTED' || action === 'CONFIRM' || action === 'CONFIRMED') {
      const order = await prisma.order.update({
        where: { id: orderId },
        data: { status: 'ACCEPTED' }
      })
      return NextResponse.json({ success: true, order, message: 'Order confirmed! ✅' })
    }

    // CANCEL WITH REASON (required!)
    if (action === 'CANCELLED' || action === 'CANCEL') {
      const reason = body.reason || body.cancelReason
      if (!reason) {
        return NextResponse.json({ error: 'Cancellation reason is required!' }, { status: 400 })
      }
      const order = await prisma.order.update({
        where: { id: orderId },
        data: { status: 'CANCELLED', cancelReason: reason }
      })
      return NextResponse.json({ success: true, order, message: 'Order cancelled.' })
    }

    // REVISE ORDER (out of stock, etc.)
    if (action === 'REVISE') {
      const note = body.note || body.revisionNote
      if (!note) {
        return NextResponse.json({ error: 'Revision note is required!' }, { status: 400 })
      }

      const items = body.items || []
      for (const it of items) {
        if (!it.id) continue
        if (!it.quantity || it.quantity <= 0) {
          await prisma.orderItem.delete({ where: { id: it.id } })
        } else {
          await prisma.orderItem.update({ where: { id: it.id }, data: { quantity: it.quantity } })
        }
      }

      const updated = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } })
      const itemsTotal = (updated?.items || []).reduce((s: number, i: any) => s + (i.price || 0) * (i.quantity || 0), 0)
      const newTotal = body.newTotal ? parseFloat(body.newTotal) : itemsTotal + (updated?.deliveryFee || 0)

      const order = await prisma.order.update({
        where: { id: orderId },
        data: { status: 'REVISED', revisionNote: note, totalAmount: newTotal }
      })
      return NextResponse.json({ success: true, order, message: 'Revision sent to customer! 📝' })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json({ error: 'Error updating order' }, { status: 500 })
  }
}
