const handleCheckout = async () => {
  const cartItems = cart.map(item => ({
    productId: item.id,
    quantity: item.quantity
  }))

  const response = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: cartItems,
      deliveryAddress: address,
      contactNumber: phone
      // DO NOT SEND: totalAmount, customerId, deliveryFee! The server calculates these.
    })
  })
  
  // handle response...
}