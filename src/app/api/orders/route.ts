// src/app/api/orders/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value

    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const { items, subtotal, deliveryFee, total, address, contactNumber, paymentMethod } = body

    console.log('Creating order for user:', userId)

    const order = await prisma.order.create({
      data: {
        customerId: userId,
        status: 'PENDING',
        totalAmount: total,
        deliveryFee: deliveryFee || 60,
        riderPayout: 0,
        requiredLoadKg: 0,
        deliveryAddress: address,
        contactNumber: contactNumber,
        paymentMethod: paymentMethod || 'COD',
        items: {
          create: items.map((item: any) => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price
          }))
        }
      },
      include: {
        items: true
      }
    })

    console.log('Order created:', order.id)

    return NextResponse.json({ success: true, order })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value
    const userRole = cookieStore.get('userRole')?.value

    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    console.log('Fetching orders for user:', userId, 'role:', userRole)

    let orders

    if (userRole === 'RIDER') {
      // Riders see all orders (or you can filter by assigned rider)
      orders = await prisma.order.findMany({
        include: {
          items: {
            include: {
              product: true
            }
          },
          customer: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    } else if (userRole === 'ADMIN') {
      // Admin sees all orders
      orders = await prisma.order.findMany({
        include: {
          items: {
            include: {
              product: true
            }
          },
          customer: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    } else {
      // Customers see only their orders
      orders = await prisma.order.findMany({
        where: {
          customerId: userId
        },
        include: {
          items: {
            include: {
              product: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    }

    return NextResponse.json({ orders })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}