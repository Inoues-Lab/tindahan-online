// src/app/checkout/page.tsx
'use client'

import { useState } from 'react'
import { useCart } from '@/context/CartContext'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'

export default function CheckoutPage() {
  const { cart, getTotalPrice, getTotalWeight, clearCart } = useCart()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    customerName: '',
    contactNumber: '',
    deliveryAddress: '',
    paymentMethod: 'cod'
  })

  const subtotal = getTotalPrice()
  const deliveryFee = 50
  const total = subtotal + deliveryFee
  const totalWeight = getTotalWeight()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart,
          totalAmount: subtotal,
          deliveryFee,
          totalWeight,
          ...formData
        })
      })

      if (response.ok) {
        clearCart()
        alert('Order placed successfully! A rider will be assigned soon.')
        router.push('/')
      } else {
        alert('Failed to place order. Please try again.')
      }
    } catch (error) {
      alert('Error placing order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (cart.length === 0) {
    return (
      <main style={{ minHeight: '100vh', backgroundColor: 'white' }}>
        <Header />
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '60px 20px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: 'black', marginBottom: '20px' }}>Your Cart is Empty</h1>
          <p style={{ color: 'black', marginBottom: '30px', fontWeight: 'bold' }}>Add some items to get started!</p>
          <button
            onClick={() => router.push('/')}
            style={{ backgroundColor: 'green', color: 'white', padding: '15px 30px', borderRadius: '8px', fontWeight: 'bold', border: '3px solid black', cursor: 'pointer', fontSize: '16px' }}
          >
            Continue Shopping
          </button>
        </div>
      </main>
    )
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: 'white' }}>
      <Header />
      
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '30px 20px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: 'black', marginBottom: '30px', marginTop: 0 }}>Checkout</h1>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
          {/* Delivery Form */}
          <div>
            <form onSubmit={handleSubmit} style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', border: '3px solid black', boxShadow: '4px 4px 0px black' }}>
              <div style={{ marginBottom: '25px' }}>
                <label style={{ display: 'block', fontSize: '16px', fontWeight: 'bold', color: 'black', marginBottom: '10px' }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.customerName}
                  onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                  style={{ width: '100%', padding: '12px', fontSize: '16px', border: '2px solid black', borderRadius: '8px', backgroundColor: 'white', color: 'black', fontWeight: 'bold', boxSizing: 'border-box' }}
                  placeholder="Juan Dela Cruz"
                />
              </div>

              <div style={{ marginBottom: '25px' }}>
                <label style={{ display: 'block', fontSize: '16px', fontWeight: 'bold', color: 'black', marginBottom: '10px' }}>
                  Contact Number *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.contactNumber}
                  onChange={(e) => setFormData({...formData, contactNumber: e.target.value})}
                  style={{ width: '100%', padding: '12px', fontSize: '16px', border: '2px solid black', borderRadius: '8px', backgroundColor: 'white', color: 'black', fontWeight: 'bold', boxSizing: 'border-box' }}
                  placeholder="0917 123 4567"
                />
              </div>

              <div style={{ marginBottom: '25px' }}>
                <label style={{ display: 'block', fontSize: '16px', fontWeight: 'bold', color: 'black', marginBottom: '10px' }}>
                  Delivery Address *
                </label>
                <textarea
                  required
                  value={formData.deliveryAddress}
                  onChange={(e) => setFormData({...formData, deliveryAddress: e.target.value})}
                  rows={4}
                  style={{ width: '100%', padding: '12px', fontSize: '16px', border: '2px solid black', borderRadius: '8px', backgroundColor: 'white', color: 'black', fontWeight: 'bold', resize: 'vertical', boxSizing: 'border-box' }}
                  placeholder="123 Main Street, Barangay, City"
                />
              </div>

              <div style={{ marginBottom: '25px' }}>
                <label style={{ display: 'block', fontSize: '16px', fontWeight: 'bold', color: 'black', marginBottom: '10px' }}>
                  Payment Method *
                </label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                  style={{ width: '100%', padding: '12px', fontSize: '16px', border: '2px solid black', borderRadius: '8px', backgroundColor: 'white', color: 'black', fontWeight: 'bold', boxSizing: 'border-box' }}
                >
                  <option value="cod">Cash on Delivery (COD)</option>
                  <option value="gcash">GCash</option>
                  <option value="maya">Maya</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{ width: '100%', backgroundColor: loading ? 'gray' : 'green', color: 'white', padding: '15px', borderRadius: '8px', fontWeight: 'bold', fontSize: '18px', border: '3px solid black', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: loading ? 'none' : '3px 3px 0px black' }}
              >
                {loading ? 'Placing Order...' : 'Place Order'}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div>
            <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', border: '3px solid black', boxShadow: '4px 4px 0px black', position: 'sticky', top: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'black', marginBottom: '25px', marginTop: 0 }}>Order Summary</h2>
              
              <div style={{ marginBottom: '25px' }}>
                {cart.map((item) => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', borderBottom: '2px solid black', paddingBottom: '15px' }}>
                    <span style={{ color: 'black', fontWeight: 'bold', fontSize: '16px' }}>{item.name} x{item.quantity}</span>
                    <span style={{ color: 'black', fontWeight: 'bold', fontSize: '16px' }}>₱{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: '3px solid black', paddingTop: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ color: 'black', fontWeight: 'bold', fontSize: '16px' }}>Subtotal</span>
                  <span style={{ color: 'black', fontWeight: 'bold', fontSize: '16px' }}>₱{subtotal.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ color: 'black', fontWeight: 'bold', fontSize: '16px' }}>Delivery Fee</span>
                  <span style={{ color: 'black', fontWeight: 'bold', fontSize: '16px' }}>₱{deliveryFee.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ color: 'black', fontWeight: 'bold', fontSize: '16px' }}>Total Weight</span>
                  <span style={{ color: 'black', fontWeight: 'bold', fontSize: '16px' }}>{totalWeight.toFixed(2)} kg</span>
                </div>
                <div style={{ borderTop: '3px solid black', paddingTop: '15px', display: 'flex', justifyContent: 'space-between', fontSize: '24px' }}>
                  <span style={{ color: 'black', fontWeight: 'bold' }}>Total</span>
                  <span style={{ color: 'darkgreen', fontWeight: 'bold' }}>₱{total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}