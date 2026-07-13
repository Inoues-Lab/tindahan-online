// src/app/api/orders/route.ts
// ... (keep your imports and GET function) ...

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

    // 3. Fetch products from DB and calculate REAL prices
    let totalAmount = 0
    let totalWeight = 0
    
    // FIX: Added type annotation 'any[]' here
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

    const deliveryFee = 50 + (totalWeight * 10)
    const riderPayout = deliveryFee

    // 5. Create Order and Update Stock
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          customerId: customer.id,
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