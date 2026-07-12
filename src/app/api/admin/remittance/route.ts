// src/app/api/admin/remittance/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const adminId = cookieStore.get('userId')?.value
    const adminRole = cookieStore.get('userRole')?.value

    if (adminRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    const { riderId, amount } = body

    console.log('Processing remittance:', { riderId, amount })

    const rider = await prisma.user.findUnique({
      where: { id: riderId }
    })

    if (!rider || rider.role !== 'RIDER') {
      return NextResponse.json({ error: 'Rider not found' }, { status: 404 })
    }

    if (rider.cashOnHand < amount) {
      return NextResponse.json({ error: 'Insufficient cash on hand' }, { status: 400 })
    }

    const remittance = await prisma.remittance.create({
      data: {
        riderId,
        amount,
        status: 'COMPLETED'
      }
    })

    const newCashOnHand = rider.cashOnHand - amount

    await prisma.user.update({
      where: { id: riderId },
      data: { cashOnHand: newCashOnHand }
    })

    console.log('Remittance processed:', remittance.id)

    return NextResponse.json({ 
      success: true, 
      remittance,
      newCashOnHand 
    })
  } catch (error: any) {
    console.error('Error processing remittance:', error)
    return NextResponse.json({ 
      error: 'Failed to process remittance',
      message: error.message 
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies()
    const userRole = cookieStore.get('userRole')?.value

    if (userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const remittances = await prisma.remittance.findMany({
      include: {
        rider: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ remittances })
  } catch (error) {
    console.error('Error fetching remittances:', error)
    return NextResponse.json({ error: 'Failed to fetch remittances' }, { status: 500 })
  }
}