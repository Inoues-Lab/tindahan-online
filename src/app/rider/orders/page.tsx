'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import RiderHeader from '@/components/RiderHeader'

export default function RiderOrdersPage() {
  const router = useRouter()
  const [availableOrders, setAvailableOrders] = useState<any[]>([])
  const [myOrders, setMyOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [proofOrderId, setProofOrderId] = useState<string | null>(null)
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [proofPreview, setProofPreview] = useState('')
  const [uploading, setUploading] = useState(false)
  const proofRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/rider/orders')
      const data = await res.json()
      if (res.ok) {
        setAvailableOrders(data.availableOrders || [])
        setMyOrders(data.myOrders || [])
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async (orderId: string) => {
    if (!confirm('Accept this order and start delivery?')) return
    try {
      const res = await fetch('/api/rider/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, action: 'ACCEPT' })
      })
      if (res.ok) {
        alert('Order accepted!')
        fetchOrders()
      } else {
        alert('Failed to accept order')
      }
    } catch (error) {
      alert('Error')
    }
  }

  const handleProofFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setProofFile(file)
      const reader = new FileReader()
      reader.onloadend = () => setProofPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleConfirmDelivery = async () => {
    if (!proofFile) {
      alert('Photo proof is REQUIRED before marking as delivered!')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', proofFile)
      const upRes = await fetch('/api/upload', { method: 'POST', body: formData })
      const upData = await upRes.json()

      if (!upRes.ok || !upData.url) {
        alert('Failed to upload photo. Try again.')
        setUploading(false)
        return
      }

      const res = await fetch('/api/rider/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: proofOrderId, action: 'DELIVER', proofUrl: upData.url })
      })

      if (res.ok) {
        alert('Delivered! Thank you!')
        setProofOrderId(null)
        setProofFile(null)
        setProofPreview('')
        fetchOrders()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to mark as delivered')
      }
    } catch (error) {
      alert('Error')
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <main style={{ minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
        <RiderHeader />
        <div style={{ textAlign: 'center', padding: '100px 20px' }}>Loading...</div>
      </main>
    )
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
      <RiderHeader />
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold' }}>Rider Dashboard</h1>
          <button onClick={() => router.push('/rider/dashboard')} style={{ padding: '10px 20px', backgroundColor: 'gray', color: 'white', border: '2px solid black', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
            Back to Dashboard
          </button>
        </div>

        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '15px', color: 'green' }}>
          My Active Deliveries ({myOrders.length})
        </h2>

        {myOrders.length === 0 ? (
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', border: '3px solid black', marginBottom: '30px', textAlign: 'center' }}>
            <p style={{ fontSize: '16px', color: 'gray' }}>No active deliveries.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '20px', marginBottom: '40px' }}>
            {myOrders.map(order => (
              <div key={order.id} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '3px solid green', boxShadow: '4px 4px 0px black' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 5px 0' }}>Order #{order.id.slice(0, 8).toUpperCase()}</h3>
                    <p style={{ fontSize: '14px', color: 'gray', margin: 0 }}>{new Date(order.createdAt).toLocaleString()}</p>
                  </div>
                  <span style={{ backgroundColor: order.status === 'DELIVERED' ? '#d4edda' : '#d1ecf1', padding: '6px 12px', borderRadius: '20px', fontWeight: 'bold', border: '2px solid black', fontSize: '14px' }}>
                    {order.status.replace('_', ' ')}
                  </span>
                </div>

                <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
                  <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>Delivery Address:</strong> {order.deliveryAddress}</p>
                  <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>Contact:</strong> {order.contactNumber}</p>
                  <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>Total:</strong> ₱{order.totalAmount?.toFixed(2)}</p>
                  {order.deliveryFee && (
                    <p style={{ margin: '5px 0', fontSize: '14px', color: 'green' }}><strong>Your Earnings:</strong> ₱{order.deliveryFee.toFixed(2)}</p>
                  )}
                </div>

                {order.status === 'OUT_FOR_DELIVERY' && (
                  <button
                    onClick={() => { setProofOrderId(order.id); setProofFile(null); setProofPreview('') }}
                    style={{ width: '100%', padding: '15px', backgroundColor: 'green', color: 'white', border: '2px solid black', borderRadius: '8px', fontWeight: 'bold', fontSize: '18px', cursor: 'pointer', boxShadow: '3px 3px 0px black' }}
                  >
                    Mark as Delivered (Photo Proof)
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '15px', color: '#ffc107' }}>
          Available Orders ({availableOrders.length})
        </h2>

        {availableOrders.length === 0 ? (
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', border: '3px solid black', textAlign: 'center' }}>
            <p style={{ fontSize: '16px', color: 'gray' }}>No orders waiting for pickup.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '20px' }}>
            {availableOrders.map(order => (
              <div key={order.id} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '3px solid #ffc107', boxShadow: '4px 4px 0px black' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 5px 0' }}>Order #{order.id.slice(0, 8).toUpperCase()}</h3>
                    <p style={{ fontSize: '14px', color: 'gray', margin: 0 }}>{new Date(order.createdAt).toLocaleString()}</p>
                  </div>
                  <span style={{ backgroundColor: '#fff3cd', padding: '6px 12px', borderRadius: '20px', fontWeight: 'bold', border: '2px solid black', fontSize: '14px' }}>
                    READY FOR PICKUP
                  </span>
                </div>

                <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
                  <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>Pickup & Deliver:</strong> {order.deliveryAddress}</p>
                  <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>Contact:</strong> {order.contactNumber}</p>
                  {order.deliveryFee && (
                    <p style={{ margin: '5px 0', fontSize: '14px', color: 'green', fontWeight: 'bold' }}><strong>Earnings:</strong> ₱{order.deliveryFee.toFixed(2)}</p>
                  )}
                </div>

                <button
                  onClick={() => handleAccept(order.id)}
                  style={{ width: '100%', padding: '15px', backgroundColor: '#17a2b8', color: 'white', border: '2px solid black', borderRadius: '8px', fontWeight: 'bold', fontSize: '18px', cursor: 'pointer', boxShadow: '3px 3px 0px black' }}
                >
                  Accept & Start Delivery
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {proofOrderId && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', border: '3px solid black', maxWidth: '500px', width: '100%', boxShadow: '8px 8px 0px black', maxHeight: '85vh', overflowY: 'auto' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px', textAlign: 'center' }}>Delivery Proof Required</h2>
            <p style={{ fontSize: '14px', color: 'gray', marginBottom: '20px', textAlign: 'center' }}>
              Take a photo of the delivered package. You cannot mark as delivered without this!
            </p>

            <input
              ref={proofRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleProofFile}
              style={{ display: 'none' }}
            />
            <button
              type="button"
              onClick={() => proofRef.current?.click()}
              style={{ width: '100%', padding: '15px', border: '2px dashed black', borderRadius: '8px', cursor: 'pointer', backgroundColor: proofFile ? '#e8f5e9' : '#f0f0f0', fontWeight: 'bold', marginBottom: '15px' }}
            >
              {proofFile ? 'Photo Ready - Retake' : 'Take / Upload Photo'}
            </button>

            {proofPreview && (
              <img src={proofPreview} alt="Delivery Proof" style={{ width: '100%', borderRadius: '8px', border: '2px solid black', marginBottom: '20px' }} />
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleConfirmDelivery}
                disabled={uploading}
                style={{ flex: 1, padding: '15px', backgroundColor: uploading ? 'gray' : '#4caf50', color: 'white', border: '2px solid black', borderRadius: '8px', fontWeight: 'bold', cursor: uploading ? 'not-allowed' : 'pointer', boxShadow: '3px 3px 0px black' }}
              >
                {uploading ? 'Uploading...' : 'Confirm Delivered'}
              </button>
              <button
                onClick={() => setProofOrderId(null)}
                style={{ padding: '15px 20px', backgroundColor: 'white', color: 'black', border: '2px solid black', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
