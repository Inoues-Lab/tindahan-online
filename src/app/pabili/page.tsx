'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'

const deliveryZones = {
  zone1: {
    name: 'Near Barangays (0-7km)',
    baseFee: 40,
    locations: ['Dardarat', 'Farola', 'Tarangotong', 'Bimmanga', 'Dacutan', 'Las-ud', 'Garitan', 'Tallaoen', 'Becques', 'Magsaysay', 'Del Pilar', 'Cabugbugan', 'Rizal', 'Quirino', 'Jardin', 'Sawat', 'Ranget', 'Baritao', 'Bario-an', 'Libtong', 'Tagudin']
  },
  zone2: {
    name: 'Far Barangays (7-15km)',
    baseFee: 60,
    locations: ['Tampugo', 'Borono', 'Pudoc West', 'Pudoc East', 'Bucao West', 'Bucao East', 'Salvacion', 'Gabur', 'Malacañang', 'Ambalayat', 'Lubnac', 'Bitalag', 'Lacong', 'Lantag', 'Pallogan', 'Pacac', 'Cabaroan', 'Cabulanglangan', 'Ag-aguman', 'Bio', 'Baracbac', 'San Miguel', 'Pula']
  },
  zone3: {
    name: 'Nearby Towns',
    baseFee: 80,
    locations: ['Sudipen', 'Bangar', 'Suyo', 'Alilem', 'Luna', 'Sugpon']
  },
  zone4: {
    name: 'Far Towns/Cities',
    baseFee: 100,
    locations: ['Candon', 'San Fernando', 'Vigan', 'Santa', 'Tagburot']
  }
}

function detectDeliveryZone(address: string): { zone: string; baseFee: number; zoneName: string } {
  const addressLower = address.toLowerCase()
  for (const [zoneKey, zoneData] of Object.entries(deliveryZones)) {
    for (const location of zoneData.locations) {
      if (addressLower.includes(location.toLowerCase())) {
        return { zone: zoneKey, baseFee: zoneData.baseFee, zoneName: zoneData.name }
      }
    }
  }
  return { zone: 'zone4', baseFee: 100, zoneName: 'Far Towns/Cities (Default)' }
}

const inputStyle = {
  width: '100%',
  padding: '12px',
  borderRadius: '8px',
  border: '2px solid black',
  boxSizing: 'border-box',
  fontSize: '16px',
  backgroundColor: 'white'
}

const labelStyle = {
  display: 'block',
  fontWeight: 'bold',
  marginBottom: '5px',
  fontSize: '16px'
}

const cardStyle = {
  backgroundColor: 'white',
  padding: '20px',
  borderRadius: '12px',
  border: '3px solid black',
  boxShadow: '4px 4px 0px black',
  marginBottom: '20px'
}

export default function PabiliPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [showPopup, setShowPopup] = useState(false)
  const [useRegisteredAddress, setUseRegisteredAddress] = useState<boolean | null>(null)
  const [registeredAddress, setRegisteredAddress] = useState('')
  const [customAddress, setCustomAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [deliveryZone, setDeliveryZone] = useState<any>(null)

  // PABILI fields
  const [itemDescription, setItemDescription] = useState('')
  const [storeLocation, setStoreLocation] = useState('')
  const [maxAmount, setMaxAmount] = useState('')
  const [specialInstructions, setSpecialInstructions] = useState('')

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user)
          setPhone(data.user.phone || '')
          setRegisteredAddress(data.user.address || '')
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

  const finalAddress = useRegisteredAddress === true ? registeredAddress : useRegisteredAddress === false ? customAddress : ''

  useEffect(() => {
    if (finalAddress) {
      const zone = detectDeliveryZone(finalAddress)
      setDeliveryZone(zone)
    }
  }, [finalAddress])

  const totalWeight = 0.5
  const baseFee = deliveryZone?.baseFee || 40
  const weightFee = totalWeight * 5
  const deliveryFee = baseFee + weightFee

  const handleSubmit = async () => {
    if (!finalAddress || !phone || !itemDescription || !maxAmount) {
      alert('Please fill in all required fields')
      return
    }

    const maxAmountNum = parseFloat(maxAmount)
    if (maxAmountNum > 2000) {
      alert('Maximum amount per PABILI transaction is ₱2,000.00')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceType: 'PABILI',
          deliveryAddress: finalAddress,
          contactNumber: phone,
          deliveryFee: deliveryFee,
          itemDescription,
          storeLocation,
          maxAmount: maxAmountNum,
          specialInstructions
        })
      })
      const data = await response.json()
      if (response.ok) {
        alert('PABILI request submitted successfully! A rider will help you buy the items. 🛒')
        router.push('/orders')
      } else {
        alert(data.error || 'Failed to submit request')
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

      {/* CLEAN Address Popup */}
      {showPopup && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', border: '3px solid black', maxWidth: '500px', width: '100%', boxShadow: '8px 8px 0px black' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px', textAlign: 'center' }}>📍 Delivery Address</h2>
            <p style={{ fontSize: '16px', marginBottom: '20px', textAlign: 'center', color: 'gray' }}>Do you want to use your registered address?</p>
            <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '2px solid black' }}>
              <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>Your registered address:</p>
              <p style={{ fontSize: '14px', color: 'gray' }}>{registeredAddress}</p>
            </div>
            <div style={{ display: 'flex', gap: '15px' }}>
              <button
                onClick={() => handleAddressChoice(true)}
                style={{ flex: 1, padding: '15px', backgroundColor: '#4caf50', color: 'white', border: '2px solid black', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', boxShadow: '3px 3px 0px black' }}
              >
                ✅ Yes, Use This
              </button>
              <button
                onClick={() => handleAddressChoice(false)}
                style={{ flex: 1, padding: '15px', backgroundColor: 'white', color: 'black', border: '2px solid black', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', boxShadow: '3px 3px 0px black' }}
              >
                ✏️ Enter New
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '30px 20px' }}>
        {/* Service Banner - Clean Style */}
        <div style={{ backgroundColor: '#fff3e0', padding: '25px', borderRadius: '12px', border: '3px solid #ff9800', marginBottom: '20px', boxShadow: '4px 4px 0px black' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '10px', color: '#e65100' }}>🛒 PABILI Service</h1>
          <p style={{ fontSize: '16px', color: '#e65100', lineHeight: '1.6' }}>
            Need something bought? Our reliable riders will buy anything for you — <strong>PABILI ANYTHING FROM ANYWHERE, ANYTIME!</strong>
          </p>
          <p style={{ fontSize: '14px', color: '#d32f2f', marginTop: '10px', fontWeight: 'bold' }}>
            ⚠️ Maximum amount per transaction: ₱2,000.00
          </p>
        </div>

        {/* What do you need */}
        <div style={cardStyle}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '15px' }}>📝 What do you need?</h2>

          <div style={{ marginBottom: '15px' }}>
            <label style={labelStyle}>What to buy? *</label>
            <textarea
              value={itemDescription}
              onChange={(e) => setItemDescription(e.target.value)}
              style={{ ...inputStyle, minHeight: '80px', fontWeight: 'bold' }}
              placeholder="Example: 2 packs of Lucky Me noodles, 1 bottle of cooking oil, 1 loaf of bread"
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={labelStyle}>Where to buy? (Store/Location)</label>
            <input
              type="text"
              value={storeLocation}
              onChange={(e) => setStoreLocation(e.target.value)}
              style={{ ...inputStyle, fontWeight: 'bold' }}
              placeholder="Example: JTC Mall, Savers Appliance, or any store"
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={labelStyle}>Maximum Budget (₱) *</label>
            <input
              type="number"
              value={maxAmount}
              onChange={(e) => setMaxAmount(e.target.value)}
              max="2000"
              style={{ ...inputStyle, fontWeight: 'bold' }}
              placeholder="Enter max amount (up to 2000)"
            />
            <p style={{ fontSize: '12px', color: 'gray', marginTop: '5px' }}>ℹ️ Maximum: ₱2,000.00 per transaction</p>
          </div>

          <div>
            <label style={labelStyle}>Special Instructions</label>
            <textarea
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              style={{ ...inputStyle, minHeight: '60px' }}
              placeholder="Any specific brand, size, or instructions?"
            />
          </div>
        </div>

        {/* Delivery Details */}
        <div style={cardStyle}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '15px' }}>📍 Delivery Details</h2>

          {useRegisteredAddress === true && (
            <div style={{ marginBottom: '15px', padding: '15px', backgroundColor: '#e8f5e9', borderRadius: '8px', border: '2px solid #4caf50' }}>
              <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>📍 Delivery Address:</p>
              <p style={{ fontWeight: 'bold' }}>{registeredAddress}</p>
              {deliveryZone && (
                <p style={{ fontSize: '12px', color: '#2196f3', marginTop: '5px', fontWeight: 'bold' }}>
                  🚚 Zone: {deliveryZone.zoneName} (Base fee: ₱{deliveryZone.baseFee})
                </p>
              )}
            </div>
          )}

          {useRegisteredAddress === false && (
            <div style={{ marginBottom: '15px' }}>
              <label style={labelStyle}>Delivery Address *</label>
              <textarea
                value={customAddress}
                onChange={(e) => setCustomAddress(e.target.value)}
                style={{ ...inputStyle, minHeight: '80px', fontWeight: 'bold' }}
                placeholder="Enter delivery address"
              />
              {deliveryZone && customAddress && (
                <p style={{ fontSize: '12px', color: '#2196f3', marginTop: '5px', fontWeight: 'bold' }}>
                  🚚 Detected: {deliveryZone.zoneName} (Base fee: ₱{deliveryZone.baseFee})
                </p>
              )}
            </div>
          )}

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Contact Number *</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{ ...inputStyle, fontWeight: 'bold' }}
              placeholder="09xxxxxxxxx"
            />
          </div>

          <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '2px solid black' }}>
            <p style={{ fontSize: '16px', marginBottom: '5px' }}>
              <strong>🚚 Delivery Fee:</strong> ₱{deliveryFee.toFixed(2)}
            </p>
            <p style={{ fontSize: '12px', color: 'gray' }}>
              (Base ₱{baseFee} + {totalWeight}kg × ₱5) — {deliveryZone?.zoneName || 'Enter address first'}
            </p>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: '100%',
              padding: '15px',
              backgroundColor: loading ? 'gray' : '#ff9800',
              color: 'white',
              border: '2px solid black',
              borderRadius: '8px',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '4px 4px 0px black'
            }}
          >
            {loading ? 'Processing...' : '🛒 Submit PABILI Request'}
          </button>
        </div>
      </div>
    </main>
  )
}