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

    // Get all riders with cash on hand
    const riders = await prisma.user.findMany({
      where: {
        role: 'RIDER',
        cashOnHand: { gt: 0 }
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        cashOnHand: true
      }
    })

    // Get today's remittances
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const todayRemittances = await prisma.remittance.findMany({
      where: {
        createdAt: {
          gte: today,
          lt: tomorrow
        }
      },
      include: {
        rider: true
      }
    })

    const totalPending = riders.reduce((sum, rider) => sum + rider.cashOnHand, 0)

    return NextResponse.json({
      riders,
      todayRemittances,
      totalPending,
      processedToday: todayRemittances.length
    })
  } catch (error) {
    console.error('Error fetching remittance data:', error)
    return NextResponse.json({ error: 'Failed to fetch remittance data' }, { status: 500 })
  }
}

export async function POST(request: Request) {
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

    const body = await request.json()
    const { riderId, amount } = body

    if (!riderId || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify rider exists and has enough cash
    const rider = await prisma.user.findUnique({
      where: { id: riderId }
    })

    if (!rider || rider.role !== 'RIDER') {
      return NextResponse.json({ error: 'Rider not found' }, { status: 404 })
    }

    if (rider.cashOnHand < amount) {
      return NextResponse.json({ error: 'Insufficient cash on hand' }, { status: 400 })
    }

    // Create remittance record
    const remittance = await prisma.remittance.create({
      data: {
        riderId,
        amount,
        status: 'COMPLETED'
      }
    })

    // Reset rider's cash on hand
    await prisma.user.update({
      where: { id: riderId },
      data: {
        cashOnHand: { decrement: amount }
      }
    })

    return NextResponse.json({ success: true, remittance })
  } catch (error) {
    console.error('Error processing remittance:', error)
    return NextResponse.json({ error: 'Failed to process remittance' }, { status: 500 })
  }
}