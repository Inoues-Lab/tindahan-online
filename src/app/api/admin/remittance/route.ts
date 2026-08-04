// src/app/api/admin/remittance/route.ts
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

    const remittances = await prisma.remittance.findMany({
      include: {
        rider: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ remittances })
  } catch (error) {
    console.error('Error fetching remittances:', error)
    return NextResponse.json({ error: 'Failed to fetch remittances' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value
    const userRole = cookieStore.get('userRole')?.value

    if (userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { riderId, amount } = body

    if (!riderId || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify rider exists and has the cash on hand
    const rider = await prisma.user.findUnique({
      where: { id: riderId }
    })

    if (!rider || rider.role !== 'RIDER') {
      return NextResponse.json({ error: 'Rider not found' }, { status: 404 })
    }

    if (rider.cashOnHand < amount) {
      return NextResponse.json({ error: 'Insufficient cash on hand' }, { status: 400 })
    }

    // Process remittance
    await prisma.$transaction(async (tx) => {
      // Create remittance record
      await tx.remittance.create({
        data: {
          riderId: riderId,
          amount: amount,
          status: 'COMPLETED'
        }
      })

      // Reset rider's cash on hand to 0
      await tx.user.update({
        where: { id: riderId },
        data: {
          cashOnHand: 0
        }
      })
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error processing remittance:', error)
    return NextResponse.json({ error: 'Failed to process remittance', details: String(error) }, { status: 500 })
  }
}