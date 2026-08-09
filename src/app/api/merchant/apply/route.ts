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

    const body = await request.json()
    const { storeName, businessType, contactNumber, birUrl, businessPermitUrl } = body

    if (!storeName || !businessType || !contactNumber) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if already applied or is a merchant
    const existingApp = await prisma.merchantApplication.findFirst({
      where: { userId, status: 'PENDING' }
    })
    
    const existingProfile = await prisma.merchantProfile.findUnique({
      where: { userId }
    })

    if (existingApp || existingProfile) {
      return NextResponse.json({ error: 'You have already applied or are a merchant' }, { status: 400 })
    }

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
    return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 })
  }
}