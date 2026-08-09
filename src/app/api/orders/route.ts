// src/app/api/orders/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value
    const userRole = cookieStore.get('userRole')?.value

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (userRole === 'ADMIN') {
      const orders = await prisma.order.findMany({
        include: { customer: true, items: { include: { product: true } }, delivery: true },
        orderBy: { createdAt: 'desc' }
      })
      return NextResponse.json({ orders })
    }

    const orders = await prisma.order.findMany({
      where: { customerId: userId },
      include: { items: { include: { product: true } }, delivery: true },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ orders })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { items, deliveryAddress, contactNumber, paymentMethod, totalAmount, deliveryFee, serviceType } = body

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items in order' }, { status: 400 })
    }

    // Calculate platform income (5% of product total)
    const productTotal = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0)
    const platformIncome = productTotal * 0.05
    const riderPayout = (deliveryFee || 50) * 0.80

    const order = await prisma.order.create({
      data: {
        customerId: userId,
        status: 'PENDING',
        serviceType: serviceType || 'GROCERY',
        totalAmount,
        deliveryFee: deliveryFee || 50,
        riderPayout,
        platformIncome,
        deliveryAddress,
        contactNumber,
        paymentMethod: paymentMethod || 'COD',
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price
          }))
        }
      }
    })

    // Clear cart after order
    const cart = await prisma.cart.findUnique({ where: { userId } })
    if (cart) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } })
    }

    return NextResponse.json({ success: true, order })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}