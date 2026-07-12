// src/app/api/rider/update-status/route.ts
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
    const { orderId, status, cashOnHand } = body

    console.log('🚀 Update status request received:')
    console.log('  Order ID:', orderId)
    console.log('  New Status:', status)
    console.log('  Cash On Hand:', cashOnHand)
    console.log('  Rider ID:', userId)

    // Step 1: Update order status
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: status }
    })

    console.log('✅ Order status updated to:', updatedOrder.status)

    // Step 2: If COMPLETED, update rider's cash
    if (status === 'COMPLETED' && cashOnHand) {
      console.log('💰 Updating rider cash on hand...')
      
      // Get current rider
      const rider = await prisma.user.findUnique({
        where: { id: userId }
      })

      if (!rider) {
        console.log('❌ Rider not found')
        return NextResponse.json({ error: 'Rider not found' }, { status: 404 })
      }

      const currentCash = rider.cashOnHand || 0
      const newCash = currentCash + cashOnHand

      console.log('  Current cash:', currentCash)
      console.log('  Adding:', cashOnHand)
      console.log('  New total:', newCash)

      // Update rider's cash
      const updatedRider = await prisma.user.update({
        where: { id: userId },
        data: { cashOnHand: newCash }
      })

      console.log('✅ Rider cash updated successfully!')
      console.log('  New cash on hand:', updatedRider.cashOnHand)

      return NextResponse.json({ 
        success: true, 
        order: updatedOrder,
        riderCash: updatedRider.cashOnHand
      })
    }

    return NextResponse.json({ success: true, order: updatedOrder })
  } catch (error: any) {
    console.error('❌ Error in update-status:', error)
    return NextResponse.json({ 
      error: 'Failed to update order status',
      message: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}