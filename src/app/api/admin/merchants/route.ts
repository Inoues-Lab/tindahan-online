import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  try {
    console.log('GET /api/admin/merchants called')
    
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value

    if (!userId) {
      console.log('No user ID in cookie')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    
    if (!user) {
      console.log('User not found')
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    if (user.role !== 'ADMIN') {
      console.log('Not admin, role:', user.role)
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    console.log('Fetching applications for admin...')
    
    // Fetch ALL applications
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

    console.log('Found', applications.length, 'applications')
    return NextResponse.json({ applications }, { status: 200 })
  } catch (error) {
    console.error('GET Error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch applications', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
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
    const { applicationId, action } = body

    if (!applicationId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const application = await prisma.merchantApplication.findUnique({
      where: { id: applicationId },
      include: { user: true }
    })

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    if (action === 'APPROVE') {
      await prisma.merchantProfile.upsert({
        where: { userId: application.userId },
        update: {
          storeName: application.storeName,
          businessType: application.businessType,
          status: 'APPROVED'
        },
        create: {
          userId: application.userId,
          storeName: application.storeName,
          businessType: application.businessType,
          status: 'APPROVED'
        }
      })

      await prisma.user.update({
        where: { id: application.userId },
        data: { role: 'MERCHANT' }
      })

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
    console.error('POST Error:', error)
    return NextResponse.json({ error: 'Failed to process application' }, { status: 500 })
  }
}