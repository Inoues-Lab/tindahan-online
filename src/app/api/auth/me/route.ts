import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value

    if (!userId || userId.trim() === '') {
      console.log('No userId in cookie')
      return NextResponse.json({ user: null }, { status: 200 })
    }

    console.log('Fetching user with ID:', userId)

    let user
    try {
      user = await prisma.user.findUnique({
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
    } catch (prismaError) {
      // Handle Prisma-specific errors (invalid ID format, etc.)
      if (prismaError instanceof PrismaClientKnownRequestError) {
        console.log('Prisma error - invalid user ID, clearing cookie')
        const response = NextResponse.json({ user: null }, { status: 200 })
        response.cookies.set('userId', '', { 
          maxAge: 0, 
          path: '/',
          httpOnly: true
        })
        return response
      }
      throw prismaError
    }

    if (!user) {
      console.log('User not found in database, clearing cookie')
      const response = NextResponse.json({ user: null }, { status: 200 })
      response.cookies.set('userId', '', { 
        maxAge: 0, 
        path: '/',
        httpOnly: true
      })
      return response
    }

    console.log('User found:', user.email, 'Role:', user.role)
    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error in /api/auth/me:', error)
    // Return null user instead of 500 error
    return NextResponse.json({ user: null }, { status: 200 })
  }
}