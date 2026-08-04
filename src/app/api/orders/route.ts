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
    const { serviceType, items, deliveryAddress, contactNumber, deliveryFee, itemDescription, storeLocation, maxAmount, specialInstructions, senderName, senderAddress, senderContact, receiverName, receiverAddress, receiverContact, packageDescription, requiredLoadKg } = body

    if (!deliveryAddress || !contactNumber) {
      return NextResponse.json({ error: 'Missing delivery details' }, { status: 400 })
    }

    let subtotal = 0
    let totalWeight = requiredLoadKg || 0
    const orderItemsData: any[] = []

    // Handle GROCERY orders
    if (serviceType === 'GROCERY' || !serviceType) {
      if (!items || !Array.isArray(items) || items.length === 0) {
        return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
      }

      for (const item of items) {
        const product = await prisma.product.findUnique({ where: { id: item.productId } })
        if (!product) {
          return NextResponse.json({ error: `Product ${item.productId} not found` }, { status: 404 })
        }
        if (product.stock < item.quantity) {
          return NextResponse.json({ error: `Not enough stock for ${product.name}` }, { status: 400 })
        }

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
    }

    const finalDeliveryFee = deliveryFee || (40 + (totalWeight * 5))
    const riderPayout = finalDeliveryFee * 0.80
    const platformDeliveryShare = finalDeliveryFee * 0.20
    const platformProductShare = subtotal - (subtotal / 1.05)
    const totalPlatformIncome = platformProductShare + platformDeliveryShare
    const totalAmount = serviceType === 'GROCERY' || !serviceType ? subtotal + finalDeliveryFee : finalDeliveryFee

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          customerId: customer.id,
          serviceType: serviceType || 'GROCERY',
          totalAmount,
          deliveryFee: finalDeliveryFee,
          riderPayout: riderPayout,
          platformIncome: totalPlatformIncome,
          requiredLoadKg: totalWeight,
          deliveryAddress,
          contactNumber,
          paymentMethod: 'COD',
          status: 'PENDING',
          // PABILI fields
          itemDescription: itemDescription || null,
          maxAmount: maxAmount || null,
          storeLocation: storeLocation || null,
          // PADALA fields
          senderName: senderName || null,
          senderAddress: senderAddress || null,
          senderContact: senderContact || null,
          receiverName: receiverName || null,
          receiverAddress: receiverAddress || null,
          receiverContact: receiverContact || null,
          packageDescription: packageDescription || null,
          items: serviceType === 'GROCERY' || !serviceType ? { create: orderItemsData } : undefined,
          delivery: { create: { status: 'UNASSIGNED' } }
        }
      })

      // Update stock for GROCERY orders
      if (serviceType === 'GROCERY' || !serviceType) {
        for (const item of items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } }
          })
        }
      }

      return newOrder
    })

    return NextResponse.json({ success: true, order })
  } catch (error) {
    console.error('Order creation error:', error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}