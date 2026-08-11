import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value

    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    })

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin only' }, { status: 403 })
    }

    // Get today's date range
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Get all completed orders
    const allCompletedOrders = await prisma.order.findMany({
      where: {
        status: {
          in: ['DELIVERED', 'COMPLETED']
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    })

    // Get today's orders
    const todayOrders = await prisma.order.findMany({
      where: {
        status: {
          in: ['DELIVERED', 'COMPLETED']
        },
        createdAt: {
          gte: today,
          lt: tomorrow
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    })

    // Calculate income - using totalAmount and deliveryFee
    const todayIncome = todayOrders.reduce((sum, order) => {
      // Platform earns from delivery fees
      return sum + (order.deliveryFee || 0)
    }, 0)

    const totalIncome = allCompletedOrders.reduce((sum, order) => {
      return sum + (order.deliveryFee || 0)
    }, 0)

    // Calculate merchant earnings (product sales)
    const todayMerchantEarnings = todayOrders.reduce((sum, order) => {
      const productTotal = order.items.reduce((itemSum, item) => {
        return itemSum + (item.price * item.quantity)
      }, 0)
      return sum + productTotal
    }, 0)

    const totalMerchantEarnings = allCompletedOrders.reduce((sum, order) => {
      const productTotal = order.items.reduce((itemSum, item) => {
        return itemSum + (item.price * item.quantity)
      }, 0)
      return sum + productTotal
    }, 0)

    // Count statistics
    const totalOrders = await prisma.order.count()
    const totalUsers = await prisma.user.count()
    const totalMerchants = await prisma.merchantProfile.count()
    const totalRiders = await prisma.riderProfile.count()

    return NextResponse.json({
      todayIncome,
      totalIncome,
      todayMerchantEarnings,
      totalMerchantEarnings,
      totalOrders,
      totalUsers,
      totalMerchants,
      totalRiders,
      todayOrdersCount: todayOrders.length
    })
  } catch (error) {
    console.error('Error fetching income:', error)
    return NextResponse.json({ error: 'Failed to fetch income data' }, { status: 500 })
  }
}