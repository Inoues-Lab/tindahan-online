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

    const riders = await prisma.user.findMany({
      where: { role: 'RIDER' },
      include: { riderProfile: true },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ riders })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Failed to fetch riders' }, { status: 500 })
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
    const { userId: riderId, action } = body

    if (!riderId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // FIX: Map 'APPROVE' to 'APPROVED' and 'REJECT' to 'REJECTED'
    const newStatus = action === 'APPROVE' ? 'APPROVED' : 'REJECTED'

    // Update rider profile status
    await prisma.riderProfile.upsert({
      where: { userId: riderId },
      update: { status: newStatus },
      create: { userId: riderId, status: newStatus }
    })

    return NextResponse.json({ 
      success: true, 
      message: `Rider ${newStatus.toLowerCase()} successfully!` 
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
  }
}