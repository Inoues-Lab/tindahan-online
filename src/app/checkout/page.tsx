// src/app/checkout/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'

export default function CheckoutPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [cartItems, setCartItems] = useState<any[]>([])
  const [subtotal, setSubtotal] = useState(0)
  const [deliveryFee] = useState(50)
  const [loading, setLoading] = useState(true)
  const [placingOrder, setPlacingOrder] = useState(false)
  const [address, setAddress] = useState('')
  const [contactNumber, setContactNumber] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('COD')
  
  // New state for address confirmation popup
  const [showAddressPopup, setShowAddressPopup] = useState(false)
  const [registeredAddress, setRegisteredAddress] = useState('')

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (!data.user) {
          router.push('/login')
          return
        }
        setUser(data.user)
        setRegisteredAddress(data.user.address || '')
        setContactNumber(data.user.phone || '')
        
        // Show popup if user has a registered address
        if (data.user.address) {
          setShowAddressPopup(true)
        }
        
        fetchCart()
      })
      .catch(() => router.push('/login'))
  }, [router])

  const fetchCart = async () => {
    try {
      const res = await fetch('/api/cart')
      const data = await res.json()
      if (res.ok) {
        setCartItems(data.items || [])
        setSubtotal(data.total || 0)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const useRegisteredAddress = () => {
    setAddress(registeredAddress)
    setShowAddressPopup(false)
  }

  const useNewAddress = () => {
    setAddress('')
    setShowAddressPopup(false)
  }

  const placeOrder = async () => {
    if (!address.trim() || !contactNumber.trim()) {
      alert('Please fill in delivery address and contact number')
      return
    }

    if (cartItems.length === 0) {
      alert('Cart is empty')
      return
    }

    setPlacingOrder(true)

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cartItems.map(item => ({
            productId: item.product.id,
            quantity: item.quantity,
            price: item.product.price
          })),
          deliveryAddress: address,
          contactNumber,
          paymentMethod,
          totalAmount: subtotal + deliveryFee,
          deliveryFee,
          serviceType: 'GROCERY'
        })
      })

      const data = await res.json()

      if (res.ok) {
        alert('Order placed successfully!')
        router.push('/orders/my-orders')
      } else {
        alert(data.error || 'Failed to place order')
      }
    } catch (error) {
      alert('Error placing order')
    } finally {
      setPlacingOrder(false)
    }
  }

  if (loading) {
    return (
      <main style={{ minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
        <Header />
        <div style={{ textAlign: 'center', padding: '100px 20px' }}>Loading...</div>
      </main>
    )
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
      <Header />
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '20px' }}>
          🛒 Checkout
        </h1>

        {cartItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', backgroundColor: 'white', borderRadius: '12px', border: '3px solid black' }}>
            <p style={{ fontSize: '18px', color: 'gray' }}>No items in cart</p>
            <button onClick={() => router.push('/')} style={{ marginTop: '20px', padding: '12px 24px', backgroundColor: 'blue', color: 'white', border: '2px solid black', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
              Go Shopping
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '20px' }}>
            {/* Delivery Details */}
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '3px solid black' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '15px' }}>📍 Delivery Details</h2>
              
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Delivery Address</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter your complete address"
                  style={{ width: '100%', padding: '12px', border: '2px solid black', borderRadius: '8px', fontSize: '14px', minHeight: '80px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Contact Number</label>
                <input
                  type="tel"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  placeholder="09XXXXXXXXX"
                  style={{ width: '100%', padding: '12px', border: '2px solid black', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  style={{ width: '100%', padding: '12px', border: '2px solid black', borderRadius: '8px', fontSize: '14px' }}
                >
                  <option value="COD">💵 Cash on Delivery (COD)</option>
                  <option value="GCASH">📱 GCash</option>
                </select>
              </div>
            </div>

            {/* Order Summary */}
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '3px solid black', height: 'fit-content' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '15px' }}>📋 Order Summary</h2>
              
              <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '15px' }}>
                {cartItems.map((item) => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee' }}>
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: 'bold', margin: 0 }}>{item.product.name}</p>
                      <p style={{ fontSize: '12px', color: 'gray', margin: 0 }}>x{item.quantity}</p>
                    </div>
                    <p style={{ fontSize: '14px', fontWeight: 'bold', margin: 0 }}>₱{(item.product.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: '2px solid black', paddingTop: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                  <span>Subtotal:</span>
                  <span>₱{subtotal.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                  <span>Delivery Fee:</span>
                  <span>{deliveryFee.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold', borderTop: '2px solid black', paddingTop: '10px' }}>
                  <span>Total:</span>
                  <span style={{ color: 'green' }}>₱{(subtotal + deliveryFee).toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={placeOrder}
                disabled={placingOrder}
                style={{
                  width: '100%',
                  marginTop: '20px',
                  padding: '15px',
                  backgroundColor: placingOrder ? 'gray' : 'green',
                  color: 'white',
                  border: '2px solid black',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  cursor: placingOrder ? 'not-allowed' : 'pointer',
                  fontSize: '16px'
                }}
              >
                {placingOrder ? 'Placing Order...' : 'Place Order'}
              </button>

              <button
                onClick={() => router.push('/cart')}
                style={{
                  width: '100%',
                  marginTop: '10px',
                  padding: '12px',
                  backgroundColor: 'white',
                  color: 'black',
                  border: '2px solid black',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                ← Back to Cart
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Address Confirmation Popup */}
      {showAddressPopup && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '16px', border: '4px solid black', maxWidth: '500px', width: '100%', boxShadow: '0px 10px 40px rgba(0,0,0,0.3)' }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '10px' }}></div>
              <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: 'black', marginBottom: '10px' }}>Use Registered Address?</h2>
              <p style={{ fontSize: '14px', color: 'gray' }}>Would you like to use your saved address?</p>
            </div>
            
            <div style={{ backgroundColor: '#f0f0f0', padding: '15px', borderRadius: '8px', border: '2px solid #ddd', marginBottom: '20px' }}>
              <p style={{ fontSize: '14px', color: 'black', margin: 0, lineHeight: '1.5' }}>
                {registeredAddress}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={useRegisteredAddress}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: 'green',
                  color: 'white',
                  border: '2px solid black',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                ✅ Yes, Use This Address
              </button>
              <button
                onClick={useNewAddress}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: 'white',
                  color: 'black',
                  border: '2px solid black',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                ✏️ No, Enter New Address
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}