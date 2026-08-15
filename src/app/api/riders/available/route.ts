import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const riders = await prisma.riderProfile.findMany({
      where: { status: 'APPROVED' },
      orderBy: { createdAt: 'asc' },
      take: 5
    })

    const list = []
    for (let i = 0; i < riders.length; i++) {
      const r = riders[i]
      const active = await prisma.order.findFirst({
        where: { riderId: r.id, status: 'OUT_FOR_DELIVERY' }
      })
      list.push({
        code: 'Rider ' + (i + 1),
        status: active ? 'ON DELIVERY' : 'AVAILABLE'
      })
    }

    return NextResponse.json({ riders: list })
  } catch (error) {
    console.error('Error fetching riders:', error)
    return NextResponse.json({ riders: [] })
  }
}
