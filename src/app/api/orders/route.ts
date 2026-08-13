import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

// GET: Fetch the logged-in customer's orders
export async function GET() {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: { product: true }
        },
        rider: {
          include: {
            user: {
              select: { name: true, phone: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ orders })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

// POST: Create a new order (GROCERY, PABILI, or PADALA)
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      serviceType = 'GROCERY',
      deliveryAddress,
      contactNumber,
      paymentMethod = 'COD',
      deliveryFee = 50,
      totalAmount,
      itemDescription,
      storeLocation,
      maxAmount,
      specialInstructions,
      packageDescription,
      senderName,
      senderContact,
      receiverName,
      receiverContact,
      items
    } = body

    if (!deliveryAddress || !contactNumber) {
      return NextResponse.json({ error: 'Delivery address and contact number are required' }, { status: 400 })
    }

    let orderTotal = totalAmount || 0
    let orderItems: any[] = []

    // GROCERY: calculate total from cart items
    if (serviceType === 'GROCERY' && items && items.length > 0) {
      const productIds = items.map((i: any) => i.productId)
      const products = await prisma.product.findMany({
        where: { id: { in: productIds } }
      })
      const priceMap = new Map(products.map((p) => [p.id, p]))

      orderTotal = 0
      orderItems = items.map((i: any) => {
        const product = priceMap.get(i.productId)
        const price = product?.price || i.price || 0
        orderTotal += price * i.quantity
        return {
          productId: i.productId,
          quantity: i.quantity,
          price
        }
      })
      orderTotal += deliveryFee
    } else {
      // PABILI / PADALA: total is the delivery fee (items paid via COD)
      orderTotal = totalAmount || deliveryFee
    }

    // Create the order
    const order = await prisma.order.create({
      data: {
        userId,
        serviceType,
        paymentMethod,
        deliveryAddress,
        contactNumber,
        deliveryFee,
        totalAmount: orderTotal,
        itemDescription: itemDescription || null,
        storeLocation: storeLocation || null,
        maxAmount: maxAmount || null,
        specialInstructions: specialInstructions || null,
        packageDescription: packageDescription || null,
        senderName: senderName || null,
        senderContact: senderContact || null,
        receiverName: receiverName || null,
        receiverContact: receiverContact || null,
        items: orderItems.length > 0
          ? { create: orderItems }
          : undefined
      },
      include: { items: true }
    })

    // Clear the cart after a successful grocery order
    if (serviceType === 'GROCERY') {
      const cart = await prisma.cart.findUnique({ where: { userId } })
      if (cart) {
        await prisma.cartItem.deleteMany({ where: { cartId: cart.id } })
      }
    }

    return NextResponse.json({ success: true, order })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json({ error: 'Error placing order' }, { status: 500 })
  }
}