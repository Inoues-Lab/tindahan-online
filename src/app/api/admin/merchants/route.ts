import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

// GET: Fetch all merchant applications/profiles
export async function GET() {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value

    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Check if admin
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (user?.role !== 'ADMIN' && user?.role !== 'SUB_ADMIN') {
      return NextResponse.json({ error: 'Admin access only' }, { status: 403 })
    }

    // Fetch ALL merchant profiles (this acts as the application list)
    // We include the user details so the admin sees who applied
    const applications = await prisma.merchantProfile.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ applications })
  } catch (error) {
    console.error('Error fetching merchants:', error)
    return NextResponse.json({ error: 'Failed to fetch merchants' }, { status: 500 })
  }
}

// POST: Approve or Reject a merchant application
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value

    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access only' }, { status: 403 })
    }

    const body = await request.json()
    const { merchantProfileId, status } = body 
    // status should be 'APPROVED' or 'REJECTED'

    if (!merchantProfileId || !status) {
      return NextResponse.json({ error: 'Missing merchantProfileId or status' }, { status: 400 })
    }

    // 1. Update the Merchant Profile status
    const updatedProfile = await prisma.merchantProfile.update({
      where: { id: merchantProfileId },
      data: { status: status }
    })

    // 2. If Approved, update the User's role to MERCHANT so they can access the dashboard
    if (status === 'APPROVED') {
      await prisma.user.update({
        where: { id: updatedProfile.userId },
        data: { role: 'MERCHANT' }
      })
    }

    return NextResponse.json({ success: true, profile: updatedProfile })
  } catch (error) {
    console.error('Error updating merchant:', error)
    return NextResponse.json({ error: 'Failed to update merchant' }, { status: 500 })
  }
}