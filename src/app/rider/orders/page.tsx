'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'

export default function RiderOrdersPage() {
  const router = useRouter()
  const [availableOrders, setAvailableOrders] = useState<any[]>([])
  const [myOrders, setMyOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

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

  const handleAction = async (orderId: string, action: string) => {
    if (!confirm(`Are you sure?`)) return

    try {
      const res = await fetch('/api/rider/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, action })
      })

      if (res.ok) {
        alert('Success!')
        fetchOrders()
      } else {
        alert('Failed')
      }
    } catch (error) {
      alert('Error')
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
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold' }}>🏍️ Rider Dashboard</h1>
          <button onClick={() => router.push('/rider/dashboard')} style={{ padding: '10px 20px', backgroundColor: 'gray', color: 'white', border: '2px solid black', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
            ← Back to Dashboard
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
                  <span style={{ 
                    backgroundColor: order.status === 'DELIVERED' ? '#d4edda' : '#d1ecf1', 
                    padding: '6px 12px', 
                    borderRadius: '20px', 
                    fontWeight: 'bold', 
                    border: '2px solid black',
                    fontSize: '14px'
                  }}>
                    {order.status.replace('_', ' ')}
                  </span>
                </div>
                
                <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
                  <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>📍 Delivery Address:</strong> {order.deliveryAddress}</p>
                  <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>📞 Contact:</strong> {order.contactNumber}</p>
                  <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>💰 Total:</strong> ₱{order.totalAmount?.toFixed(2)}</p>
                  {order.deliveryFee && (
                    <p style={{ margin: '5px 0', fontSize: '14px', color: 'green' }}><strong>💵 Your Earnings:</strong> ₱{order.deliveryFee.toFixed(2)}</p>
                  )}
                </div>

                {order.status === 'OUT_FOR_DELIVERY' && (
                  <button 
                    onClick={() => handleAction(order.id, 'DELIVER')}
                    style={{ 
                      width: '100%', 
                      padding: '15px', 
                      backgroundColor: 'green', 
                      color: 'white', 
                      border: '2px solid black', 
                      borderRadius: '8px', 
                      fontWeight: 'bold', 
                      fontSize: '18px', 
                      cursor: 'pointer',
                      boxShadow: '3px 3px 0px black'
                    }}
                  >
                    ✅ Mark as Delivered
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '15px', color: '#ffc107' }}>
          📦 Available Orders ({availableOrders.length})
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
                  <span style={{ 
                    backgroundColor: '#fff3cd', 
                    padding: '6px 12px', 
                    borderRadius: '20px', 
                    fontWeight: 'bold', 
                    border: '2px solid black',
                    fontSize: '14px'
                  }}>
                    READY FOR PICKUP
                  </span>
                </div>
                
                <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
                  <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>📍 Pickup & Deliver:</strong> {order.deliveryAddress}</p>
                  <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>📞 Contact:</strong> {order.contactNumber}</p>
                  {order.deliveryFee && (
                    <p style={{ margin: '5px 0', fontSize: '14px', color: 'green', fontWeight: 'bold' }}><strong>💵 Earnings:</strong> ₱{order.deliveryFee.toFixed(2)}</p>
                  )}
                </div>
                
                <button 
                  onClick={() => handleAction(order.id, 'ACCEPT')}
                  style={{ 
                    width: '100%', 
                    padding: '15px', 
                    backgroundColor: '#17a2b8', 
                    color: 'white', 
                    border: '2px solid black', 
                    borderRadius: '8px', 
                    fontWeight: 'bold', 
                    fontSize: '18px', 
                    cursor: 'pointer',
                    boxShadow: '3px 3px 0px black'
                  }}
                >
                  🏍️ Accept & Start Delivery
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}