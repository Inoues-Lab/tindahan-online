// src/app/api/rider/accept/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value

    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const { orderId } = body

    console.log('Accepting order:', orderId)

    // Update order status to ACCEPTED
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'ACCEPTED'
      },
      include: {
        items: {
          include: {
            product: true
          }
        },
        customer: true
      }
    })

    console.log('Order accepted:', updatedOrder)

    return NextResponse.json({ 
      success: true, 
      order: updatedOrder 
    })
  } catch (error) {
    console.error('Error accepting order:', error)
    return NextResponse.json({ error: 'Failed to accept order' }, { status: 500 })
  }
}