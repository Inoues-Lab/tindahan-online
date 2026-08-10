import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value

    if (!userId) {
      return NextResponse.json({ error: 'Please login to apply' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({ 
      where: { id: userId },
      include: { merchantProfile: true }
    })
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Only block if user role is already MERCHANT AND has an approved profile
    if (user.role === 'MERCHANT' && user.merchantProfile?.status === 'APPROVED') {
      return NextResponse.json({ error: 'You are already an approved merchant' }, { status: 400 })
    }

    const body = await request.json()
    const { storeName, businessType, contactNumber, birUrl, businessPermitUrl } = body

    if (!storeName || !businessType || !contactNumber) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if already has a PENDING application
    const existingApp = await prisma.merchantApplication.findFirst({
      where: { userId, status: 'PENDING' }
    })

    if (existingApp) {
      return NextResponse.json({ error: 'You already have a pending application' }, { status: 400 })
    }

    // Create the application
    await prisma.merchantApplication.create({
      data: {
        userId,
        storeName,
        businessType,
        contactNumber,
        birUrl: birUrl || null,
        businessPermitUrl: businessPermitUrl || null
      }
    })

    return NextResponse.json({ success: true, message: 'Application submitted!' })
  } catch (error) {
    console.error('Merchant Apply Error:', error)
    return NextResponse.json({ error: 'Failed to submit application', details: error instanceof Error ? error.message : 'Unknown' }, { status: 500 })
  }
}