import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const merchant = await prisma.merchantProfile.findUnique({
      where: { userId },
      select: { id: true }
    })
    if (!merchant) return NextResponse.json({ error: 'Merchant profile not found' }, { status: 404 })

    const orders = await prisma.order.findMany({
      where: {
        status: { not: 'CANCELLED' },
        items: { some: { product: { merchantId: merchant.id } } }
      },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' }
    })

    const sales = orders.map((order) => {
      const amount = (order.items || [])
        .filter((i: any) => i.product?.merchantId === merchant.id)
        .reduce((s: number, i: any) => s + (i.price || i.product?.price || 0) * (i.quantity || 0), 0)
      return {
        id: order.id,
        createdAt: order.createdAt,
        serviceType: order.serviceType,
        status: order.status,
        amount
      }
    }).filter((s: any) => s.amount > 0)

    return NextResponse.json({ sales })
  } catch (error) {
    console.error('Error fetching merchant income:', error)
    return NextResponse.json({ error: 'Failed to fetch income' }, { status: 500 })
  }
}
