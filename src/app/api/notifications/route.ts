import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value
    if (!userId) return NextResponse.json({ notifications: [] })

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return NextResponse.json({ notifications: [] })

    let notifications: any[] = []

    if (user.role === 'CUSTOMER') {
      const orders = await prisma.order.findMany({
        where: { userId, status: { in: ['ACCEPTED', 'OUT_FOR_DELIVERY', 'DELIVERED'] } },
        orderBy: { updatedAt: 'desc' },
        take: 10
      })
      notifications = orders.map((o) => {
        let icon = '✅'
        let message = 'Order #' + o.id.slice(-6).toUpperCase() + ' confirmed by merchant!'
        if (o.status === 'OUT_FOR_DELIVERY') { icon = '🚚'; message = 'Order #' + o.id.slice(-6).toUpperCase() + ' is out for delivery!' }
        if (o.status === 'DELIVERED') { icon = '🎉'; message = 'Order #' + o.id.slice(-6).toUpperCase() + ' delivered! Thank you!' }
        return { id: o.id, icon, message, time: o.updatedAt }
      })
    } else if (user.role === 'MERCHANT') {
      const merchant = await prisma.merchantProfile.findUnique({ where: { userId } })
      if (merchant) {
        const orders = await prisma.order.findMany({
          where: {
            items: { some: { product: { merchantId: merchant.id } } },
            status: { in: ['PENDING', 'OUT_FOR_DELIVERY', 'DELIVERED'] }
          },
          orderBy: { updatedAt: 'desc' },
          take: 10
        })
        notifications = orders.map((o) => {
          let icon = '🔔'
          let message = 'New order #' + o.id.slice(-6).toUpperCase() + ' waiting for confirmation!'
          if (o.status === 'OUT_FOR_DELIVERY') { icon = '🚚'; message = 'Order #' + o.id.slice(-6).toUpperCase() + ' is out for delivery!' }
          if (o.status === 'DELIVERED') { icon = '🎉'; message = 'Order #' + o.id.slice(-6).toUpperCase() + ' delivered!' }
          return { id: o.id, icon, message, time: o.updatedAt }
        })
      }
    } else if (user.role === 'RIDER') {
      const orders = await prisma.order.findMany({
        where: { status: { in: ['ACCEPTED', 'READY_FOR_PICKUP'] }, riderId: null },
        orderBy: { createdAt: 'desc' },
        take: 10
      })
      notifications = orders.map((o) => ({
        id: o.id,
        icon: '📦',
        message: 'Order #' + o.id.slice(-6).toUpperCase() + ' available for pickup!',
        time: o.createdAt
      }))
    }

    return NextResponse.json({ notifications })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json({ notifications: [] })
  }
}
