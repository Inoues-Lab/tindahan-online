import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (user?.role !== 'ADMIN' && user?.role !== 'SUB_ADMIN') {
      return NextResponse.json({ error: 'Admin access only' }, { status: 403 })
    }

    const orders = await prisma.order.findMany({
      include: {
        user: { select: { name: true, phone: true, address: true } },
        items: { include: { product: true } },
        rider: { include: { user: { select: { name: true, phone: true } } } }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ orders })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}
