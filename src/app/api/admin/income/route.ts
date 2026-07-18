// src/app/api/admin/income/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const userRole = cookieStore.get('userRole')?.value

    if (userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orders = await prisma.order.findMany()

    // Total Revenue = Sum of all order totals
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0)

    // Platform Income = Sum of platformIncome from all orders
    const platformIncome = orders.reduce((sum, order) => 
      sum + (order.platformIncome || 0), 0
    )

    // Pending Remittances = Total cash on hand of all riders
    const riders = await prisma.user.findMany({
      where: { role: 'RIDER' },
      select: { cashOnHand: true }
    })
    
    const pendingRemittances = riders.reduce((sum, rider) => 
      sum + (rider.cashOnHand || 0), 0
    )

    return NextResponse.json({
      totalRevenue,
      platformIncome,
      pendingRemittances
    })
  } catch (error) {
    console.error('Error fetching income:', error)
    return NextResponse.json({ error: 'Failed to fetch income data' }, { status: 500 })
  }
}