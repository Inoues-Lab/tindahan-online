// src/app/pabili/page.tsx
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

  const totalWeight = 0.5 // Default weight for PABILI
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
        alert('PABILI request submitted successfully! A rider will help you buy the items.')
        router.push('/orders/my-orders')
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
      
      {showPopup && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', border: '3px solid black', maxWidth: '500px', width: '90%', boxShadow: '8px 8px 0px black' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', textAlign: 'center', color: 'black' }}>📍 Delivery Address</h2>
            <p style={{ fontSize: '18px', marginBottom: '20px', textAlign: 'center', color: 'black', fontWeight: 'bold' }}>Do you want to use your current address?</p>
            <div style={{ backgroundColor: '#f0f0f0', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '2px solid black' }}>
              <p style={{ fontWeight: 'bold', marginBottom: '5px', color: 'black' }}>Your current address:</p>
              <p style={{ color: 'black', fontSize: '14px' }}>{registeredAddress}</p>
            </div>
            <div style={{ display: 'flex', gap: '15px' }}>
              <button onClick={() => handleAddressChoice(true)} style={{ flex: 1, padding: '15px', backgroundColor: 'green', color: 'white', border: '2px solid black', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', boxShadow: '3px 3px 0px black' }}>✅ Yes</button>
              <button onClick={() => handleAddressChoice(false)} style={{ flex: 1, padding: '15px', backgroundColor: 'blue', color: 'white', border: '2px solid black', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', boxShadow: '3px 3px 0px black' }}>❌ No</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
        <div style={{ backgroundColor: '#fff3cd', padding: '20px', borderRadius: '12px', border: '3px solid #ffc107', marginBottom: '20px', boxShadow: '3px 3px 0px black' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '10px', color: '#856404' }}>🛒 PABILI Service</h1>
          <p style={{ fontSize: '16px', color: '#856404', lineHeight: '1.6' }}>
            Need something bought? Our reliable riders will buy anything for you! From medicines to cooking oil, toiletries, pandesal, sushi bake, and even lotto tickets — <strong>PABILI ANYTHING FROM ANYWHERE, ANYTIME!</strong>
          </p>
          <p style={{ fontSize: '14px', color: '#d9534f', marginTop: '10px', fontWeight: 'bold' }}>
            ⚠️ Maximum amount per transaction: ₱2,000.00
          </p>
        </div>

        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '3px solid black', marginBottom: '20px', boxShadow: '3px 3px 0px black' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '15px', color: 'black' }}>📝 What do you need?</h2>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: 'black', fontSize: '16px' }}>
              What to buy? *
            </label>
            <textarea
              value={itemDescription}
              onChange={(e) => setItemDescription(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid black', minHeight: '80px', boxSizing: 'border-box', fontSize: '16px', fontWeight: 'bold', color: 'black', backgroundColor: 'white' }}
              placeholder="Example: 2 packs of Lucky Me noodles, 1 bottle of cooking oil, 1 loaf of bread"
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: 'black', fontSize: '16px' }}>
              Where to buy? (Store/Location)
            </label>
            <input
              type="text"
              value={storeLocation}
              onChange={(e) => setStoreLocation(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid black', boxSizing: 'border-box', fontSize: '16px', fontWeight: 'bold', color: 'black', backgroundColor: 'white' }}
              placeholder="Example: JTC Mall, Savers Appliance, or any store"
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: 'black', fontSize: '16px' }}>
              Maximum Budget (₱) *
            </label>
            <input
              type="number"
              value={maxAmount}
              onChange={(e) => setMaxAmount(e.target.value)}
              max="2000"
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid black', boxSizing: 'border-box', fontSize: '16px', fontWeight: 'bold', color: 'black', backgroundColor: 'white' }}
              placeholder="Enter max amount (up to 2000)"
            />
            <p style={{ fontSize: '12px', color: 'gray', marginTop: '5px' }}>
              ℹ️ Maximum: ₱2,000.00 per transaction
            </p>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: 'black', fontSize: '16px' }}>
              Special Instructions
            </label>
            <textarea
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid black', minHeight: '60px', boxSizing: 'border-box', fontSize: '16px', color: 'black', backgroundColor: 'white' }}
              placeholder="Any specific brand, size, or instructions?"
            />
          </div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '3px solid black', boxShadow: '3px 3px 0px black' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '15px', color: 'black' }}>📍 Delivery Details</h2>
          
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
                placeholder="Enter delivery address"
              />
              {deliveryZone && customAddress && (
                <p style={{ fontSize: '12px', color: 'blue', marginTop: '5px' }}>
                  📍 Detected: {deliveryZone.zoneName} (Base fee: ₱{deliveryZone.baseFee})
                </p>
              )}
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

          <div style={{ backgroundColor: '#f0f0f0', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '2px solid black' }}>
            <p style={{ fontSize: '16px', color: 'black', marginBottom: '5px' }}>
              <strong>Delivery Fee:</strong> ₱{deliveryFee.toFixed(2)}
            </p>
            <p style={{ fontSize: '12px', color: 'gray' }}>
              (Base {baseFee} + {totalWeight}kg × ₱5) - {deliveryZone?.zoneName || 'Select address'}
            </p>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: '100%', padding: '15px',
              backgroundColor: loading ? 'gray' : 'green',
              color: 'white', border: '2px solid black', borderRadius: '8px',
              fontSize: '18px', fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '3px 3px 0px black'
            }}
          >
            {loading ? 'Processing...' : '🛒 Submit PABILI Request'}
          </button>
        </div>
      </div>
    </main>
  )
}