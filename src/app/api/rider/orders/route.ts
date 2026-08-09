import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function GET() {
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

    const pendingOrders = await prisma.order.findMany({
      where: {
        status: 'PENDING',
        delivery: {
          status: 'UNASSIGNED'
        }
      },
      include: {
        customer: true,
        items: { include: { product: true } },
        delivery: true
      },
      orderBy: { createdAt: 'desc' }
    })

    const myOrders = await prisma.order.findMany({
      where: {
        delivery: {
          riderId: userId
        }
      },
      include: {
        customer: true,
        items: { include: { product: true } },
        delivery: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      pendingOrders,
      myOrders
    })
  } catch (error) {
    console.error('Error fetching rider orders:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}