import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const merchant = await prisma.merchantProfile.findUnique({ where: { userId } })
    if (!merchant) return NextResponse.json({ error: 'Merchant profile not found' }, { status: 403 })

    const products = await prisma.product.findMany({
      where: { merchantId: merchant.id },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ products })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const merchant = await prisma.merchantProfile.findUnique({ where: { userId } })
    if (!merchant) return NextResponse.json({ error: 'Merchant profile not found' }, { status: 403 })

    const body = await request.json()
    const { name, price, stock, description, imageUrl } = body

    if (!name || !price) {
      return NextResponse.json({ error: 'Name and price are required!' }, { status: 400 })
    }

    const product = await prisma.product.create({
      data: {
        merchantId: merchant.id,
        name,
        price: parseFloat(price),
        stock: parseInt(stock || '0'),
        description: description || '',
        imageUrl: imageUrl || '',
        status: 'PENDING'
      }
    })

    return NextResponse.json({ success: true, product, message: 'Product submitted for admin approval! ⏳' })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const merchant = await prisma.merchantProfile.findUnique({ where: { userId } })
    if (!merchant) return NextResponse.json({ error: 'Merchant profile not found' }, { status: 403 })

    const body = await request.json()
    const { productId, name, price, stock, description, imageUrl } = body

    if (!productId) return NextResponse.json({ error: 'Missing productId' }, { status: 400 })

    const product = await prisma.product.update({
      where: { id: productId, merchantId: merchant.id },
      data: {
        name: name !== undefined ? name : undefined,
        price: price !== undefined ? parseFloat(price) : undefined,
        stock: stock !== undefined ? parseInt(stock) : undefined,
        description: description !== undefined ? description : undefined,
        imageUrl: imageUrl !== undefined ? imageUrl : undefined,
        status: 'PENDING'
      }
    })

    return NextResponse.json({ success: true, product, message: 'Product updated — sent for admin re-approval! ⏳' })
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const merchant = await prisma.merchantProfile.findUnique({ where: { userId } })
    if (!merchant) return NextResponse.json({ error: 'Merchant profile not found' }, { status: 403 })

    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    if (!productId) return NextResponse.json({ error: 'Missing productId' }, { status: 400 })

    await prisma.product.delete({ where: { id: productId, merchantId: merchant.id } })
    return NextResponse.json({ success: true, message: 'Product deleted!' })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}
