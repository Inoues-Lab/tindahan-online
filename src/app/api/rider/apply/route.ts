import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { licenseUrl, orCrUrl, authLetterUrl } = body

    await prisma.riderProfile.upsert({
      where: { userId },
      update: {
        licenseUrl: licenseUrl || null,
        orCrUrl: orCrUrl || null,
        authLetterUrl: authLetterUrl || null,
        status: 'PENDING'
      },
      create: {
        userId,
        licenseUrl: licenseUrl || null,
        orCrUrl: orCrUrl || null,
        authLetterUrl: authLetterUrl || null,
        status: 'PENDING'
      }
    })

    return NextResponse.json({ success: true, message: 'Requirements submitted!' })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Failed to submit requirements' }, { status: 500 })
  }
}