import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value

    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const rider = await prisma.riderProfile.findUnique({ 
      where: { userId },
      select: { id: true }
    })

    if (!rider) return NextResponse.json({ error: 'Rider profile not found' }, { status: 404 })

    const availableOrders = await prisma.order.findMany({
      where: { 
        status: 'READY_FOR_PICKUP',
        riderId: null
      },
      include: { 
        items: { 
          include: { product: true } 
        } 
      },
      orderBy: { createdAt: 'desc' }
    })

    const myOrders = await prisma.order.findMany({
      where: { 
        riderId: rider.id,
        status: { 
          in: ['OUT_FOR_DELIVERY', 'ACCEPTED', 'READY_FOR_PICKUP'] 
        }
      },
      include: { 
        items: { 
          include: { product: true } 
        } 
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ availableOrders, myOrders })
  } catch (error) {
    console.error('Error fetching rider orders:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

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
    const { orderId, action } = body

    let updateData: any = {}

    if (action === 'ACCEPT') {
      updateData = { 
        status: 'OUT_FOR_DELIVERY', 
        riderId: rider.id 
      }
    } else if (action === 'DELIVER') {
      updateData = { 
        status: 'DELIVERED' 
      }
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: updateData
    })

    return NextResponse.json({ success: true, order: updatedOrder })
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}