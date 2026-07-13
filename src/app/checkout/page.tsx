// src/app/checkout/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'

export default function CheckoutPage() {
  const router = useRouter()
  const [cart, setCart] = useState<any[]>([])
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // Check if user is logged in
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user)
          setPhone(data.user.phone || '')
          // Load cart from localStorage
          const savedCart = localStorage.getItem('cart')
          if (savedCart) setCart(JSON.parse(savedCart))
        } else {
          router.push('/login')
        }
      })
  }, [router])

  const handleCheckout = async () => {
    if (!address || !phone) {
      alert('Please fill in address and phone number')
      return
    }

    setLoading(true)

    try {
      // Send ONLY items, address, and phone. 
      // The server will calculate prices and verify user!
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map(item => ({
            productId: item.id,
            quantity: item.quantity
          })),
          deliveryAddress: address,
          contactNumber: phone
        })
      })

      const data = await response.json()

      if (response.ok) {
        alert('Order placed successfully!')
        localStorage.removeItem('cart') // Clear cart
        router.push(`/orders/confirmation?orderId=${data.order.id}`)
      } else {
        alert(data.error || 'Checkout failed')
      }
    } catch (error) {
      alert('Network error')
    } finally {
      setLoading(false)
    }
  }

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const deliveryFee = 50 // Base fee, server will calculate exact based on weight

  if (!user) return <div>Loading...</div>

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
      <Header />
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '20px' }}>Checkout</h1>
        
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '2px solid black', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '15px' }}>Order Summary</h2>
          {cart.length === 0 ? (
            <p>Your cart is empty.</p>
          ) : (
            <div>
              {cart.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                  <span>{item.name} x {item.quantity}</span>
                  <span>₱{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginTop: '20px', fontSize: '18px' }}>
                <span>Total (approx):</span>
                <span>₱{(total + deliveryFee).toFixed(2)}</span>
              </div>
              <p style={{ fontSize: '12px', color: 'gray' }}>Final price calculated on server based on weight.</p>
            </div>
          )}
        </div>

        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '2px solid black' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '15px' }}>Delivery Details</h2>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Delivery Address</label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '2px solid black', minHeight: '80px' }}
              placeholder="Enter your full address"
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Contact Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '2px solid black' }}
              placeholder="09xxxxxxxxx"
            />
          </div>

          <button
            onClick={handleCheckout}
            disabled={loading || cart.length === 0}
            style={{
              width: '100%',
              padding: '15px',
              backgroundColor: cart.length === 0 ? 'gray' : 'green',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: cart.length === 0 ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Processing...' : 'Place Order (COD)'}
          </button>
        </div>
      </div>
    </main>
  )
}