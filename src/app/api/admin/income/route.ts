import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Get today's date
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Get all completed orders today
    const todayOrders = await prisma.order.findMany({
      where: {
        status: 'COMPLETED',
        createdAt: {
          gte: today,
          lt: tomorrow
        }
      },
      include: {
        items: { include: { product: true } }
      }
    })

    // Get all completed orders (all time)
    const allCompletedOrders = await prisma.order.findMany({
      where: {
        status: 'COMPLETED'
      },
      include: {
        items: { include: { product: true } }
      }
    })

    // Calculate income
    const todayIncome = todayOrders.reduce((sum, order) => {
      return sum + (order.platformIncome || 0) + (order.deliveryFee || 0) * 0.20
    }, 0)

    const totalIncome = allCompletedOrders.reduce((sum, order) => {
      return sum + (order.platformIncome || 0) + (order.deliveryFee || 0) * 0.20
    }, 0)

    const todayRevenue = todayOrders.reduce((sum, order) => {
      return sum + (order.totalAmount || 0)
    }, 0)

    const totalRevenue = allCompletedOrders.reduce((sum, order) => {
      return sum + (order.totalAmount || 0)
    }, 0)

    return NextResponse.json({
      todayIncome,
      totalIncome,
      todayRevenue,
      totalRevenue,
      todayOrders: todayOrders.length,
      totalOrders: allCompletedOrders.length
    })
  } catch (error) {
    console.error('Error fetching income:', error)
    return NextResponse.json({ error: 'Failed to fetch income' }, { status: 500 })
  }
}