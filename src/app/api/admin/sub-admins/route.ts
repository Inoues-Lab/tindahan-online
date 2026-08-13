import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs' // Make sure you have bcryptjs installed

export async function GET() {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (user?.role !== 'ADMIN') return NextResponse.json({ error: 'Admin access only' }, { status: 403 })

    const users = await prisma.user.findMany({
      where: { role: 'SUB_ADMIN' },
      select: { id: true, name: true, email: true }
    })

    return NextResponse.json({ users })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (user?.role !== 'ADMIN') return NextResponse.json({ error: 'Admin access only' }, { status: 403 })

    const body = await request.json()
    const { name, email, password } = body

    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'SUB_ADMIN'
      }
    })

    return NextResponse.json({ success: true, user: { id: newUser.id, name: newUser.name, email: newUser.email } })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 })
  }
}