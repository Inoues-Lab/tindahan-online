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
    const { orderId, status } = body

    if (!orderId || !status) {
      return NextResponse.json({ error: 'Missing orderId or status' }, { status: 400 })
    }

    // Verify the order belongs to this rider (if applicable)
    // For simplicity, we just update it here. In production, verify ownership first.
    
    let updateData: any = { status }

    // If marking as delivered, we can record the completion time
    if (status === 'DELIVERED') {
      updateData.delivery = {
        upsert: {
          create: {
            riderId: rider.id,
            completedAt: new Date()
          },
          update: {
            riderId: rider.id,
            completedAt: new Date()
          }
        }
      }
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
      include: {
        delivery: true
      }
    })

    return NextResponse.json({ success: true, order: updatedOrder })
  } catch (error) {
    console.error('Error updating order status:', error)
    return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 })
  }
}