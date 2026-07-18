// src/app/rider/page.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'

export default function RiderDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [pendingOrders, setPendingOrders] = useState<any[]>([])
  const [myOrders, setMyOrders] = useState<any[]>([])
  const [cashOnHand, setCashOnHand] = useState(0)
  const [todayEarnings, setTodayEarnings] = useState(0)
  const [error, setError] = useState('')
  
  // Remittance limit popup
  const [showRemittancePopup, setShowRemittancePopup] = useState(false)
  const [remittanceData, setRemittanceData] = useState({ cashOnHand: 0, limit: 20000 })
  
  const [showPhotoModal, setShowPhotoModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const REMITTANCE_LIMIT = 20000

  useEffect(() => {
    checkAuth()
  }, [router])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me')
      const data = await response.json()
      
      if (!data.user || data.user.role !== 'RIDER') {
        alert('Access denied. Riders only.')
        router.push('/')
        return
      }
      
      setUser(data.user)
      setCashOnHand(data.user.cashOnHand || 0)
      fetchRiderData()
    } catch (error) {
      router.push('/login')
    }
  }

  const fetchRiderData = async () => {
    try {
      const ordersRes = await fetch('/api/rider/orders')
      const ordersData = await ordersRes.json()
      
      if (ordersRes.ok) {
        setPendingOrders(ordersData.pendingOrders || [])
        setMyOrders(ordersData.myOrders || [])
        
        const meRes = await fetch('/api/auth/me')
        const meData = await meRes.json()
        
        if (meRes.ok && meData.user) {
          setCashOnHand(meData.user.cashOnHand || 0)
        }
        
        const today = new Date().toISOString().split('T')[0]
        const todaysCompleted = (ordersData.myOrders || []).filter((order: any) => {
          if (order.status !== 'COMPLETED') return false
          
          const completedDate = order.delivery?.completedAt 
            ? new Date(order.delivery.completedAt).toISOString().split('T')[0]
            : new Date(order.updatedAt).toISOString().split('T')[0]
          
          return completedDate === today
        })
        
        const todaysIncome = todaysCompleted.reduce((sum: number, order: any) => {
          return sum + (order.riderPayout || 0)
        }, 0)
        
        setTodayEarnings(todaysIncome)
        setError('')
      } else {
        setError(ordersData.error || 'Failed to load orders')
      }
    } catch (error) {
      setError('Error loading orders')
    } finally {
      setLoading(false)
    }
  }

  const acceptOrder = async (orderId: string) => {
    try {
      const response = await fetch('/api/rider/orders/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        alert('Order accepted!')
        fetchRiderData()
      } else if (data.error === 'REMITTANCE_LIMIT_REACHED') {
        // Show professional remittance popup
        setRemittanceData({
          cashOnHand: data.cashOnHand,
          limit: data.remittanceLimit
        })
        setShowRemittancePopup(true)
      } else {
        alert(data.error || 'Failed to accept order')
      }
    } catch (error) {
      alert('Error accepting order')
    }
  }

  const openPhotoModal = (order: any) => {
    setSelectedOrder(order)
    setPhotoFile(null)
    setPhotoPreview('')
    setShowPhotoModal(true)
  }

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhotoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleMarkDelivered = async () => {
    if (!photoFile) {
      alert('Please take a photo as proof of delivery')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', photoFile)

      const uploadRes = await fetch('/api/rider/upload', {
        method: 'POST',
        body: formData
      })

      const uploadData = await uploadRes.json()

      if (!uploadRes.ok) {
        alert(uploadData.error || 'Failed to upload photo')
        return
      }

      const statusRes = await fetch('/api/rider/orders/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: selectedOrder.id,
          status: 'COMPLETED',
          proofUrl: uploadData.url
        })
      })

      if (statusRes.ok) {
        alert('Order marked as delivered!')
        setShowPhotoModal(false)
        fetchRiderData()
      } else {
        const data = await statusRes.json()
        alert(data.error || 'Failed to update status')
      }
    } catch (error) {
      alert('Error marking as delivered')
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
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
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: 'black', marginBottom: '10px' }}>
          Rider Dashboard 🏍️
        </h1>
        <p style={{ fontSize: '18px', color: 'gray', marginBottom: '30px' }}>
          Accept deliveries and earn money
        </p>

        {error && (
          <div style={{ backgroundColor: '#fee', padding: '15px', borderRadius: '8px', border: '2px solid red', marginBottom: '20px' }}>
            <strong style={{ color: 'red' }}>Error:</strong> {error}
          </div>
        )}

        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', border: '3px solid black', marginBottom: '30px', boxShadow: '4px 4px 0px black' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>💰 Rider Earnings</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
            <div style={{ padding: '20px', backgroundColor: '#e8f5e9', borderRadius: '8px', border: '2px solid green' }}>
              <p style={{ fontSize: '14px', color: 'gray', marginBottom: '5px' }}>Today's Income</p>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'green' }}>₱{todayEarnings.toFixed(2)}</p>
              <p style={{ fontSize: '12px', color: 'gray' }}>From completed deliveries</p>
            </div>
            <div style={{ padding: '20px', backgroundColor: cashOnHand >= REMITTANCE_LIMIT ? '#fee' : '#e3f2fd', borderRadius: '8px', border: `2px solid ${cashOnHand >= REMITTANCE_LIMIT ? 'red' : 'blue'}` }}>
              <p style={{ fontSize: '14px', color: 'gray', marginBottom: '5px' }}>Cash on Hand</p>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: cashOnHand >= REMITTANCE_LIMIT ? 'red' : 'blue' }}>₱{cashOnHand.toFixed(2)}</p>
              <p style={{ fontSize: '12px', color: cashOnHand >= REMITTANCE_LIMIT ? 'red' : 'gray' }}>
                {cashOnHand >= REMITTANCE_LIMIT ? '⚠️ Limit reached!' : 'To remit to admin'}
              </p>
            </div>
            <div style={{ padding: '20px', backgroundColor: '#fff3e0', borderRadius: '8px', border: '2px solid orange' }}>
              <p style={{ fontSize: '14px', color: 'gray', marginBottom: '5px' }}>Remittance Limit</p>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'orange' }}>₱{REMITTANCE_LIMIT.toLocaleString()}.00</p>
              <p style={{ fontSize: '12px', color: 'gray' }}>Max cash before remitting</p>
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', border: '3px solid black', marginBottom: '30px', boxShadow: '4px 4px 0px black' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>📦 Available Orders ({pendingOrders.length})</h2>
          {pendingOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
              <p style={{ fontSize: '18px', color: 'gray' }}>No orders available right now</p>
              <p style={{ fontSize: '14px', color: 'gray' }}>Check back soon!</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '15px' }}>
              {pendingOrders.map((order) => (
                <div key={order.id} style={{ padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '2px solid black' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '5px' }}>Order #{order.id.slice(0, 8).toUpperCase()}</h3>
                      <p style={{ color: 'gray', marginBottom: '5px' }}>{order.customer?.name}</p>
                      <p style={{ color: 'gray', marginBottom: '5px' }}>{order.deliveryAddress}</p>
                      <p style={{ color: 'gray', fontSize: '14px' }}>Contact: {order.contactNumber}</p>
                      <p style={{ color: 'gray', fontSize: '14px' }}>
                        Items: {order.items.map((item: any) => `${item.product.name} x${item.quantity}`).join(', ')}
                      </p>
                      <p style={{ color: 'gray', fontSize: '14px' }}>Weight: {order.requiredLoadKg}kg</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '14px', color: 'gray' }}>Customer Pays (COD)</p>
                      <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'green' }}>₱{order.totalAmount?.toFixed(2)}</p>
                      <p style={{ fontSize: '12px', color: 'blue' }}>You earn: ₱{order.riderPayout?.toFixed(2)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => acceptOrder(order.id)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      backgroundColor: 'blue',
                      color: 'white',
                      border: '2px solid black',
                      borderRadius: '8px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      fontSize: '16px',
                      boxShadow: '3px 3px 0px black'
                    }}
                  >
                    Accept Order
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {myOrders.length > 0 && (
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', border: '3px solid black', boxShadow: '4px 4px 0px black' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>📋 My Orders ({myOrders.length})</h2>
            <div style={{ display: 'grid', gap: '15px' }}>
              {myOrders.map((order) => (
                <div key={order.id} style={{ padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '2px solid black' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>Order #{order.id.slice(0, 8).toUpperCase()}</h3>
                      <p style={{ color: 'gray' }}>{order.deliveryAddress}</p>
                      <p style={{ color: 'gray' }}>
                        Status: <span style={{ 
                          fontWeight: 'bold', 
                          color: order.status === 'COMPLETED' ? 'green' : 
                                order.status === 'ACCEPTED' ? 'blue' : 'orange' 
                        }}>{order.status}</span>
                      </p>
                      {order.delivery?.proofUrl && (
                        <a href={order.delivery.proofUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', color: 'blue' }}>
                          View Proof
                        </a>
                      )}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '14px', color: 'gray' }}>Customer Paid</p>
                      <p style={{ fontSize: '20px', fontWeight: 'bold', color: 'green' }}>₱{order.totalAmount?.toFixed(2)}</p>
                      <p style={{ fontSize: '12px', color: 'blue' }}>You earn: ₱{order.riderPayout?.toFixed(2)}</p>
                    </div>
                  </div>
                  
                  {order.status === 'ACCEPTED' && (
                    <button
                      onClick={() => openPhotoModal(order)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        backgroundColor: 'green',
                        color: 'white',
                        border: '2px solid black',
                        borderRadius: '8px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        fontSize: '16px',
                        boxShadow: '3px 3px 0px black'
                      }}
                    >
                      📸 Mark as Delivered (Photo Required)
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Remittance Limit Popup */}
      {showRemittancePopup && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white', padding: '40px', borderRadius: '16px',
            border: '4px solid #ff4444', maxWidth: '550px', width: '90%', 
            boxShadow: '0px 10px 40px rgba(0,0,0,0.3)',
            animation: 'slideIn 0.3s ease-out'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '25px' }}>
              <div style={{ 
                fontSize: '64px', 
                marginBottom: '15px' 
              }}>
                ⚠️
              </div>
              <h2 style={{ 
                fontSize: '28px', 
                fontWeight: 'bold', 
                color: '#ff4444',
                marginBottom: '10px'
              }}>
                Remittance Limit Reached
              </h2>
            </div>

            <div style={{ 
              backgroundColor: '#fff3cd', 
              padding: '20px', 
              borderRadius: '12px', 
              border: '2px solid #ffc107',
              marginBottom: '25px'
            }}>
              <p style={{ 
                fontSize: '16px', 
                color: '#856404', 
                marginBottom: '10px',
                textAlign: 'center',
                fontWeight: 'bold'
              }}>
                📢 Action Required
              </p>
              <p style={{ 
                fontSize: '18px', 
                color: '#856404',
                lineHeight: '1.6',
                textAlign: 'center'
              }}>
                You have reached the remittance limit of <strong>₱{remittanceData.limit.toLocaleString()}.00</strong>
              </p>
              <p style={{ 
                fontSize: '20px', 
                color: '#d9534f',
                marginTop: '10px',
                fontWeight: 'bold',
                textAlign: 'center'
              }}>
                Current Cash on Hand: ₱{remittanceData.cashOnHand.toFixed(2)}
              </p>
            </div>

            <div style={{ 
              backgroundColor: '#e8f5e9', 
              padding: '20px', 
              borderRadius: '12px', 
              border: '2px solid #4caf50',
              marginBottom: '25px'
            }}>
              <p style={{ 
                fontSize: '16px', 
                color: '#2e7d32', 
                marginBottom: '10px',
                fontWeight: 'bold'
              }}>
                🔔 Important Notice:
              </p>
              <p style={{ 
                fontSize: '15px', 
                color: '#2e7d32',
                lineHeight: '1.6'
              }}>
                For your safety and security, please remit your cash on hand to the admin before accepting new orders. The admin is waiting for your remittance to process your earnings and ensure smooth operations.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '15px' }}>
              <button
                onClick={() => setShowRemittancePopup(false)}
                style={{
                  flex: 1,
                  padding: '15px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: '2px solid #495057',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  fontSize: '16px',
                  cursor: 'pointer'
                }}
              >
                I Understand
              </button>
              <button
                onClick={() => {
                  setShowRemittancePopup(false)
                  window.location.href = '/'
                }}
                style={{
                  flex: 1,
                  padding: '15px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: '2px solid #1e7e34',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  fontSize: '16px',
                  cursor: 'pointer'
                }}
              >
                Contact Admin
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Photo Upload Modal */}
      {showPhotoModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white', padding: '30px', borderRadius: '12px',
            border: '3px solid black', maxWidth: '500px', width: '90%', boxShadow: '8px 8px 0px black'
          }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px', textAlign: 'center', color: 'black' }}>
               Proof of Delivery
            </h2>
            <p style={{ fontSize: '14px', marginBottom: '20px', textAlign: 'center', color: 'gray' }}>
              Order #{selectedOrder?.id.slice(0, 8).toUpperCase()}
            </p>
            
            <div style={{ marginBottom: '20px' }}>
              <p style={{ fontWeight: 'bold', color: 'red', marginBottom: '10px', textAlign: 'center' }}>
                ⚠️ Photo is REQUIRED to mark as delivered
              </p>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoSelect}
                style={{ display: 'none' }}
              />
              
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{
                  width: '100%',
                  padding: '15px',
                  backgroundColor: photoFile ? '#e8f5e9' : '#f0f0f0',
                  border: '2px dashed black',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
              >
                {photoFile ? '✅ Photo Selected' : '📷 Take Photo / Upload'}
              </button>

              {photoPreview && (
                <div style={{ marginTop: '15px' }}>
                  <img 
                    src={photoPreview} 
                    alt="Proof" 
                    style={{ width: '100%', borderRadius: '8px', border: '2px solid black' }}
                  />
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setShowPhotoModal(false)}
                style={{
                  flex: 1,
                  padding: '15px',
                  backgroundColor: 'gray',
                  color: 'white',
                  border: '2px solid black',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleMarkDelivered}
                disabled={!photoFile || uploading}
                style={{
                  flex: 1,
                  padding: '15px',
                  backgroundColor: !photoFile ? 'gray' : 'green',
                  color: 'white',
                  border: '2px solid black',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  cursor: !photoFile ? 'not-allowed' : 'pointer'
                }}
              >
                {uploading ? 'Uploading...' : 'Confirm Delivery'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}