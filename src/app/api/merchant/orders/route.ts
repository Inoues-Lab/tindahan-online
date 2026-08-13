import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

// GET: Fetch orders that contain this merchant's products
export async function GET() {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const merchant = await prisma.merchantProfile.findUnique({ where: { userId } })
    if (!merchant) return NextResponse.json({ error: 'Merchant profile not found' }, { status: 403 })

    const orders = await prisma.order.findMany({
      where: {
        items: {
          some: {
            product: { merchantId: merchant.id }
          }
        }
      },
      include: {
        user: {
          select: { name: true, phone: true, address: true }
        },
        items: {
          include: { product: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ orders })
  } catch (error) {
    console.error('Error fetching merchant orders:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

// 🔑 Update order status (Confirm / Cancel)
async function updateOrder(request: Request) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const merchant = await prisma.merchantProfile.findUnique({ where: { userId } })
    if (!merchant) return NextResponse.json({ error: 'Merchant profile not found' }, { status: 403 })

    const body = await request.json()

    // Accept any field name the page might send
    // Accept any field name the page might send
    const orderId = body.orderId || body.id
    let status = (body.status || body.action || body.newStatus || '').toString().toUpperCase()

    // 🔑 Translate the page's words into valid enum values
    if (status === 'CONFIRM' || status === 'CONFIRMED') status = 'ACCEPTED'
    if (status === 'CANCEL') status = 'CANCELLED'

    // 🔑 Only allow valid enum values (prevents Prisma 500 errors)
    const validStatuses = [
      'PENDING', 'ACCEPTED', 'IN_PROGRESS', 'READY_FOR_PICKUP',
      'OUT_FOR_DELIVERY', 'DELIVERED', 'COMPLETED', 'CANCELLED'
    ]

    if (!orderId || !status) {
      return NextResponse.json({ error: 'Missing orderId or status' }, { status: 400 })
    }

    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: `Invalid status: ${status}` }, { status: 400 })
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status }
    })

    return NextResponse.json({
      success: true,
      order,
      message: `Order ${status.toLowerCase()}! ✅`
    })
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json({ error: 'Error updating order' }, { status: 500 })
  }
}

// 🔑 Support ALL methods so 405 can never happen again!
export const POST = updateOrder
export const PATCH = updateOrder
export const PUT = updateOrder