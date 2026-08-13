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

export default function PadalaPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)

  // Address popup states
  const [showSenderPopup, setShowSenderPopup] = useState(false)
  const [showReceiverPopup, setShowReceiverPopup] = useState(false)
  const [useRegisteredSender, setUseRegisteredSender] = useState<boolean | null>(null)
  const [useRegisteredReceiver, setUseRegisteredReceiver] = useState<boolean | null>(null)

  // Sender details
  const [senderName, setSenderName] = useState('')
  const [senderAddress, setSenderAddress] = useState('')
  const [senderContact, setSenderContact] = useState('')
  const [customSenderAddress, setCustomSenderAddress] = useState('')

  // Receiver details
  const [receiverName, setReceiverName] = useState('')
  const [receiverAddress, setReceiverAddress] = useState('')
  const [receiverContact, setReceiverContact] = useState('')
  const [customReceiverAddress, setCustomReceiverAddress] = useState('')

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
          setSenderContact(data.user.phone || '')

          if (data.user.address && data.user.address.trim() !== '') {
            setShowSenderPopup(true)
          } else {
            setUseRegisteredSender(false)
          }
        } else {
          router.push('/login')
        }
      })
      .catch(() => router.push('/login'))
  }, [router])

  // Show receiver popup after sender is resolved
  useEffect(() => {
    if (useRegisteredSender !== null && !showSenderPopup) {
      if (user?.address && user.address.trim() !== '') {
        setShowReceiverPopup(true)
      } else {
        setUseRegisteredReceiver(false)
      }
    }
  }, [useRegisteredSender, showSenderPopup, user])

  const handleSenderChoice = (useRegistered: boolean) => {
    setUseRegisteredSender(useRegistered)
    setShowSenderPopup(false)
    if (useRegistered && user?.address) {
      setSenderAddress(user.address)
    }
  }

  const handleReceiverChoice = (useRegistered: boolean) => {
    setUseRegisteredReceiver(useRegistered)
    setShowReceiverPopup(false)
    if (useRegistered && user?.address) {
      setReceiverAddress(user.address)
    }
  }

  const finalSenderAddress = useRegisteredSender === true ? senderAddress : useRegisteredSender === false ? customSenderAddress : ''
  const finalReceiverAddress = useRegisteredReceiver === true ? receiverAddress : useRegisteredReceiver === false ? customReceiverAddress : ''

  useEffect(() => {
    if (finalReceiverAddress) {
      const zone = detectDeliveryZone(finalReceiverAddress)
      setDeliveryZone(zone)
    }
  }, [finalReceiverAddress])

  const weight = parseFloat(estimatedWeight) || 0.5
  const baseFee = deliveryZone?.baseFee || 40
  const weightFee = weight * 5
  const deliveryFee = baseFee + weightFee

  const handleSubmit = async () => {
    if (!senderName || !finalSenderAddress || !senderContact || !receiverName || !finalReceiverAddress || !receiverContact || !packageDescription) {
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
          deliveryAddress: finalReceiverAddress,
          contactNumber: receiverContact,
          deliveryFee: deliveryFee,
          senderName,
          senderAddress: finalSenderAddress,
          senderContact,
          receiverName,
          receiverAddress: finalReceiverAddress,
          receiverContact,
          packageDescription,
          requiredLoadKg: weight
        })
      })
      const data = await response.json()
      if (response.ok) {
        alert('PADALA request submitted successfully! A rider will pick up and deliver your package. 📦')
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

  const popupOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px'
  }

  const popupCardStyle = {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '12px',
    border: '3px solid black',
    maxWidth: '500px',
    width: '100%',
    boxShadow: '8px 8px 0px black'
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
      <Header />

      {/* Sender Address Popup */}
      {showSenderPopup && (
        <div style={popupOverlayStyle}>
          <div style={popupCardStyle}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px', textAlign: 'center' }}>📍 Pickup Address</h2>
            <p style={{ fontSize: '16px', marginBottom: '20px', textAlign: 'center', color: 'gray' }}>Where should the rider pick up the package?</p>
            <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '2px solid black' }}>
              <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>Your registered address:</p>
              <p style={{ fontSize: '14px', color: 'gray' }}>{user.address}</p>
            </div>
            <div style={{ display: 'flex', gap: '15px' }}>
              <button
                onClick={() => handleSenderChoice(true)}
                style={{ flex: 1, padding: '15px', backgroundColor: '#4caf50', color: 'white', border: '2px solid black', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', boxShadow: '3px 3px 0px black' }}
              >
                ✅ Yes, Use This
              </button>
              <button
                onClick={() => handleSenderChoice(false)}
                style={{ flex: 1, padding: '15px', backgroundColor: 'white', color: 'black', border: '2px solid black', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', boxShadow: '3px 3px 0px black' }}
              >
                ✏️ Enter New
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receiver Address Popup */}
      {showReceiverPopup && (
        <div style={popupOverlayStyle}>
          <div style={popupCardStyle}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px', textAlign: 'center' }}>📍 Delivery Address</h2>
            <p style={{ fontSize: '16px', marginBottom: '20px', textAlign: 'center', color: 'gray' }}>Where should the package be delivered?</p>
            <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '2px solid black' }}>
              <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>Your registered address:</p>
              <p style={{ fontSize: '14px', color: 'gray' }}>{user.address}</p>
            </div>
            <div style={{ display: 'flex', gap: '15px' }}>
              <button
                onClick={() => handleReceiverChoice(true)}
                style={{ flex: 1, padding: '15px', backgroundColor: '#4caf50', color: 'white', border: '2px solid black', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', boxShadow: '3px 3px 0px black' }}
              >
                ✅ Yes, Use This
              </button>
              <button
                onClick={() => handleReceiverChoice(false)}
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
        <div style={{ backgroundColor: '#e0f7fa', padding: '25px', borderRadius: '12px', border: '3px solid #00bcd4', marginBottom: '20px', boxShadow: '4px 4px 0px black' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '10px', color: '#00838f' }}>📦 PADALA Service</h1>
          <p style={{ fontSize: '16px', color: '#00838f', lineHeight: '1.6' }}>
            Send packages and items safely! Our riders will pick up from you and deliver to the receiver with <strong>photo proof</strong>.
          </p>
        </div>

        {/* Sender Details */}
        <div style={cardStyle}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '15px' }}>🏠 Sender Details (You)</h2>

          <div style={{ marginBottom: '15px' }}>
            <label style={labelStyle}>Full Name *</label>
            <input
              type="text"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              style={{ ...inputStyle, fontWeight: 'bold' }}
              placeholder="Your full name"
            />
          </div>

          {useRegisteredSender === true ? (
            <div style={{ marginBottom: '15px', padding: '15px', backgroundColor: '#e8f5e9', borderRadius: '8px', border: '2px solid #4caf50' }}>
              <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>📍 Pickup Address:</p>
              <p style={{ fontWeight: 'bold' }}>{senderAddress}</p>
            </div>
          ) : useRegisteredSender === false ? (
            <div style={{ marginBottom: '15px' }}>
              <label style={labelStyle}>Pickup Address *</label>
              <textarea
                value={customSenderAddress}
                onChange={(e) => setCustomSenderAddress(e.target.value)}
                style={{ ...inputStyle, minHeight: '80px', fontWeight: 'bold' }}
                placeholder="Where should the rider pick up the package?"
              />
            </div>
          ) : null}

          <div>
            <label style={labelStyle}>Contact Number *</label>
            <input
              type="text"
              value={senderContact}
              onChange={(e) => setSenderContact(e.target.value)}
              style={{ ...inputStyle, fontWeight: 'bold' }}
              placeholder="09xxxxxxxxx"
            />
          </div>
        </div>

        {/* Receiver Details */}
        <div style={cardStyle}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '15px' }}>📍 Receiver Details</h2>

          <div style={{ marginBottom: '15px' }}>
            <label style={labelStyle}>Receiver Name *</label>
            <input
              type="text"
              value={receiverName}
              onChange={(e) => setReceiverName(e.target.value)}
              style={{ ...inputStyle, fontWeight: 'bold' }}
              placeholder="Receiver's full name"
            />
          </div>

          {useRegisteredReceiver === true ? (
            <div style={{ marginBottom: '15px', padding: '15px', backgroundColor: '#e8f5e9', borderRadius: '8px', border: '2px solid #4caf50' }}>
              <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>📍 Delivery Address:</p>
              <p style={{ fontWeight: 'bold' }}>{receiverAddress}</p>
              {deliveryZone && (
                <p style={{ fontSize: '12px', color: '#2196f3', marginTop: '5px', fontWeight: 'bold' }}>
                  🚚 Zone: {deliveryZone.zoneName} (Base fee: ₱{deliveryZone.baseFee})
                </p>
              )}
            </div>
          ) : useRegisteredReceiver === false ? (
            <div style={{ marginBottom: '15px' }}>
              <label style={labelStyle}>Delivery Address *</label>
              <textarea
                value={customReceiverAddress}
                onChange={(e) => setCustomReceiverAddress(e.target.value)}
                style={{ ...inputStyle, minHeight: '80px', fontWeight: 'bold' }}
                placeholder="Where should the package be delivered?"
              />
              {deliveryZone && customReceiverAddress && (
                <p style={{ fontSize: '12px', color: '#2196f3', marginTop: '5px', fontWeight: 'bold' }}>
                  🚚 Detected: {deliveryZone.zoneName} (Base fee: ₱{deliveryZone.baseFee})
                </p>
              )}
            </div>
          ) : null}

          <div>
            <label style={labelStyle}>Receiver Contact Number *</label>
            <input
              type="text"
              value={receiverContact}
              onChange={(e) => setReceiverContact(e.target.value)}
              style={{ ...inputStyle, fontWeight: 'bold' }}
              placeholder="09xxxxxxxxx"
            />
          </div>
        </div>

        {/* Package Details */}
        <div style={cardStyle}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '15px' }}>📦 Package Details</h2>

          <div style={{ marginBottom: '15px' }}>
            <label style={labelStyle}>Package Description *</label>
            <textarea
              value={packageDescription}
              onChange={(e) => setPackageDescription(e.target.value)}
              style={{ ...inputStyle, minHeight: '80px', fontWeight: 'bold' }}
              placeholder="Describe the package (e.g., Box of clothes, documents, food items)"
            />
          </div>

          <div>
            <label style={labelStyle}>Estimated Weight (kg)</label>
            <input
              type="number"
              value={estimatedWeight}
              onChange={(e) => setEstimatedWeight(e.target.value)}
              step="0.1"
              min="0.1"
              style={{ ...inputStyle, fontWeight: 'bold' }}
              placeholder="e.g., 2.5"
            />
            <p style={{ fontSize: '12px', color: 'gray', marginTop: '5px' }}>ℹ️ Fee: ₱5 per kg</p>
          </div>
        </div>

        {/* Fee & Submit */}
        <div style={cardStyle}>
          <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '2px solid black' }}>
            <p style={{ fontSize: '16px', marginBottom: '5px' }}>
              <strong>🚚 Delivery Fee:</strong> ₱{deliveryFee.toFixed(2)}
            </p>
            <p style={{ fontSize: '12px', color: 'gray' }}>
              (Base ₱{baseFee} + {weight}kg × ₱5) — {deliveryZone?.zoneName || 'Enter receiver address first'}
            </p>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: '100%',
              padding: '15px',
              backgroundColor: loading ? 'gray' : '#00bcd4',
              color: 'white',
              border: '2px solid black',
              borderRadius: '8px',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '4px 4px 0px black'
            }}
          >
            {loading ? 'Processing...' : '📦 Submit PADALA Request'}
          </button>
        </div>
      </div>
    </main>
  )
}