'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import MerchantHeader from '@/components/MerchantHeader'

export default function MerchantOrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [proofUrl, setProofUrl] = useState('')

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/merchant/orders')
      const data = await res.json()
      if (res.ok) setOrders(data.orders || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (orderId: string, status: string) => {
    if (status === 'CANCELLED' && !confirm('Cancel this order?')) return
    try {
      const res = await fetch('/api/merchant/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status })
      })
      const data = await res.json()
      if (res.ok) {
        alert(data.message || 'Order updated!')
        fetchOrders()
      } else {
        alert(data.error || 'Failed to update order')
      }
    } catch (error) {
      alert('Error')
    }
  }

  const statusColors: any = {
    PENDING: '#ff9800',
    ACCEPTED: '#2196f3',
    IN_PROGRESS: '#2196f3',
    READY_FOR_PICKUP: '#9c27b0',
    OUT_FOR_DELIVERY: '#9c27b0',
    DELIVERED: '#4caf50',
    COMPLETED: '#4caf50',
    CANCELLED: '#dc3545'
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
      <MerchantHeader />
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '30px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '5px' }}>🛍️ Customer Orders</h1>
            <p style={{ fontSize: '16px', color: 'gray' }}>Confirm or cancel incoming orders</p>
          </div>
          <button onClick={() => router.push('/merchant/dashboard')} style={{ padding: '12px 24px', backgroundColor: 'white', border: '2px solid black', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
            ← Back
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>Loading orders...</div>
        ) : orders.length === 0 ? (
          <div style={{ backgroundColor: 'white', padding: '60px 40px', borderRadius: '12px', border: '3px solid black', textAlign: 'center' }}>
            <p style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px' }}>No orders yet</p>
            <p style={{ color: 'gray' }}>New customer orders will appear here!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '20px' }}>
            {orders.map((order) => (
              <div key={order.id} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '3px solid black', boxShadow: '4px 4px 0px black' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <p style={{ fontWeight: 'bold', fontSize: '18px', margin: 0 }}>Order #{order.id.slice(-6).toUpperCase()}</p>
                    <p style={{ color: 'gray', fontSize: '12px', margin: '5px 0 0 0' }}>{new Date(order.createdAt).toLocaleString()}</p>
                  </div>
                  <span style={{ padding: '5px 15px', backgroundColor: statusColors[order.status] || '#757575', color: 'white', borderRadius: '20px', fontWeight: 'bold', fontSize: '12px' }}>
                    {order.status.replace(/_/g, ' ')}
                  </span>
                </div>

                <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
                  <p style={{ margin: '0 0 5px 0', fontSize: '14px' }}><strong>👤 Customer:</strong> {order.user?.name || 'N/A'}</p>
                  <p style={{ margin: '0 0 5px 0', fontSize: '14px' }}><strong>📞 Contact:</strong> {order.contactNumber}</p>
                  <p style={{ margin: 0, fontSize: '14px' }}><strong>📍 Address:</strong> {order.deliveryAddress}</p>
                </div>

                {(order.items || []).length > 0 && (
                  <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
                    <p style={{ fontWeight: 'bold', margin: '0 0 10px 0', fontSize: '14px' }}>🛒 Items:</p>
                    {order.items.map((item: any) => (
                      <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '14px' }}>
                        <span>{item.product?.name || 'Item'} x {item.quantity}</span>
                        <span style={{ fontWeight: 'bold' }}>₱{((item.price || 0) * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <p style={{ fontSize: '22px', fontWeight: 'bold', color: '#4caf50', margin: 0 }}>₱{(order.totalAmount || 0).toFixed(2)}</p>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {order.deliveryProofUrl && (
                      <button onClick={() => setProofUrl(order.deliveryProofUrl)} style={{ padding: '10px 20px', backgroundColor: '#17a2b8', color: 'white', border: '2px solid black', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '3px 3px 0px black' }}>
                        📸 View Proof
                      </button>
                    )}
                    {order.status === 'PENDING' && (
                      <>
                        <button onClick={() => handleAction(order.id, 'ACCEPTED')} style={{ padding: '10px 20px', backgroundColor: '#4caf50', color: 'white', border: '2px solid black', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '3px 3px 0px black' }}>
                          ✓ Confirm
                        </button>
                        <button onClick={() => handleAction(order.id, 'CANCELLED')} style={{ padding: '10px 20px', backgroundColor: '#dc3545', color: 'white', border: '2px solid black', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '3px 3px 0px black' }}>
                          ✗ Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {proofUrl && (
        <div onClick={() => setProofUrl('')} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px', cursor: 'pointer' }}>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '3px solid black', maxWidth: '600px', width: '100%', boxShadow: '8px 8px 0px black' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>📸 Delivery Proof</h2>
              <button onClick={() => setProofUrl('')} style={{ padding: '8px 16px', backgroundColor: 'white', border: '2px solid black', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>✕ Close</button>
            </div>
            <img src={proofUrl} alt="Delivery Proof" style={{ width: '100%', maxHeight: '70vh', objectFit: 'contain', borderRadius: '8px', border: '2px solid black' }} />
          </div>
        </div>
      )}
    </main>
  )
}
