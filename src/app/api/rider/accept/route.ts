// src/app/api/rider/accept/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { orderId } = body

    console.log('Accepting order:', orderId)

    // First, create or find a rider
    let rider = await prisma.user.findFirst({
      where: {
        email: 'rider@tindahan.local',
        role: 'RIDER'
      }
    })

    if (!rider) {
      rider = await prisma.user.create({
        data: {
          name: 'Test Rider',
          email: 'rider@tindahan.local',
          role: 'RIDER',
          passwordHash: '$2b$10$dummyhashforrider123456789012345678901234'
        }
      })
      console.log('✅ Created rider:', rider.id)
    }

    const riderId = rider.id
    console.log('Using rider ID:', riderId)

    // Check if order is still available
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { delivery: true }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (order.status !== 'PENDING') {
      return NextResponse.json({ error: 'Order not available' }, { status: 400 })
    }

    // Just update the order status - don't try to set riderId
    await prisma.order.update({
      where: { id: orderId },
      data: { 
        status: 'ACCEPTED'
      }
    })

    console.log('✅ Order accepted successfully')

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('❌ Error accepting order:', error)
    console.error('Error code:', error.code)
    console.error('Error message:', error.message)
    return NextResponse.json({ error: 'Failed to accept order', details: error.message }, { status: 500 })
  }
}