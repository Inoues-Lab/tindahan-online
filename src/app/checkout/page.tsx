// src/app/checkout/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'

// Zone-based delivery fees from Dardarat, Tagudin
const deliveryZones = {
  zone1: {
    name: 'Near Barangays (0-7km)',
    baseFee: 40,
    locations: [
      'Dardarat', 'Farola', 'Tarangotong', 'Bimmanga', 'Dacutan',
      'Las-ud', 'Garitan', 'Tallaoen', 'Becques', 'Magsaysay',
      'Del Pilar', 'Cabugbugan', 'Rizal', 'Quirino', 'Jardin',
      'Sawat', 'Ranget', 'Baritao', 'Bario-an', 'Libtong', 'Tagudin'
    ]
  },
  zone2: {
    name: 'Far Barangays (7-15km)',
    baseFee: 60,
    locations: [
      'Tampugo', 'Borono', 'Pudoc West', 'Pudoc East',
      'Bucao West', 'Bucao East', 'Salvacion', 'Gabur',
      'Malacañang', 'Ambalayat', 'Lubnac', 'Bitalag',
      'Lacong', 'Lantag', 'Pallogan', 'Pacac', 'Cabaroan',
      'Cabulanglangan', 'Ag-aguman', 'Bio', 'Baracbac', 'San Miguel', 'Pula'
    ]
  },
  zone3: {
    name: 'Nearby Towns',
    baseFee: 80,
    locations: [
      'Sudipen', 'Bangar', 'Suyo', 'Alilem', 'Luna', 'Sugpon'
    ]
  },
  zone4: {
    name: 'Far Towns/Cities',
    baseFee: 100,
    locations: [
      'Candon', 'San Fernando', 'Vigan', 'Santa', 'Tagburot'
    ]
  }
}

// Function to auto-detect zone from address
function detectDeliveryZone(address: string): { zone: string; baseFee: number; zoneName: string } {
  const addressLower = address.toLowerCase()
  
  // Check each zone
  for (const [zoneKey, zoneData] of Object.entries(deliveryZones)) {
    for (const location of zoneData.locations) {
      if (addressLower.includes(location.toLowerCase())) {
        return {
          zone: zoneKey,
          baseFee: zoneData.baseFee,
          zoneName: zoneData.name
        }
      }
    }
  }
  
  // Default to zone 4 if not found
  return {
    zone: 'zone4',
    baseFee: 100,
    zoneName: 'Far Towns/Cities (Default)'
  }
}

export default function CheckoutPage() {
  const router = useRouter()
  const [cart, setCart] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  
  const [showPopup, setShowPopup] = useState(false)
  const [useRegisteredAddress, setUseRegisteredAddress] = useState<boolean | null>(null)
  const [registeredAddress, setRegisteredAddress] = useState('')
  const [customAddress, setCustomAddress] = useState('')
  const [phone, setPhone] = useState('')
  
  const [deliveryZone, setDeliveryZone] = useState<any>(null)

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user)
          setPhone(data.user.phone || '')
          setRegisteredAddress(data.user.address || '')
          
          const savedCart = localStorage.getItem('cart')
          if (savedCart) {
            try { setCart(JSON.parse(savedCart)) } catch (e) { setCart([]) }
          }
          
          if (data.user.address && data.user.address.trim() !== '') {
            setShowPopup(true)
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
    setShowPopup(false)
  }

  // Determine which address is being used
  const finalAddress = useRegisteredAddress === true ? registeredAddress : 
                       useRegisteredAddress === false ? customAddress : ''

  // Auto-detect zone and calculate fee when address changes
  useEffect(() => {
    if (finalAddress) {
      const zone = detectDeliveryZone(finalAddress)
      setDeliveryZone(zone)
    }
  }, [finalAddress])

  // Calculate delivery fee
  const totalWeight = cart.reduce((sum, item) => sum + (item.weightKg * item.quantity), 0)
  const baseFee = deliveryZone?.baseFee || 40
  const weightFee = totalWeight * 5
  const deliveryFee = baseFee + weightFee
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const total = subtotal + deliveryFee

  const handleCheckout = async () => {
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
          contactNumber: phone,
          deliveryFee: deliveryFee,
          deliveryZone: deliveryZone?.zone || 'zone1'
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
      
      {showPopup && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white', padding: '30px', borderRadius: '12px',
            border: '3px solid black', maxWidth: '500px', width: '90%', boxShadow: '8px 8px 0px black'
          }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', textAlign: 'center', color: 'black' }}>
               Delivery Address
            </h2>
            <p style={{ fontSize: '18px', marginBottom: '20px', textAlign: 'center', color: 'black', fontWeight: 'bold' }}>
              Do you want to use your current address?
            </p>
            <div style={{ backgroundColor: '#f0f0f0', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '2px solid black' }}>
              <p style={{ fontWeight: 'bold', marginBottom: '5px', color: 'black' }}>Your current address:</p>
              <p style={{ color: 'black', fontSize: '14px' }}>{registeredAddress}</p>
            </div>
            <div style={{ display: 'flex', gap: '15px' }}>
              <button onClick={() => handleAddressChoice(true)} style={{
                flex: 1, padding: '15px', backgroundColor: 'green', color: 'white',
                border: '2px solid black', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', boxShadow: '3px 3px 0px black'
              }}>✅ Yes</button>
              <button onClick={() => handleAddressChoice(false)} style={{
                flex: 1, padding: '15px', backgroundColor: 'blue', color: 'white',
                border: '2px solid black', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', boxShadow: '3px 3px 0px black'
              }}>❌ No</button>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px', color: 'black' }}>
                <span>Subtotal:</span>
                <span style={{ fontWeight: 'bold' }}>₱{subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', color: 'black' }}>
                <span>Delivery Fee:</span>
                <span style={{ fontWeight: 'bold', color: 'blue' }}>
                  ₱{deliveryFee.toFixed(2)} 
                  <span style={{ fontSize: '12px', color: 'gray', fontWeight: 'normal' }}>
                    {' '}(Base ₱{baseFee} + {totalWeight.toFixed(1)}kg × ₱5)
                    {deliveryZone && <span> - {deliveryZone.zoneName}</span>}
                  </span>
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginTop: '15px', fontSize: '20px', borderTop: '2px solid black', paddingTop: '15px' }}>
                <span style={{ color: 'black' }}>Total:</span>
                <span style={{ color: 'green', fontSize: '24px' }}>₱{total.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>

        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '3px solid black', boxShadow: '3px 3px 0px black' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '15px', color: 'black' }}>Delivery Details</h2>
          
          {useRegisteredAddress === true && (
            <div style={{ marginBottom: '15px', padding: '15px', backgroundColor: '#e8f5e9', borderRadius: '8px', border: '2px solid green' }}>
              <p style={{ fontWeight: 'bold', color: 'black', marginBottom: '5px' }}>📍 Delivery Address:</p>
              <p style={{ color: 'black', fontWeight: 'bold' }}>{registeredAddress}</p>
              {deliveryZone && (
                <p style={{ fontSize: '12px', color: 'blue', marginTop: '5px' }}>
                  Zone: {deliveryZone.zoneName} (Base fee: ₱{deliveryZone.baseFee})
                </p>
              )}
            </div>
          )}

          {useRegisteredAddress === false && (
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: 'black', fontSize: '16px' }}>Delivery Address</label>
              <textarea
                value={customAddress}
                onChange={(e) => setCustomAddress(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid black', minHeight: '80px', boxSizing: 'border-box', fontSize: '16px', fontWeight: 'bold', color: 'black', backgroundColor: 'white' }}
                placeholder="Enter delivery address (work, office, etc.)"
              />
              {deliveryZone && customAddress && (
                <p style={{ fontSize: '12px', color: 'blue', marginTop: '5px' }}>
                   Detected: {deliveryZone.zoneName} (Base fee: ₱{deliveryZone.baseFee})
                </p>
              )}
              <p style={{ fontSize: '12px', color: 'gray', marginTop: '5px' }}>
                ℹ️ This won't change your registered address
              </p>
            </div>
          )}

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: 'black', fontSize: '16px' }}>Contact Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid black', boxSizing: 'border-box', fontSize: '16px', fontWeight: 'bold', color: 'black', backgroundColor: 'white' }}
              placeholder="09xxxxxxxxx"
            />
          </div>

          <button
            onClick={handleCheckout}
            disabled={loading || cart.length === 0 || !finalAddress}
            style={{
              width: '100%', padding: '15px',
              backgroundColor: (cart.length === 0 || !finalAddress) ? 'gray' : 'green',
              color: 'white', border: '2px solid black', borderRadius: '8px',
              fontSize: '18px', fontWeight: 'bold',
              cursor: (cart.length === 0 || !finalAddress) ? 'not-allowed' : 'pointer',
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