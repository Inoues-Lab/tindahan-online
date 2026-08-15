import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: { include: { product: true } },
        rider: { include: { user: { select: { name: true } } } }
      },
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
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const orderId = body.orderId || body.id
    const action = body.action

    // ---- CUSTOMER REVISION ACTIONS ----
    if (action === 'ACCEPT_REVISION' || action === 'REJECT_REVISION') {
      if (!orderId) return NextResponse.json({ error: 'Missing orderId' }, { status: 400 })
      const existing = await prisma.order.findUnique({ where: { id: orderId } })
      if (!existing || existing.userId !== userId) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

      if (action === 'ACCEPT_REVISION') {
        const order = await prisma.order.update({ where: { id: orderId }, data: { status: 'ACCEPTED' } })
        return NextResponse.json({ success: true, order, message: 'Revised order accepted! ✅' })
      }
      const order = await prisma.order.update({ where: { id: orderId }, data: { status: 'CANCELLED', cancelReason: body.reason || 'Customer rejected the revision' } })
      return NextResponse.json({ success: true, order, message: 'Order cancelled.' })
    }

    // ---- CREATE ORDER (checkout) ----
    const serviceType = body.serviceType || 'GROCERY'
    const deliveryAddress = body.deliveryAddress || body.address || ''
    const contactNumber = body.contactNumber || body.phone || ''
    const paymentMethod = body.paymentMethod || 'COD'
    const deliveryFee = parseFloat(body.deliveryFee || '0') || 0

    if (!deliveryAddress || !contactNumber) {
      return NextResponse.json({ error: 'Delivery address and contact number are required!' }, { status: 400 })
    }

    let orderItems: { productId: string; quantity: number; price: number }[] = []
    const rawItems = body.items || body.cartItems || []

    if (Array.isArray(rawItems) && rawItems.length > 0) {
      for (const it of rawItems) {
        const pid = it.productId || it.id
        const product = await prisma.product.findUnique({ where: { id: pid } })
        if (product) orderItems.push({ productId: pid, quantity: it.quantity || 1, price: it.price || product.price })
      }
    } else {
      const cart = await prisma.cart.findUnique({ where: { userId }, include: { items: { include: { product: true } } } })
      if (cart) orderItems = cart.items.map((ci: any) => ({ productId: ci.productId, quantity: ci.quantity, price: ci.product?.price || 0 }))
    }

    const itemsTotal = orderItems.reduce((s, i) => s + i.price * i.quantity, 0)
    const totalAmount = parseFloat(body.totalAmount || body.total || '0') || (itemsTotal + deliveryFee)

    const order = await prisma.order.create({
      data: {
        userId,
        serviceType,
        status: 'PENDING',
        deliveryAddress,
        contactNumber,
        paymentMethod,
        deliveryFee,
        totalAmount,
        itemDescription: body.itemDescription || null,
        packageDescription: body.packageDescription || null,
        items: { create: orderItems.map((i) => ({ productId: i.productId, quantity: i.quantity, price: i.price })) }
      },
      include: { items: true }
    })

    const cart = await prisma.cart.findUnique({ where: { userId }, include: { items: true } })
    if (cart && cart.items.length > 0) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } })
    }

    return NextResponse.json({ success: true, order, orderId: order.id, message: 'Order placed! 🎉' })
  } catch (error) {
    console.error('Error in orders API:', error)
    return NextResponse.json({ error: 'Failed to place order' }, { status: 500 })
  }
}
