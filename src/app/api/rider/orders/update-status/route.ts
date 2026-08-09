import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    console.log(' [API] Update order status called')
    
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value
    console.log('🔵 [API] User ID from cookie:', userId)

    if (!userId) {
      console.error(' [API] No user ID in cookie')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user || user.role !== 'RIDER') {
      console.error(' [API] Not a rider:', user?.role)
      return NextResponse.json({ error: 'Rider access required' }, { status: 403 })
    }

    const body = await request.json()
    const { orderId, status, proofUrl } = body

    console.log('🔵 [API] Order ID:', orderId)
    console.log('🔵 [API] Status:', status)
    console.log('🔵 [API] Proof URL:', proofUrl)

    if (!orderId || !status) {
      console.error(' [API] Missing required fields')
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { delivery: true }
    })

    if (!order) {
      console.error(' [API] Order not found')
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Find rider profile to verify assignment
    const riderProfile = await prisma.riderProfile.findUnique({
      where: { userId }
    })

    console.log('🔵 [API] RiderProfile:', riderProfile?.id)
    console.log('🔵 [API] Delivery riderId:', order.delivery?.riderId)

    if (!riderProfile) {
      console.error('🔴 [API] No rider profile found for user')
      return NextResponse.json({ error: 'Rider profile not found' }, { status: 403 })
    }

    if (order.delivery?.riderId !== riderProfile.id) {
      console.error('🔴 [API] Order not assigned to this rider')
      console.error('Expected:', riderProfile.id)
      console.error('Got:', order.delivery?.riderId)
      return NextResponse.json({ error: 'Not assigned to this rider' }, { status: 403 })
    }

    const amountToRemit = (order.totalAmount || order.deliveryFee || 0) - (order.riderPayout || 0)

    console.log('🔵 [API] Amount to remit:', amountToRemit)

    await prisma.user.update({
      where: { id: userId },
      data: {
        cashOnHand: { increment: amountToRemit }
      }
    })

    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'COMPLETED',
        delivery: {
          update: {
            status: 'COMPLETED',
            completedAt: new Date(),
            proofUrl: proofUrl || null
          }
        }
      }
    })

    console.log(' [API] Order marked as completed successfully!')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(' [API] Error updating order status:', error)
    return NextResponse.json({ 
      error: 'Failed to update status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}