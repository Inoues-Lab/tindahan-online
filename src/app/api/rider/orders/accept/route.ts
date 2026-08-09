import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    console.log('🔵 [API] Accept Order called')
    
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value
    console.log('🔵 [API] User ID from cookie:', userId)

    if (!userId) {
      console.error(' [API] No user ID in cookie')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user || user.role !== 'RIDER') {
      console.error('🔴 [API] Not a rider:', user?.role)
      return NextResponse.json({ error: 'Rider access required' }, { status: 403 })
    }

    // Read raw body first
    const rawBody = await request.text()
    console.log(' [API] Raw body:', rawBody)
    
    let body
    try {
      body = JSON.parse(rawBody)
    } catch (e) {
      console.error(' [API] JSON Parse Error:', e)
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }
    
    console.log('🔵 [API] Parsed body:', body)
    const { orderId } = body

    if (!orderId) {
      console.error('🔴 [API] Missing orderId! Body was:', body)
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    console.log('🔵 [API] Processing orderId:', orderId)

    // Check rider's cash on hand
    const rider = await prisma.user.findUnique({ where: { id: userId } })
    const REMITTANCE_LIMIT = 20000

    if (rider && rider.cashOnHand >= REMITTANCE_LIMIT) {
      console.log('🟡 [API] Remittance limit reached')
      return NextResponse.json({
        error: 'REMITTANCE_LIMIT_REACHED',
        cashOnHand: rider.cashOnHand,
        remittanceLimit: REMITTANCE_LIMIT
      }, { status: 403 })
    }

    // Find the RiderProfile for this user
    const riderProfile = await prisma.riderProfile.findUnique({
      where: { userId }
    })

    let finalRiderId = riderProfile?.id

    if (!riderProfile) {
      console.log('🟡 [API] No rider profile found, creating one...')
      const newProfile = await prisma.riderProfile.create({
        data: { userId }
      })
      finalRiderId = newProfile.id
      console.log('🟢 [API] Created rider profile:', newProfile.id)
    }

    console.log('🔵 [API] Updating order with riderId:', finalRiderId)

    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'ACCEPTED',
        delivery: {
          update: {
            status: 'ASSIGNED',
            riderId: finalRiderId,
            acceptedAt: new Date()
          }
        }
      }
    })

    console.log(' [API] Order accepted successfully!')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(' [API] Error accepting order:', error)
    return NextResponse.json({ 
      error: 'Failed to accept order',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}