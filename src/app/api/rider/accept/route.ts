import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value

    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const rider = await prisma.riderProfile.findUnique({ 
      where: { userId },
      select: { id: true }
    })

    if (!rider) return NextResponse.json({ error: 'Rider profile not found' }, { status: 404 })

    const body = await request.json()
    const { orderId } = body

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 })
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { 
        status: 'OUT_FOR_DELIVERY', 
        riderId: rider.id 
      },
      include: {
        user: true,  // FIXED: Changed from 'customer' to 'user'
        items: {
          include: {
            product: true
          }
        }
      }
    })

    return NextResponse.json({ success: true, order: updatedOrder })
  } catch (error) {
    console.error('Error accepting order:', error)
    return NextResponse.json({ error: 'Failed to accept order' }, { status: 500 })
  }
}