// src/app/api/rider/update-status/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { orderId, status } = body

    console.log('Updating order status:', orderId, 'to', status)

    // Just update the order status directly
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: status === 'COMPLETED' ? 'COMPLETED' : 'OUT_FOR_DELIVERY'
      }
    })

    console.log('✅ Order status updated successfully')

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('❌ Error updating status:', error)
    console.error('Error code:', error.code)
    console.error('Error message:', error.message)
    return NextResponse.json({ error: 'Failed to update status', details: error.message }, { status: 500 })
  }
}