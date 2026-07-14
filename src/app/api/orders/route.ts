// src/app/api/orders/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function GET() {
  try {
    const user = await requireAuth(['CUSTOMER', 'RIDER', 'ADMIN'])
    if (user instanceof NextResponse) return user

    let orders
    if (user.role === 'ADMIN') {
      orders = await prisma.order.findMany({ 
        include: { 
          items: { include: { product: true } }, 
          customer: true 
        },
        orderBy: { createdAt: 'desc' }
      })
    } else if (user.role === 'RIDER') {
      orders = await prisma.order.findMany({ 
        where: { 
          delivery: { 
            riderId: user.id 
          } 
        },
        include: { 
          items: { include: { product: true } }, 
          customer: true 
        }
      })
    } else {
      orders = await prisma.order.findMany({ 
        where: { customerId: user.id },
        include: { items: { include: { product: true } } },
        orderBy: { createdAt: 'desc' }
      })
    }

    return NextResponse.json({ orders })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const customer = await requireAuth(['CUSTOMER'])
    if (customer instanceof NextResponse) return customer

    const body = await request.json()
    const { items, deliveryAddress, contactNumber, deliveryFee } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }
    if (!deliveryAddress || !contactNumber) {
      return NextResponse.json({ error: 'Missing delivery details' }, { status: 400 })
    }

    let totalAmount = 0
    let totalWeight = 0
    const orderItemsData: any[] = []

    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } })
      
      if (!product) {
        return NextResponse.json({ error: `Product ${item.productId} not found` }, { status: 404 })
      }
      
      if (product.stock < item.quantity) {
        return NextResponse.json({ error: `Not enough stock for ${product.name}` }, { status: 400 })
      }

      const itemTotal = product.price * item.quantity
      totalAmount += itemTotal
      totalWeight += product.weightKg * item.quantity

      orderItemsData.push({
        productId: product.id,
        quantity: item.quantity,
        price: product.price
      })
    }

    const finalDeliveryFee = deliveryFee || (40 + (totalWeight * 5))
    const riderPayout = finalDeliveryFee

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          customerId: customer.id,
          totalAmount,
          deliveryFee: finalDeliveryFee,
          riderPayout,
          requiredLoadKg: totalWeight,
          deliveryAddress,
          contactNumber,
          paymentMethod: 'COD',
          items: { create: orderItemsData }
        }
      })

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