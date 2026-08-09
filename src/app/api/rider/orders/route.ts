import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    console.log('🔵 [API] Fetching rider orders...')
    
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value
    console.log(' [API] User ID:', userId)

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user || user.role !== 'RIDER') {
      return NextResponse.json({ error: 'Rider access required' }, { status: 403 })
    }

    // Find the RiderProfile for this user
    const riderProfile = await prisma.riderProfile.findUnique({
      where: { userId }
    })
    
    console.log(' [API] RiderProfile:', riderProfile?.id)

    // PENDING orders = Orders with status PENDING and delivery UNASSIGNED
    const pendingOrders = await prisma.order.findMany({
      where: {
        status: 'PENDING',
        delivery: {
          status: 'UNASSIGNED'
        }
      },
      include: {
        customer: true,
        items: { include: { product: true } },
        delivery: true
      },
      orderBy: { createdAt: 'desc' }
    })

    console.log('🔵 [API] Pending orders count:', pendingOrders.length)

    // MY ORDERS = All orders assigned to this rider (ACCEPTED, IN_PROGRESS, COMPLETED, etc.)
    let myOrders: any[] = []
    
    if (riderProfile) {
      myOrders = await prisma.order.findMany({
        where: {
          delivery: {
            riderId: riderProfile.id
          }
        },
        include: {
          customer: true,
          items: { include: { product: true } },
          delivery: true
        },
        orderBy: { createdAt: 'desc' }
      })
    } else {
      console.log('🟡 [API] No rider profile found, myOrders will be empty')
    }
    
    console.log('🔵 [API] My orders count:', myOrders.length)
    console.log(' [API] My orders:', myOrders.map((o: any) => ({ id: o.id, status: o.status })))

    return NextResponse.json({
      pendingOrders,
      myOrders
    })
  } catch (error) {
    console.error('Error fetching rider orders:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}