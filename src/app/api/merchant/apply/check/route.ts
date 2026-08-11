import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value

    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Check if user already has a merchant profile (application)
    const application = await prisma.merchantProfile.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })

    if (!application) {
      return NextResponse.json({ hasApplication: false })
    }

    return NextResponse.json({ 
      hasApplication: true, 
      status: application.status,
      storeName: application.storeName
    })
  } catch (error) {
    console.error('Error checking merchant application:', error)
    return NextResponse.json({ error: 'Failed to check application' }, { status: 500 })
  }
}