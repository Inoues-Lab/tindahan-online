import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

// GET: Fetch merchant's products
export async function GET() {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value

    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const merchant = await prisma.merchantProfile.findUnique({ 
      where: { userId },
      select: { id: true }
    })

    if (!merchant) {
      return NextResponse.json({ error: 'Merchant profile not found' }, { status: 404 })
    }

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

// POST: Create new product
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value

    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const merchant = await prisma.merchantProfile.findUnique({ 
      where: { userId },
      select: { id: true }
    })

    if (!merchant) {
      return NextResponse.json({ error: 'Merchant profile not found' }, { status: 404 })
    }

    const body = await request.json()
    const { name, description, price, stock, imageUrl } = body

    if (!name || !price || stock === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // FIXED: Removed userId because it doesn't exist in the Product model
    const product = await prisma.product.create({
      data: {
        name,
        description: description || '',
        price: parseFloat(price),
        stock: parseInt(stock),
        imageUrl: imageUrl || '',
        merchantId: merchant.id
      }
    })

    return NextResponse.json({ success: true, product })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}

// PUT: Update product
export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value

    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
    }

    const merchant = await prisma.merchantProfile.findUnique({ 
      where: { userId },
      select: { id: true }
    })

    if (!merchant) {
      return NextResponse.json({ error: 'Merchant profile not found' }, { status: 404 })
    }

    // Verify product belongs to this merchant
    const existingProduct = await prisma.product.findUnique({
      where: { id }
    })

    if (!existingProduct || existingProduct.merchantId !== merchant.id) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const body = await request.json()
    const { name, description, price, stock, imageUrl } = body

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name: name || existingProduct.name,
        description: description !== undefined ? description : existingProduct.description,
        price: price !== undefined ? parseFloat(price) : existingProduct.price,
        stock: stock !== undefined ? parseInt(stock) : existingProduct.stock,
        imageUrl: imageUrl !== undefined ? imageUrl : existingProduct.imageUrl
      }
    })

    return NextResponse.json({ success: true, product: updatedProduct })
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

// DELETE: Delete product
export async function DELETE(request: Request) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value

    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
    }

    const merchant = await prisma.merchantProfile.findUnique({ 
      where: { userId },
      select: { id: true }
    })

    if (!merchant) {
      return NextResponse.json({ error: 'Merchant profile not found' }, { status: 404 })
    }

    // Verify product belongs to this merchant
    const existingProduct = await prisma.product.findUnique({
      where: { id }
    })

    if (!existingProduct || existingProduct.merchantId !== merchant.id) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    await prisma.product.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}