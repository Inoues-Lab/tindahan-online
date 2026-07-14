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
  const [showAddressPopup, setShowAddressPopup] = useState(false)
  const [useRegisteredAddress, setUseRegisteredAddress] = useState<boolean | null>(null)
  const [customAddress, setCustomAddress] = useState('')

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user)
          setPhone(data.user.phone || '')
          
          // Load cart from localStorage
          const savedCart = localStorage.getItem('cart')
          if (savedCart) {
            try {
              setCart(JSON.parse(savedCart))
            } catch (e) {
              setCart([])
            }
          }
          
          // Show address popup if user has registered address
          if (data.user.address) {
            setShowAddressPopup(true)
          } else {
            setUseRegisteredAddress(false)
          }
        } else {
          router.push('/login')
        }
      })
      .catch(() => router.push('/login'))
  }, [router])

  const handleAddressChoice = (useRegistered: boolean) => {
    setUseRegisteredAddress(useRegistered)
    if (useRegistered && user?.address) {
      setAddress(user.address)
    }
    setShowAddressPopup(false)
  }

  const handleCheckout = async () => {
    const finalAddress = useRegisteredAddress ? address : customAddress
    
    if (!finalAddress || !phone) {
      alert('Please provide delivery address and phone number')
      return
    }
    
    setLoading(true)
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map(item => ({
            productId: item.id,
            quantity: item.quantity
          })),
          deliveryAddress: finalAddress,
          contactNumber: phone
        })
      })
      const data = await response.json()
      if (response.ok) {
        alert('Order placed successfully!')
        localStorage.removeItem('cart')
        router.push('/orders/my-orders')
      } else {
        alert(data.error || 'Checkout failed')
      }
    } catch (error) {
      alert('Network error')
    } finally {
      setLoading(false)
    }
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  if (!user) {
    return (
      <main style={{ minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
        <Header />
        <div style={{ textAlign: 'center', padding: '100px 20px' }}>
          <p>Loading...</p>
        </div>
      </main>
    )
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
      <Header />
      
      {/* Address Popup Modal */}
      {showAddressPopup && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '12px',
            border: '3px solid black',
            maxWidth: '500px',
            width: '90%'
          }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', textAlign: 'center' }}>
              Delivery Address
            </h2>
            <p style={{ fontSize: '16px', marginBottom: '20px', textAlign: 'center' }}>
              Do you want to use your registered address?
            </p>
            <div style={{ backgroundColor: '#f0f0f0', padding: '15px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>
              <strong>Your registered address:</strong><br/>
              {user.address}
            </div>
            <div style={{ display: 'flex', gap: '15px' }}>
              <button
                onClick={() => handleAddressChoice(true)}
                style={{
                  flex: 1,
                  padding: '15px',
                  backgroundColor: 'green',
                  color: 'white',
                  border: '2px solid black',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  fontSize: '16px',
                  cursor: 'pointer'
                }}
              >
                Yes, use it
              </button>
              <button
                onClick={() => handleAddressChoice(false)}
                style={{
                  flex: 1,
                  padding: '15px',
                  backgroundColor: 'blue',
                  color: 'white',
                  border: '2px solid black',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  fontSize: '16px',
                  cursor: 'pointer'
                }}
              >
                No, use different address
              </button>
            </div>
          </div>
        </div>
      )}

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
                <span>Total:</span>
                <span style={{ color: 'green' }}>₱{total.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>

        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '2px solid black' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '15px' }}>Delivery Details</h2>
          
          {useRegisteredAddress === true && (
            <div style={{ marginBottom: '15px', padding: '15px', backgroundColor: '#e8f5e9', borderRadius: '8px', border: '2px solid green' }}>
              <strong>Using registered address:</strong>
              <p style={{ marginTop: '5px' }}>{address}</p>
            </div>
          )}

          {useRegisteredAddress === false && (
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Delivery Address</label>
              <textarea
                value={customAddress}
                onChange={(e) => setCustomAddress(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '2px solid black', minHeight: '80px', boxSizing: 'border-box' }}
                placeholder="Enter delivery address (work, office, etc.)"
              />
              <p style={{ fontSize: '12px', color: 'gray', marginTop: '5px' }}>
                This won't change your registered address
              </p>
            </div>
          )}

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Contact Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '2px solid black', boxSizing: 'border-box' }}
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