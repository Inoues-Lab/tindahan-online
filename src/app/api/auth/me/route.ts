import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function GET() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value

  // No userId - return null user (normal for guests)
  if (!userId || userId.trim() === '' || userId === 'null' || userId === 'undefined') {
    return NextResponse.json({ user: null }, { status: 200 })
  }

  // Validate userId format (should be a valid cuid format)
  if (!userId.match(/^[a-z0-9]+$/)) {
    console.log('Invalid userId format, clearing cookie')
    const response = NextResponse.json({ user: null }, { status: 200 })
    response.cookies.set('userId', '', { maxAge: 0, path: '/', httpOnly: true })
    return response
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        address: true,
        riderProfile: true,
        merchantProfile: true
      }
    })

    if (!user) {
      const response = NextResponse.json({ user: null }, { status: 200 })
      response.cookies.set('userId', '', { maxAge: 0, path: '/', httpOnly: true })
      return response
    }

    return NextResponse.json({ user })
  } catch (error) {
    // Silently handle errors - don't log to avoid console spam
    const response = NextResponse.json({ user: null }, { status: 200 })
    response.cookies.set('userId', '', { maxAge: 0, path: '/', httpOnly: true })
    return response
  }
}