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
      // Calculate Sales (Only for Completed/Delivered orders)
      if (item.order.status === 'COMPLETED' || item.order.status === 'DELIVERED') {
        totalSales += (item.price * item.quantity)
      }

      // Count Pending Orders (PENDING, CONFIRMED, PREPARING)
      if (['PENDING', 'CONFIRMED', 'PREPARING'].includes(item.order.status)) {
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