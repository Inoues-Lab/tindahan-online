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
    if (!user || user.role !== 'MERCHANT') {
      return NextResponse.json({ error: 'Merchant access required' }, { status: 403 })
    }

    const products = await prisma.product.findMany({
      where: { merchantId: userId },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ products })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
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
    if (!user || user.role !== 'MERCHANT') {
      return NextResponse.json({ error: 'Merchant access required' }, { status: 403 })
    }

    const body = await request.json()
    const { name, description, price, stock, weightKg, imageUrl } = body

    if (!name || !price || stock === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const product = await prisma.product.create({
      data: {
        name,
        description: description || null,
        price: parseFloat(price),
        stock: parseInt(stock),
        weightKg: parseFloat(weightKg) || 1.0,
        imageUrl: imageUrl || null,
        merchantId: userId
      }
    })

    return NextResponse.json({ success: true, product })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user || user.role !== 'MERCHANT') {
      return NextResponse.json({ error: 'Merchant access required' }, { status: 403 })
    }

    const body = await request.json()
    const { id, name, description, price, stock, weightKg, imageUrl } = body

    if (!id) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
    }

    // Verify product belongs to this merchant
    const existingProduct = await prisma.product.findUnique({ where: { id } })
    if (!existingProduct || existingProduct.merchantId !== userId) {
      return NextResponse.json({ error: 'Product not found or not yours' }, { status: 404 })
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        description: description || null,
        price: parseFloat(price),
        stock: parseInt(stock),
        weightKg: parseFloat(weightKg) || 1.0,
        imageUrl: imageUrl || null
      }
    })

    return NextResponse.json({ success: true, product })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user || user.role !== 'MERCHANT') {
      return NextResponse.json({ error: 'Merchant access required' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
    }

    // Verify product belongs to this merchant
    const existingProduct = await prisma.product.findUnique({ where: { id } })
    if (!existingProduct || existingProduct.merchantId !== userId) {
      return NextResponse.json({ error: 'Product not found or not yours' }, { status: 404 })
    }

    await prisma.product.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}