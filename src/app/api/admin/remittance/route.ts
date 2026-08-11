import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

// GET: Fetch riders with pending remittances (simplified)
export async function GET() {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value

    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access only' }, { status: 403 })
    }

    // Fetch all riders. 
    // Note: Since 'cashOnHand' isn't in the schema, we just list all riders 
    // and you can calculate their earnings from completed orders later if needed.
    const riders = await prisma.user.findMany({
      where: {
        role: 'RIDER'
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        riderProfile: {
          select: {
            status: true,
            vehicleType: true
          }
        }
      }
    })

    // Calculate total earnings for each rider from completed orders
    const ridersWithEarnings = await Promise.all(
      riders.map(async (rider) => {
        const completedOrders = await prisma.order.count({
          where: {
            riderId: rider.riderProfile ? rider.id : undefined, // This logic might need adjustment based on your schema relations
            status: 'DELIVERED'
          }
        })
        
        // For now, just returning basic info. 
        // You can add complex earnings calculation here if you have a specific field for it.
        return {
          ...rider,
          completedDeliveries: completedOrders
        }
      })
    )

    return NextResponse.json({ riders: ridersWithEarnings })
  } catch (error) {
    console.error('Error fetching remittance data:', error)
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
  }
}