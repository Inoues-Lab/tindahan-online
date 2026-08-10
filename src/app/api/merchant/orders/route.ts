import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

// GET: Fetch orders for the merchant
export async function GET() {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value

    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Get Merchant Profile
    const merchant = await prisma.merchantProfile.findUnique({ 
      where: { userId },
      select: { id: true }
    })
    
    if (!merchant) {
      return NextResponse.json({ error: 'Merchant profile not found' }, { status: 404 })
    }

    // Find all products belonging to this merchant
    const products = await prisma.product.findMany({
      where: { merchantId: merchant.id },
      select: { id: true }
    })

    const productIds = products.map(p => p.id)

    if (productIds.length === 0) {
      return NextResponse.json({ orders: [] })
    }

    // Find OrderItems containing these products
    const orderItems = await prisma.orderItem.findMany({
      where: { 
        productId: { 
          in: productIds 
        } 
      },
      select: { orderId: true },
      distinct: ['orderId']
    })

    const orderIds = orderItems.map(item => item.orderId)

    if (orderIds.length === 0) {
      return NextResponse.json({ orders: [] })
    }

    // Fetch the actual Orders
    const orders = await prisma.order.findMany({
      where: { 
        id: { 
          in: orderIds 
        } 
      },
      include: {
        items: {
          include: { 
            product: true 
          }
        }
      },
      orderBy: { 
        createdAt: 'desc' 
      }
    })

    return NextResponse.json({ orders })
  } catch (error) {
    console.error('Error fetching merchant orders:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

// POST: Update Order Status
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value

    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { orderId, status } = body

    if (!orderId || !status) {
      return NextResponse.json({ error: 'Missing orderId or status' }, { status: 400 })
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status }
    })

    return NextResponse.json({ success: true, order: updatedOrder })
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}