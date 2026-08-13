import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

// GET: Fetch all rider applications
export async function GET() {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value

    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (user?.role !== 'ADMIN' && user?.role !== 'SUB_ADMIN') {
      return NextResponse.json({ error: 'Admin access only' }, { status: 403 })
    }

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

// POST: Approve or Reject a rider application (flexible field names!)
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value

    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (user?.role !== 'ADMIN' && user?.role !== 'SUB_ADMIN') {
      return NextResponse.json({ error: 'Admin access only' }, { status: 403 })
    }

    const body = await request.json()

    // 🔑 Accept ANY field name the frontend might send
    const profileId =
      body.riderProfileId ||
      body.profileId ||
      body.applicationId ||
      body.riderId ||
      body.id

    let status = body.status || body.action || body.newStatus

    // 🔑 Normalize status values (APPROVE → APPROVED, REJECT → REJECTED)
    if (status === 'APPROVE') status = 'APPROVED'
    if (status === 'REJECT') status = 'REJECTED'

    if (!profileId || !status) {
      return NextResponse.json({ error: 'Missing riderProfileId or status' }, { status: 400 })
    }

    // 🔑 Find the profile by id OR by userId (covers both cases)
    let profile = await prisma.riderProfile.findUnique({ where: { id: profileId } }).catch(() => null)
    if (!profile) {
      profile = await prisma.riderProfile.findUnique({ where: { userId: profileId } }).catch(() => null)
    }

    if (!profile) {
      return NextResponse.json({ error: 'Rider application not found' }, { status: 404 })
    }

    // Update the application status
    const updatedProfile = await prisma.riderProfile.update({
      where: { id: profile.id },
      data: { status }
    })

    // If approved, make sure the user has the RIDER role
    if (status === 'APPROVED') {
      await prisma.user.update({
        where: { id: profile.userId },
        data: { role: 'RIDER' }
      })
    }

        return NextResponse.json({
      success: true,
      message: status === 'APPROVED'
        ? '✅ Rider approved successfully!'
        : status === 'REJECTED'
        ? '❌ Rider rejected.'
        : '✅ Rider updated successfully!',
      profile: updatedProfile
    })
  } catch (error) {
    console.error('Error updating rider:', error)
    return NextResponse.json({ error: 'Failed to update rider' }, { status: 500 })
  }
}