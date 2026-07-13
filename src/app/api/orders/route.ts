// src/app/api/orders/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

// GET: Fetch orders for the logged-in user
export async function GET() {
  try {
    const user = await requireAuth(['CUSTOMER', 'RIDER', 'ADMIN'])
    if (user instanceof NextResponse) return user

    let orders
    if (user.role === 'ADMIN') {
      orders = await prisma.order.findMany({ include: { items: { include: { product: true } }, customer: true } })
    } else if (user.role === 'RIDER') {
      orders = await prisma.order.findMany({ 
        where: { delivery: { rider: { userId: user.id } } },
        include: { items: { include: { product: true } }, customer: true }
      })
    } else {
      orders = await prisma.order.findMany({ 
        where: { customerId: user.id },
        include: { items: { include: { product: true } } }
      })
    }

    return NextResponse.json({ orders })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

// POST: SECURE CHECKOUT
export async function POST(request: Request) {
  try {
    // 1. ONLY customers can checkout
    const customer = await requireAuth(['CUSTOMER'])
    if (customer instanceof NextResponse) return customer

    const body = await request.json()
    const { items, deliveryAddress, contactNumber } = body

    // 2. Validate input
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }
    if (!deliveryAddress || !contactNumber) {
      return NextResponse.json({ error: 'Missing delivery details' }, { status: 400 })
    }

    // 3. Fetch products from DB and calculate REAL prices (Prevents Price Tampering)
    let totalAmount = 0
    let totalWeight = 0
    const orderItemsData = []

    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } })
      
      if (!product) {
        return NextResponse.json({ error: `Product ${item.productId} not found` }, { status: 404 })
      }
      
      if (product.stock < item.quantity) {
        return NextResponse.json({ error: `Not enough stock for ${product.name}` }, { status: 400 })
      }

      // Calculate on the SERVER, never trust the frontend
      const itemTotal = product.price * item.quantity
      totalAmount += itemTotal
      totalWeight += product.weightKg * item.quantity

      orderItemsData.push({
        productId: product.id,
        quantity: item.quantity,
        price: product.price // Use DB price!
      })
    }

    // 4. Calculate Delivery Fee on Server (e.g., Base 50 + 10 per kg)
    const deliveryFee = 50 + (totalWeight * 10)
    const riderPayout = deliveryFee // Rider keeps the delivery fee

    // 5. Create Order and Update Stock in a TRANSACTION (Prevents race conditions)
    const order = await prisma.$transaction(async (tx) => {
      // Create the order
      const newOrder = await tx.order.create({
        data: {
          customerId: customer.id, // Use ID from secure cookie, NOT frontend!
          totalAmount,
          deliveryFee,
          riderPayout,
          requiredLoadKg: totalWeight,
          deliveryAddress,
          contactNumber,
          paymentMethod: 'COD',
          items: {
            create: orderItemsData
          }
        }
      })

      // Decrease stock for each product
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } }
        })
      }

      return newOrder
    })

    return NextResponse.json({ success: true, order })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: 'Checkout failed' }, { status: 500 })
  }
}