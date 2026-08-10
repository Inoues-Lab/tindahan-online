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

    // 1. Get or create the merchant profile
    const merchantProfile = await prisma.merchantProfile.upsert({
      where: { userId },
      update: {},
      create: {
        userId,
        storeName: user.name + "'s Store",
        businessType: 'General',
        status: 'APPROVED'
      }
    })

    // 2. Use merchantProfile.id, NOT userId!
    const products = await prisma.product.findMany({
      where: { merchantId: merchantProfile.id },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ products })
  } catch (error) {
    console.error('GET Error:', error)
    return NextResponse.json({ error: 'Failed to fetch products', details: error instanceof Error ? error.message : 'Unknown' }, { status: 500 })
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

    if (!name || price === undefined || stock === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // 1. Get or create the merchant profile
    const merchantProfile = await prisma.merchantProfile.upsert({
      where: { userId },
      update: {},
      create: {
        userId,
        storeName: user.name + "'s Store",
        businessType: 'General',
        status: 'APPROVED'
      }
    })

    console.log('🚀 SUPER FORCE DEPLOYMENT: Merchant Profile ID is', merchantProfile.id)

    // 2. Use merchantProfile.id, NOT userId!
    const product = await prisma.product.create({
      data: {
        name,
        description: description || null,
        price: parseFloat(price),
        stock: parseInt(stock),
        weightKg: parseFloat(weightKg) || 1.0,
        imageUrl: imageUrl || null,
        merchantId: merchantProfile.id 
      }
    })

    console.log('Product created successfully:', product.id)
    return NextResponse.json({ success: true, product })
  } catch (error) {
    console.error('POST Error:', error)
    return NextResponse.json({ 
      error: 'Failed to create product', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
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

    const merchantProfile = await prisma.merchantProfile.findUnique({ where: { userId } })
    if (!merchantProfile) {
      return NextResponse.json({ error: 'Merchant profile not found' }, { status: 404 })
    }

    const body = await request.json()
    const { id, name, description, price, stock, weightKg, imageUrl } = body

    if (!id) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
    }

    const existingProduct = await prisma.product.findUnique({ where: { id } })
    if (!existingProduct || existingProduct.merchantId !== merchantProfile.id) {
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
    console.error('PUT Error:', error)
    return NextResponse.json({ error: 'Failed to update product', details: error instanceof Error ? error.message : 'Unknown' }, { status: 500 })
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

    const merchantProfile = await prisma.merchantProfile.findUnique({ where: { userId } })
    if (!merchantProfile) {
      return NextResponse.json({ error: 'Merchant profile not found' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
    }

    const existingProduct = await prisma.product.findUnique({ where: { id } })
    if (!existingProduct || existingProduct.merchantId !== merchantProfile.id) {
      return NextResponse.json({ error: 'Product not found or not yours' }, { status: 404 })
    }

    await prisma.product.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE Error:', error)
    return NextResponse.json({ error: 'Failed to delete product', details: error instanceof Error ? error.message : 'Unknown' }, { status: 500 })
  }
}