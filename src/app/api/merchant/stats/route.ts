import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value

    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const merchant = await prisma.merchantProfile.findUnique({ 
      where: { userId },
      select: { id: true }
    })

    if (!merchant) return NextResponse.json({ error: 'Merchant not found' }, { status: 404 })

    // 1. Count Products
    const totalProducts = await prisma.product.count({
      where: { merchantId: merchant.id }
    })

    // 2. Find Orders containing this merchant's products
    const products = await prisma.product.findMany({
      where: { merchantId: merchant.id },
      select: { id: true }
    })
    const productIds = products.map(p => p.id)

    if (productIds.length === 0) {
      return NextResponse.json({ totalProducts: 0, totalSales: 0, pendingOrders: 0 })
    }

    const orderItems = await prisma.orderItem.findMany({
      where: { productId: { in: productIds } },
      include: { order: true }
    })

    let totalSales = 0
    let pendingOrders = 0
    const uniqueOrderIds = new Set()

    orderItems.forEach(item => {
      // FIX: Convert to string to avoid TypeScript enum errors
      const status = String(item.order.status)

      // Calculate Sales (Check for common "Success" statuses)
      if (status === 'COMPLETED' || status === 'DELIVERED' || status === 'ACCEPTED') {
        totalSales += (item.price * item.quantity)
      }

      // Count Pending/Active Orders
      if (['PENDING', 'CONFIRMED', 'PREPARING', 'ACCEPTED', 'IN_PROGRESS', 'READY_FOR_PICKUP'].includes(status)) {
        if (!uniqueOrderIds.has(item.orderId)) {
          uniqueOrderIds.add(item.orderId)
          pendingOrders++
        }
      }
    })

    return NextResponse.json({ totalProducts, totalSales, pendingOrders })

  } catch (error) {
    console.error('Stats Error:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}