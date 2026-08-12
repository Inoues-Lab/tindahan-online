import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

// GET: Fetch products for the logged-in merchant only
export async function GET() {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find the merchant profile for this user
    const merchantProfile = await prisma.merchantProfile.findUnique({
      where: { userId }
    })

    if (!merchantProfile) {
      return NextResponse.json({ error: 'Merchant profile not found' }, { status: 404 })
    }

    // Only fetch products belonging to THIS merchant's store
    const products = await prisma.product.findMany({
      where: {
        merchantId: merchantProfile.id
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ products })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

// POST: Create a new product linked to the merchant's store
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find the merchant profile
    const merchantProfile = await prisma.merchantProfile.findUnique({
      where: { userId }
    })

    if (!merchantProfile) {
      return NextResponse.json({ error: 'Merchant profile not found' }, { status: 404 })
    }

    const body = await request.json()
    const { name, description, price, stock, imageUrl } = body

    // Create product AND link it to the merchant profile
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock),
        imageUrl,
        merchantId: merchantProfile.id, // 🔑 Links to the store!
      }
    })

    return NextResponse.json({ success: true, product })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}

// DELETE: Delete a product
export async function DELETE(request: Request) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const merchantProfile = await prisma.merchantProfile.findUnique({
      where: { userId }
    })

    if (!merchantProfile) {
      return NextResponse.json({ error: 'Merchant profile not found' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('id')

    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
    }

    // Verify the product belongs to this merchant's store
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        merchantId: merchantProfile.id
      }
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found or unauthorized' }, { status: 404 })
    }

    await prisma.product.delete({
      where: { id: productId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}