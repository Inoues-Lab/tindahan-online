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

    let orders
    if (userRole === 'ADMIN') {
      orders = await prisma.order.findMany({ 
        include: { 
          items: { include: { product: true } }, 
          customer: true,
          delivery: true
        },
        orderBy: { createdAt: 'desc' }
      })
    } else if (userRole === 'RIDER') {
      const riderProfile = await prisma.riderProfile.findUnique({
        where: { userId: userId }
      })

      orders = await prisma.order.findMany({ 
        where: { 
          delivery: { 
            riderId: riderProfile?.id 
          } 
        },
        include: { 
          items: { include: { product: true } }, 
          customer: true,
          delivery: true
        }
      })
    } else {
      orders = await prisma.order.findMany({ 
        where: { customerId: userId },
        include: { items: { include: { product: true } }, delivery: true },
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
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const customer = await prisma.user.findUnique({ where: { id: userId } })
    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    const body = await request.json()
    const { items, deliveryAddress, contactNumber, deliveryFee } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }
    if (!deliveryAddress || !contactNumber) {
      return NextResponse.json({ error: 'Missing delivery details' }, { status: 400 })
    }

    let subtotal = 0
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

      // Apply 5% markup to product price
      const priceWithMarkup = product.price * 1.05
      const itemTotal = priceWithMarkup * item.quantity
      subtotal += itemTotal
      totalWeight += product.weightKg * item.quantity

      orderItemsData.push({
        productId: product.id,
        quantity: item.quantity,
        price: priceWithMarkup
      })
    }

    const finalDeliveryFee = deliveryFee || (40 + (totalWeight * 5))
    
    // Split delivery fee: 80% to rider, 20% to platform
    const riderPayout = finalDeliveryFee * 0.80
    const platformDeliveryShare = finalDeliveryFee * 0.20
    
    // Platform income from product markup (the 5%)
    const platformProductShare = subtotal - (subtotal / 1.05)
    
    // Total platform income
    const totalPlatformIncome = platformProductShare + platformDeliveryShare

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          customerId: customer.id,
          totalAmount: subtotal + finalDeliveryFee,
          deliveryFee: finalDeliveryFee,
          riderPayout: riderPayout,
          platformIncome: totalPlatformIncome,
          requiredLoadKg: totalWeight,
          deliveryAddress,
          contactNumber,
          paymentMethod: 'COD',
          status: 'PENDING',
          items: { create: orderItemsData },
          delivery: {
            create: {
              status: 'UNASSIGNED'
            }
          }
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