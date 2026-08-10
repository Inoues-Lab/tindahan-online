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

    const application = await prisma.merchantApplication.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ application })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Failed to check application' }, { status: 500 })
  }
}