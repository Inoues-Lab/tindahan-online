// src/app/padala/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'

const deliveryZones = {
  zone1: { name: 'Near Barangays (0-7km)', baseFee: 40, locations: ['Dardarat', 'Farola', 'Tarangotong', 'Bimmanga', 'Dacutan', 'Las-ud', 'Garitan', 'Tallaoen', 'Becques', 'Magsaysay', 'Del Pilar', 'Cabugbugan', 'Rizal', 'Quirino', 'Jardin', 'Sawat', 'Ranget', 'Baritao', 'Bario-an', 'Libtong', 'Tagudin'] },
  zone2: { name: 'Far Barangays (7-15km)', baseFee: 60, locations: ['Tampugo', 'Borono', 'Pudoc West', 'Pudoc East', 'Bucao West', 'Bucao East', 'Salvacion', 'Gabur', 'Malacañang', 'Ambalayat', 'Lubnac', 'Bitalag', 'Lacong', 'Lantag', 'Pallogan', 'Pacac', 'Cabaroan', 'Cabulanglangan', 'Ag-aguman', 'Bio', 'Baracbac', 'San Miguel', 'Pula'] },
  zone3: { name: 'Nearby Towns', baseFee: 80, locations: ['Sudipen', 'Bangar', 'Suyo', 'Alilem', 'Luna', 'Sugpon'] },
  zone4: { name: 'Far Towns/Cities', baseFee: 100, locations: ['Candon', 'San Fernando', 'Vigan', 'Santa', 'Tagburot'] }
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

export default function PadalaPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)

  // Sender details
  const [senderName, setSenderName] = useState('')
  const [senderAddress, setSenderAddress] = useState('')
  const [senderContact, setSenderContact] = useState('')

  // Receiver details
  const [receiverName, setReceiverName] = useState('')
  const [receiverAddress, setReceiverAddress] = useState('')
  const [receiverContact, setReceiverContact] = useState('')

  // Package details
  const [packageDescription, setPackageDescription] = useState('')
  const [estimatedWeight, setEstimatedWeight] = useState('')
  const [deliveryZone, setDeliveryZone] = useState<any>(null)

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user)
          setSenderName(data.user.name || '')
          setSenderAddress(data.user.address || '')
          setSenderContact(data.user.phone || '')
        } else {
          router.push('/login')
        }
      })
      .catch(() => router.push('/login'))
  }, [router])

  useEffect(() => {
    if (receiverAddress) {
      const zone = detectDeliveryZone(receiverAddress)
      setDeliveryZone(zone)
    }
  }, [receiverAddress])

  const weight = parseFloat(estimatedWeight) || 0.5
  const baseFee = deliveryZone?.baseFee || 40
  const weightFee = weight * 5
  const deliveryFee = baseFee + weightFee

  const handleSubmit = async () => {
    if (!senderName || !senderAddress || !senderContact || !receiverName || !receiverAddress || !receiverContact || !packageDescription) {
      alert('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceType: 'PADALA',
          deliveryAddress: receiverAddress,
          contactNumber: receiverContact,
          deliveryFee: deliveryFee,
          senderName,
          senderAddress,
          senderContact,
          receiverName,
          receiverAddress,
          receiverContact,
          packageDescription,
          requiredLoadKg: weight
        })
      })
      const data = await response.json()
      if (response.ok) {
        alert('PADALA request submitted successfully! A rider will pick up and deliver your package.')
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
      
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
        <div style={{ backgroundColor: '#d1ecf1', padding: '20px', borderRadius: '12px', border: '3px solid #17a2b8', marginBottom: '20px', boxShadow: '3px 3px 0px black' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '10px', color: '#0c5460' }}> PADALA Service</h1>
          <p style={{ fontSize: '16px', color: '#0c5460', lineHeight: '1.6' }}>
            Send packages and items safely! Our riders will pick up from you and deliver to the receiver with photo proof.
          </p>
        </div>

        {/* Sender Details */}
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '3px solid black', marginBottom: '20px', boxShadow: '3px 3px 0px black' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '15px', color: 'black' }}> Sender Details (You)</h2>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: 'black', fontSize: '16px' }}>Full Name *</label>
            <input type="text" value={senderName} onChange={(e) => setSenderName(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid black', boxSizing: 'border-box', fontSize: '16px', fontWeight: 'bold', color: 'black', backgroundColor: 'white' }} placeholder="Your full name" />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: 'black', fontSize: '16px' }}>Pickup Address *</label>
            <textarea value={senderAddress} onChange={(e) => setSenderAddress(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid black', minHeight: '80px', boxSizing: 'border-box', fontSize: '16px', fontWeight: 'bold', color: 'black', backgroundColor: 'white' }} placeholder="Where should the rider pick up the package?" />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: 'black', fontSize: '16px' }}>Contact Number *</label>
            <input type="text" value={senderContact} onChange={(e) => setSenderContact(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid black', boxSizing: 'border-box', fontSize: '16px', fontWeight: 'bold', color: 'black', backgroundColor: 'white' }} placeholder="09xxxxxxxxx" />
          </div>
        </div>

        {/* Receiver Details */}
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '3px solid black', marginBottom: '20px', boxShadow: '3px 3px 0px black' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '15px', color: 'black' }}>📍 Receiver Details</h2>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: 'black', fontSize: '16px' }}>Receiver Name *</label>
            <input type="text" value={receiverName} onChange={(e) => setReceiverName(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid black', boxSizing: 'border-box', fontSize: '16px', fontWeight: 'bold', color: 'black', backgroundColor: 'white' }} placeholder="Receiver's full name" />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: 'black', fontSize: '16px' }}>Delivery Address *</label>
            <textarea value={receiverAddress} onChange={(e) => setReceiverAddress(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid black', minHeight: '80px', boxSizing: 'border-box', fontSize: '16px', fontWeight: 'bold', color: 'black', backgroundColor: 'white' }} placeholder="Where should the package be delivered?" />
            {deliveryZone && receiverAddress && (
              <p style={{ fontSize: '12px', color: 'blue', marginTop: '5px' }}>
                📍 Detected: {deliveryZone.zoneName} (Base fee: ₱{deliveryZone.baseFee})
              </p>
            )}
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: 'black', fontSize: '16px' }}>Receiver Contact Number *</label>
            <input type="text" value={receiverContact} onChange={(e) => setReceiverContact(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid black', boxSizing: 'border-box', fontSize: '16px', fontWeight: 'bold', color: 'black', backgroundColor: 'white' }} placeholder="09xxxxxxxxx" />
          </div>
        </div>

        {/* Package Details */}
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '3px solid black', marginBottom: '20px', boxShadow: '3px 3px 0px black' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '15px', color: 'black' }}> Package Details</h2>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: 'black', fontSize: '16px' }}>Package Description *</label>
            <textarea value={packageDescription} onChange={(e) => setPackageDescription(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid black', minHeight: '80px', boxSizing: 'border-box', fontSize: '16px', fontWeight: 'bold', color: 'black', backgroundColor: 'white' }} placeholder="Describe the package (e.g., Box of clothes, documents, food items)" />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: 'black', fontSize: '16px' }}>Estimated Weight (kg)</label>
            <input type="number" value={estimatedWeight} onChange={(e) => setEstimatedWeight(e.target.value)} step="0.1" min="0.1" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid black', boxSizing: 'border-box', fontSize: '16px', fontWeight: 'bold', color: 'black', backgroundColor: 'white' }} placeholder="e.g., 2.5" />
            <p style={{ fontSize: '12px', color: 'gray', marginTop: '5px' }}>ℹ️ Fee: ₱5 per kg</p>
          </div>
        </div>

        {/* Delivery Fee & Submit */}
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '3px solid black', boxShadow: '3px 3px 0px black' }}>
          <div style={{ backgroundColor: '#f0f0f0', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '2px solid black' }}>
            <p style={{ fontSize: '16px', color: 'black', marginBottom: '5px' }}>
              <strong>Delivery Fee:</strong> ₱{deliveryFee.toFixed(2)}
            </p>
            <p style={{ fontSize: '12px', color: 'gray' }}>
              (Base ₱{baseFee} + {weight}kg × ₱5) - {deliveryZone?.zoneName || 'Enter receiver address'}
            </p>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: '100%', padding: '15px',
              backgroundColor: loading ? 'gray' : 'blue',
              color: 'white', border: '2px solid black', borderRadius: '8px',
              fontSize: '18px', fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '3px 3px 0px black'
            }}
          >
            {loading ? 'Processing...' : ' Submit PADALA Request'}
          </button>
        </div>
      </div>
    </main>
  )
}