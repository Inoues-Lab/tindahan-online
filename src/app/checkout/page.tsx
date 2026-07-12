// src/app/checkout/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useCart } from '@/context/CartContext'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    zipCode: ''
  })

  const deliveryFee = 60
  const total = cartTotal + deliveryFee

  useEffect(() => {
    if (cart.length === 0 && !loading) {
      router.push('/cart')
      return
    }
    
    // Fetch user data to auto-fill
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user)
          setFormData(prev => ({
            ...prev,
            name: data.user.name || '',
            phone: data.user.phone || ''
          }))
        }
      })
      .catch(err => console.error('Error fetching user:', err))
  }, [cart.length, router, loading])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity
          })),
          subtotal: cartTotal,
          deliveryFee: deliveryFee,
          total: total,
          address: `${formData.address}, ${formData.city}, ${formData.zipCode}`,
          contactNumber: formData.phone,
          paymentMethod: 'COD'
        })
      })

      const data = await response.json()

      if (response.ok) {
        clearCart()
        router.push('/orders/my-orders')
      } else {
        alert(data.error || 'Failed to place order')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Error placing order')
    } finally {
      setLoading(false)
    }
  }

  if (cart.length === 0) {
    return null
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: 'white' }}>
      <Header />
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '30px' }}>Checkout</h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Delivery Information</h2>
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '2px solid black', fontSize: '16px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="09XX XXX XXXX"
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '2px solid black', fontSize: '16px' }}
                />
                <p style={{ fontSize: '12px', color: 'gray', marginTop: '5px' }}>
                   Auto-filled from your profile. Rider will call you here.
                </p>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Street Address</label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '2px solid black', fontSize: '16px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>City</label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '2px solid black', fontSize: '16px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>ZIP Code</label>
                <input
                  type="text"
                  required
                  value={formData.zipCode}
                  onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '2px solid black', fontSize: '16px' }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  backgroundColor: loading ? 'gray' : 'green',
                  color: 'white',
                  padding: '15px',
                  borderRadius: '8px',
                  border: '2px solid black',
                  fontWeight: 'bold',
                  fontSize: '18px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  marginTop: '10px'
                }}
              >
                {loading ? 'Processing...' : 'Place Order (COD)'}
              </button>
            </form>
          </div>

          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Order Summary</h2>
            
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '2px solid black', marginBottom: '20px' }}>
              {cart.map((item) => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee' }}>
                  <div>
                    <p style={{ fontWeight: 'bold', margin: 0 }}>{item.name}</p>
                    <p style={{ fontSize: '14px', color: 'gray', margin: 0 }}>Qty: {item.quantity}</p>
                  </div>
                  <p style={{ fontWeight: 'bold', margin: 0 }}>₱{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>

            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '3px solid black' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span>Subtotal:</span>
                <strong>₱{cartTotal.toFixed(2)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span>Delivery Fee:</span>
                <strong>₱{deliveryFee.toFixed(2)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', borderTop: '2px solid black', fontSize: '20px', fontWeight: 'bold' }}>
                <span>Total:</span>
                <span style={{ color: 'green' }}>₱{total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}