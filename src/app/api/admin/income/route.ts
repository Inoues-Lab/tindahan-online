// src/app/api/admin/income/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const userRole = cookieStore.get('userRole')?.value

    if (userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Get all completed orders
    const completedOrders = await prisma.order.findMany({
      where: { status: 'COMPLETED' },
      select: {
        totalAmount: true,
        deliveryFee: true,
        riderPayout: true,
        createdAt: true
      }
    })

    // Get all riders with their cash on hand
    const riders = await prisma.user.findMany({
      where: { role: 'RIDER' },
      select: {
        id: true,
        name: true,
        cashOnHand: true,
        remittanceLimit: true
      }
    })

    // Calculate totals
    const totalRevenue = completedOrders.reduce((sum, order) => sum + order.totalAmount, 0)
    const totalDeliveryFees = completedOrders.reduce((sum, order) => sum + order.deliveryFee, 0)
    const totalRiderPayouts = completedOrders.reduce((sum, order) => sum + (order.riderPayout || 0), 0)
    const totalRiderCashOnHand = riders.reduce((sum, rider) => sum + (rider.cashOnHand || 0), 0)

    // Calculate pending remittances (riders' cash on hand)
    const pendingRemittances = totalRiderCashOnHand

    // Calculate platform income (delivery fees + product margins)
    const platformIncome = totalDeliveryFees // You can add product margins if needed

    // Get orders by status
    const pendingOrders = await prisma.order.count({ where: { status: 'PENDING' } })
    const acceptedOrders = await prisma.order.count({ where: { status: 'ACCEPTED' } })
    const outForDeliveryOrders = await prisma.order.count({ where: { status: 'OUT_FOR_DELIVERY' } })
    const completedOrdersCount = await prisma.order.count({ where: { status: 'COMPLETED' } })

    return NextResponse.json({
      totalRevenue,
      totalDeliveryFees,
      totalRiderPayouts,
      pendingRemittances,
      platformIncome,
      riders,
      ordersStats: {
        pending: pendingOrders,
        accepted: acceptedOrders,
        outForDelivery: outForDeliveryOrders,
        completed: completedOrdersCount,
        total: completedOrders.length
      }
    })
  } catch (error) {
    console.error('Error fetching income data:', error)
    return NextResponse.json({ error: 'Failed to fetch income data' }, { status: 500 })
  }
}