// src/app/api/orders/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { items, totalAmount, deliveryFee, totalWeight, customerName, contactNumber, deliveryAddress, paymentMethod } = body

    console.log('Creating order with data:', {
      items,
      totalAmount,
      deliveryFee,
      totalWeight,
      customerName,
      contactNumber,
      deliveryAddress
    })

    // First, create or find a customer
    let customerId = ''
    
    try {
      // Try to find existing walk-in customer
      let customer = await prisma.user.findFirst({
        where: {
          email: 'walkin@customer.local'
        }
      })

      if (!customer) {
        // Create a new walk-in customer with only passwordHash
        customer = await prisma.user.create({
          data: {
            name: customerName || 'Walk-in Customer',
            email: 'walkin@customer.local',
            role: 'CUSTOMER',
            passwordHash: '$2b$10$dummyhashforwalkincustomer12345678901234567890'
          }
        })
        console.log('Created customer:', customer.id)
      }

      customerId = customer.id
    } catch (customerError: any) {
      console.error('Error creating/finding customer:', customerError.message)
      // If we can't create customer, try with a different approach
      // Create customer with unique email each time
      const uniqueEmail = `customer_${Date.now()}@tindahan.local`
      const customer = await prisma.user.create({
        data: {
          name: customerName || 'Customer',
          email: uniqueEmail,
          role: 'CUSTOMER',
          passwordHash: '$2b$10$dummyhashforwalkincustomer12345678901234567890'
        }
      })
      customerId = customer.id
      console.log('Created customer with unique email:', customerId)
    }

    // Now create the order
    const order = await prisma.order.create({
      data: {
        customerId: customerId,
        totalAmount: totalAmount,
        deliveryFee: deliveryFee,
        riderPayout: deliveryFee * 0.8,
        requiredLoadKg: totalWeight,
        deliveryAddress: deliveryAddress,
        contactNumber: contactNumber,
        status: 'PENDING',
        items: {
          create: items.map((item: any) => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price
          }))
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    })

    console.log('✅ Order created successfully:', order.id)

    return NextResponse.json({ success: true, orderId: order.id })
  } catch (error: any) {
    console.error('❌ Error creating order:', error)
    console.error('Error code:', error.code)
    console.error('Error message:', error.message)
    
    return NextResponse.json({ 
      error: 'Failed to create order',
      details: error.message 
    }, { status: 500 })
  }
}