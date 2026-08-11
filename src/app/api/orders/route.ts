import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value

    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // If ADMIN, fetch ALL orders
    if (user.role === 'ADMIN') {
      const orders = await prisma.order.findMany({
        include: { 
          user: true,  // FIXED: Changed from 'customer' to 'user'
          items: { 
            include: { 
              product: true 
            } 
          } 
        },
        orderBy: { createdAt: 'desc' }
      })
      return NextResponse.json({ orders })
    }

    // If CUSTOMER, fetch only their orders
    if (user.role === 'CUSTOMER') {
      const orders = await prisma.order.findMany({
        where: { userId },
        include: { 
          items: { 
            include: { 
              product: true 
            } 
          } 
        },
        orderBy: { createdAt: 'desc' }
      })
      return NextResponse.json({ orders })
    }

    // If MERCHANT, fetch orders containing their products
    if (user.role === 'MERCHANT') {
      const merchant = await prisma.merchantProfile.findUnique({
        where: { userId }
      })

      if (!merchant) {
        return NextResponse.json({ error: 'Merchant profile not found' }, { status: 404 })
      }

      const products = await prisma.product.findMany({
        where: { merchantId: merchant.id },
        select: { id: true }
      })

      const productIds = products.map(p => p.id)

      if (productIds.length === 0) {
        return NextResponse.json({ orders: [] })
      }

      const orderItems = await prisma.orderItem.findMany({
        where: { productId: { in: productIds } },
        select: { orderId: true },
        distinct: ['orderId']
      })

      const orderIds = orderItems.map(item => item.orderId)

      if (orderIds.length === 0) {
        return NextResponse.json({ orders: [] })
      }

      const orders = await prisma.order.findMany({
        where: { id: { in: orderIds } },
        include: { 
          user: true,  // FIXED: Changed from 'customer' to 'user'
          items: { 
            include: { 
              product: true 
            } 
          } 
        },
        orderBy: { createdAt: 'desc' }
      })

      return NextResponse.json({ orders })
    }

    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}