'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'

export default function MerchantOrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    checkAuth()
  }, [router])

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me')
      const data = await res.json()
      if (!data.user || data.user.role !== 'MERCHANT') {
        router.push('/')
        return
      }
      setUser(data.user)
      fetchOrders()
    } catch (error) {
      router.push('/')
    }
  }

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/merchant/orders')
      const data = await res.json()
      if (res.ok) {
        setOrders(data.orders || [])
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    if (!confirm(`Are you sure you want to mark this order as ${newStatus}?`)) return

    try {
      const res = await fetch('/api/merchant/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus })
      })

      if (res.ok) {
        alert(`Order updated to ${newStatus}!`)
        fetchOrders()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to update order')
      }
    } catch (error) {
      alert('Error updating order')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return { bg: '#fff3cd', text: '#856404', border: '#ffc107' }
      case 'ACCEPTED': return { bg: '#d1ecf1', text: '#0c5460', border: '#17a2b8' }
      case 'IN_PROGRESS': return { bg: '#e2e3e5', text: '#383d41', border: '#6c757d' }
      case 'READY_FOR_PICKUP': return { bg: '#fff3cd', text: '#856404', border: '#ffc107' }
      case 'OUT_FOR_DELIVERY': return { bg: '#d1ecf1', text: '#0c5460', border: '#17a2b8' }
      case 'DELIVERED': return { bg: '#d4edda', text: '#155724', border: '#28a745' }
      case 'COMPLETED': return { bg: '#d4edda', text: '#155724', border: '#28a745' }
      case 'CANCELLED': return { bg: '#f8d7da', text: '#721c24', border: '#dc3545' }
      default: return { bg: '#f8f9fa', text: '#333', border: '#ddd' }
    }
  }

  if (loading) {
    return (
      <main style={{ minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
        <Header />
        <div style={{ textAlign: 'center', padding: '100px 20px' }}>Loading orders...</div>
      </main>
    )
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
      <Header />
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold' }}>📦 Manage Orders</h1>
          <button onClick={() => router.push('/merchant/dashboard')} style={{ padding: '10px 20px', backgroundColor: 'gray', color: 'white', border: '2px solid black', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
            ← Back to Dashboard
          </button>
        </div>

        {orders.length === 0 ? (
          <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', border: '3px solid black', textAlign: 'center' }}>
            <p style={{ fontSize: '18px', color: 'gray' }}>No orders yet.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '20px' }}>
            {orders.map((order) => {
              const statusStyle = getStatusColor(order.status)
              return (
                <div key={order.id} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '3px solid black', boxShadow: '4px 4px 0px black' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 5px 0' }}>Order #{order.id.slice(0, 8).toUpperCase()}</h2>
                      <p style={{ fontSize: '14px', color: 'gray', margin: 0 }}>{new Date(order.createdAt).toLocaleString()}</p>
                    </div>
                    <div style={{ 
                      padding: '6px 12px', 
                      backgroundColor: statusStyle.bg, 
                      color: statusStyle.text, 
                      border: `2px solid ${statusStyle.border}`,
                      borderRadius: '20px', 
                      fontWeight: 'bold',
                      fontSize: '14px'
                    }}>
                      {order.status.replace('_', ' ')}
                    </div>
                  </div>

                  <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #ddd' }}>
                    <p style={{ margin: '5px 0', fontSize: '14px' }}><strong> Address:</strong> {order.deliveryAddress}</p>
                    <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>📞 Contact:</strong> {order.contactNumber}</p>
                    <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>💳 Payment:</strong> {order.paymentMethod}</p>
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px' }}>Items:</h3>
                    {order.items.map((item: any, idx: number) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                        <span style={{ fontSize: '14px' }}>{item.product?.name} <span style={{ color: 'gray' }}>(x{item.quantity})</span></span>
                        <span style={{ fontWeight: 'bold' }}>₱{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontWeight: 'bold', fontSize: '18px' }}>
                      <span>Total:</span>
                      <span style={{ color: 'green' }}>₱{order.totalAmount?.toFixed(2)}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {order.status === 'PENDING' && (
                      <button onClick={() => handleStatusUpdate(order.id, 'ACCEPTED')} style={{ flex: 1, padding: '12px', backgroundColor: '#17a2b8', color: 'white', border: '2px solid black', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                        ✅ Confirm Order (Accept)
                      </button>
                    )}
                    
                    {order.status === 'ACCEPTED' && (
                      <button onClick={() => handleStatusUpdate(order.id, 'IN_PROGRESS')} style={{ flex: 1, padding: '12px', backgroundColor: '#6c757d', color: 'white', border: '2px solid black', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                         Start Preparing
                      </button>
                    )}
                    
                    {order.status === 'IN_PROGRESS' && (
                      <button onClick={() => handleStatusUpdate(order.id, 'READY_FOR_PICKUP')} style={{ flex: 1, padding: '12px', backgroundColor: '#ffc107', color: 'black', border: '2px solid black', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                        📦 Mark as Ready for Pickup
                      </button>
                    )}
                    
                    {['READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'COMPLETED', 'CANCELLED'].includes(order.status) && (
                      <div style={{ padding: '12px', backgroundColor: '#f0f0f0', borderRadius: '8px', fontWeight: 'bold', textAlign: 'center', width: '100%', border: '2px solid black' }}>
                        Order is {order.status.replace('_', ' ')} {order.status === 'DELIVERED' ? '✅' : order.status === 'READY_FOR_PICKUP' ? '(Waiting for Rider)' : ''}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}