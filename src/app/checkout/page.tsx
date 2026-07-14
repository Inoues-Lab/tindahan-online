// src/app/checkout/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'

export default function CheckoutPage() {
  const router = useRouter()
  const [cart, setCart] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  
  // Address states
  const [showPopup, setShowPopup] = useState(false)
  const [useRegisteredAddress, setUseRegisteredAddress] = useState<boolean | null>(null)
  const [registeredAddress, setRegisteredAddress] = useState('')
  const [customAddress, setCustomAddress] = useState('')
  const [phone, setPhone] = useState('')

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user)
          // AUTO-FILL phone from user profile
          setPhone(data.user.phone || '')
          // Store registered address
          setRegisteredAddress(data.user.address || '')
          
          // Load cart
          const savedCart = localStorage.getItem('cart')
          if (savedCart) {
            try { setCart(JSON.parse(savedCart)) } catch (e) { setCart([]) }
          }
          
          // Show popup if user has a registered address
          if (data.user.address && data.user.address.trim() !== '') {
            setShowPopup(true)
          } else {
            // No registered address - show custom address field directly
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
    setShowPopup(false)
  }

  const handleCheckout = async () => {
    const finalAddress = useRegisteredAddress ? registeredAddress : customAddress
    
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
          items: cart.map(item => ({ productId: item.id, quantity: item.quantity })),
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
        <div style={{ textAlign: 'center', padding: '100px 20px' }}><p>Loading...</p></div>
      </main>
    )
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
      <Header />
      
      {/* POPUP - Shows when user has registered address */}
      {showPopup && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
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
            width: '90%',
            boxShadow: '8px 8px 0px black'
          }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', textAlign: 'center', color: 'black' }}>
              📍 Delivery Address
            </h2>
            <p style={{ fontSize: '18px', marginBottom: '20px', textAlign: 'center', color: 'black', fontWeight: 'bold' }}>
              Do you want to use your current address?
            </p>
            <div style={{ backgroundColor: '#f0f0f0', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '2px solid black' }}>
              <p style={{ fontWeight: 'bold', marginBottom: '5px', color: 'black' }}>Your current address:</p>
              <p style={{ color: 'black', fontSize: '14px' }}>{registeredAddress}</p>
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
                  cursor: 'pointer',
                  boxShadow: '3px 3px 0px black'
                }}
              >
                ✅ Yes
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
                  cursor: 'pointer',
                  boxShadow: '3px 3px 0px black'
                }}
              >
                ❌ No
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '20px', color: 'black' }}>Checkout</h1>
        
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '3px solid black', marginBottom: '20px', boxShadow: '3px 3px 0px black' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '15px', color: 'black' }}>Order Summary</h2>
          {cart.length === 0 ? (
            <p style={{ color: 'gray' }}>Your cart is empty.</p>
          ) : (
            <div>
              {cart.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                  <span style={{ color: 'black', fontWeight: 'bold' }}>{item.name} x {item.quantity}</span>
                  <span style={{ color: 'green', fontWeight: 'bold' }}>₱{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginTop: '20px', fontSize: '18px' }}>
                <span style={{ color: 'black' }}>Total:</span>
                <span style={{ color: 'green', fontSize: '24px' }}>₱{total.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>

        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '3px solid black', boxShadow: '3px 3px 0px black' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '15px', color: 'black' }}>Delivery Details</h2>
          
          {/* Show registered address if "Yes" was clicked */}
          {useRegisteredAddress === true && (
            <div style={{ marginBottom: '15px', padding: '15px', backgroundColor: '#e8f5e9', borderRadius: '8px', border: '2px solid green' }}>
              <p style={{ fontWeight: 'bold', color: 'black', marginBottom: '5px' }}>📍 Using your current address:</p>
              <p style={{ color: 'black', fontWeight: 'bold' }}>{registeredAddress}</p>
            </div>
          )}

          {/* Show custom address input if "No" was clicked OR no registered address */}
          {useRegisteredAddress === false && (
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: 'black', fontSize: '16px' }}>
                Delivery Address
              </label>
              <textarea
                value={customAddress}
                onChange={(e) => setCustomAddress(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '2px solid black',
                  minHeight: '80px',
                  boxSizing: 'border-box',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: 'black',
                  backgroundColor: 'white'
                }}
                placeholder="Enter delivery address (work, office, etc.)"
              />
              <p style={{ fontSize: '12px', color: 'gray', marginTop: '5px' }}>
                ℹ️ This won't change your registered address
              </p>
            </div>
          )}

          {/* Phone Number - AUTO-FILLED from profile */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: 'black', fontSize: '16px' }}>
              Contact Number
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '2px solid black',
                boxSizing: 'border-box',
                fontSize: '16px',
                fontWeight: 'bold',
                color: 'black',
                backgroundColor: 'white'
              }}
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
              border: '2px solid black',
              borderRadius: '8px',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: cart.length === 0 ? 'not-allowed' : 'pointer',
              boxShadow: '3px 3px 0px black'
            }}
          >
            {loading ? 'Processing...' : 'Place Order (COD)'}
          </button>
        </div>
      </div>
    </main>
  )
}