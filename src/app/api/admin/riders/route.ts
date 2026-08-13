import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

// GET: Fetch all rider applications
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

    // Fetch ALL rider profiles (applications)
    const applications = await prisma.riderProfile.findMany({
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
    console.error('Error fetching riders:', error)
    return NextResponse.json({ error: 'Failed to fetch riders' }, { status: 500 })
  }
}

// POST: Approve or Reject a rider application
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
    const { riderProfileId, status } = body 
    // status should be 'APPROVED' or 'REJECTED'

    if (!riderProfileId || !status) {
      return NextResponse.json({ error: 'Missing riderProfileId or status' }, { status: 400 })
    }

    // 1. Update the Rider Profile status
    const updatedProfile = await prisma.riderProfile.update({
      where: { id: riderProfileId },
      data: { status: status }
    })

    // 2. If Approved, update the User's role to RIDER (though they might already be)
    // and ensure they can access the rider dashboard
    if (status === 'APPROVED') {
      await prisma.user.update({
        where: { id: updatedProfile.userId },
        data: { role: 'RIDER' }
      })
    }

    return NextResponse.json({ success: true, profile: updatedProfile })
  } catch (error) {
    console.error('Error updating rider:', error)
    return NextResponse.json({ error: 'Failed to update rider' }, { status: 500 })
  }
}