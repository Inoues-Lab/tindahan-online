import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

// GET: Fetch the logged-in rider's application status
export async function GET() {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const profile = await prisma.riderProfile.findUnique({ where: { userId } })

    // 🔑 Return the profile under EVERY possible name so any page can read it
    return NextResponse.json({
      success: true,
      profile,
      application: profile,
      riderProfile: profile,
      status: profile?.status || null
    })
  } catch (error) {
    console.error('Error fetching rider profile:', error)
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}

// POST: Submit rider application with vehicle info + documents
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()

    const vehicleType = body.vehicleType || body.vehicle || null
    const plateNumber = body.plateNumber || body.plate || null
    const licenseUrl = body.licenseUrl || body.drivingLicenseUrl || body.drivingLicense || body.license || null
    const orcrUrl = body.orCrUrl || body.orcrUrl || body.orcr || body.motorcycleOrcr || null
    const authorizationUrl = body.authLetterUrl || body.authorizationUrl || body.authorizationLetterUrl || body.authorizationLetter || body.authorization || null

    const profile = await prisma.riderProfile.upsert({
      where: { userId },
      update: {
        status: 'PENDING',
        vehicleType,
        plateNumber,
        licenseUrl,
        orcrUrl,
        authorizationUrl
      },
      create: {
        userId,
        status: 'PENDING',
        vehicleType,
        plateNumber,
        licenseUrl,
        orcrUrl,
        authorizationUrl
      }
    })

    return NextResponse.json({
      success: true,
      profile,
      message: 'Application submitted for review! 🏍️'
    })
  } catch (error) {
    console.error('Error submitting rider application:', error)
    return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 })
  }
}