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

    // Fetch all applications with user details
    const applications = await prisma.merchantApplication.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ applications })
  } catch (error) {
    console.error('Error fetching applications:', error)
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 })
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
    const { applicationId, action } = body // action: 'APPROVE' or 'REJECT'

    if (!applicationId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const application = await prisma.merchantApplication.findUnique({
      where: { id: applicationId }
    })

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    if (action === 'APPROVE') {
      // 1. Create Merchant Profile
      await prisma.merchantProfile.create({
        data: {
          userId: application.userId,
          storeName: application.storeName,
          businessType: application.businessType,
          status: 'APPROVED'
        }
      })

      // 2. Update User Role to MERCHANT
      await prisma.user.update({
        where: { id: application.userId },
        data: { role: 'MERCHANT' }
      })

      // 3. Update Application Status
      await prisma.merchantApplication.update({
        where: { id: applicationId },
        data: { status: 'APPROVED' }
      })

      return NextResponse.json({ success: true, message: 'Merchant approved!' })
    } 
    
    if (action === 'REJECT') {
      await prisma.merchantApplication.update({
        where: { id: applicationId },
        data: { status: 'REJECTED' }
      })

      return NextResponse.json({ success: true, message: 'Merchant rejected.' })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error processing application:', error)
    return NextResponse.json({ error: 'Failed to process application' }, { status: 500 })
  }
}