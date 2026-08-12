import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value

    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin only' }, { status: 403 })
    }

    const totalUsers = await prisma.user.count()
    const totalMerchants = await prisma.merchantProfile.count()
    const totalRiders = await prisma.riderProfile.count()
    const totalOrders = await prisma.order.count()
    const totalProducts = await prisma.product.count()

    return NextResponse.json({
      totalUsers,
      totalMerchants,
      totalRiders,
      totalOrders,
      totalProducts
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}