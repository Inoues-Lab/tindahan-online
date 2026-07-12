// src/app/api/orders/[orderID]/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orderID: string }> }
) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value

    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Await params in Next.js 15 - use orderID (capital ID to match folder name)
    const { orderID } = await params

    const order = await prisma.order.findUnique({
      where: { id: orderID },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (order.customerId !== userId) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    return NextResponse.json({ order })
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 })
  }
}