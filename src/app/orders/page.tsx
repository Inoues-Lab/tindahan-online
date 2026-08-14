'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'

export default function CustomerOrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [proofUrl, setProofUrl] = useState('')

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders')
      const data = await res.json()
      if (res.ok) setOrders(data.orders || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
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
      <Header />
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '30px 20px' }}>
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '5px' }}>📦 My Orders</h1>
          <p style={{ fontSize: '16px', color: 'gray' }}>Track all your orders</p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>Loading orders...</div>
        ) : orders.length === 0 ? (
          <div style={{ backgroundColor: 'white', padding: '60px 40px', borderRadius: '12px', border: '3px solid black', textAlign: 'center' }}>
            <p style={{ fontSize: '48px', marginBottom: '10px' }}>🛒</p>
            <p style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px' }}>No orders yet</p>
            <p style={{ color: 'gray', marginBottom: '20px' }}>Start shopping to place your first order!</p>
            <button onClick={() => router.push('/shop')} style={{ padding: '12px 30px', backgroundColor: '#2196f3', color: 'white', border: '2px solid black', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '3px 3px 0px black' }}>
              Start Shopping
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '20px' }}>
            {orders.map((order) => (
              <div key={order.id} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '3px solid black', boxShadow: '4px 4px 0px black' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <p style={{ fontWeight: 'bold', fontSize: '16px', margin: 0 }}>Order #{order.id.slice(-6).toUpperCase()}</p>
                    <p style={{ color: 'gray', fontSize: '12px', margin: '5px 0 0 0' }}>{new Date(order.createdAt).toLocaleString()}</p>
                  </div>
                  <span style={{ padding: '5px 15px', backgroundColor: statusColors[order.status] || '#757575', color: 'white', borderRadius: '20px', fontWeight: 'bold', fontSize: '12px' }}>
                    {order.status.replace(/_/g, ' ')}
                  </span>
                </div>

                {(order.items || order.orderItems || []).length > 0 && (
                  <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
                    {(order.items || order.orderItems || []).map((item: any) => (
                      <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '14px' }}>
                        <span>{item.product?.name || 'Item'} x {item.quantity}</span>
                        <span style={{ fontWeight: 'bold' }}>₱{((item.price || 0) * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {order.itemDescription && (
                  <p style={{ fontSize: '14px', color: 'gray', marginBottom: '15px' }}>📝 {order.itemDescription}</p>
                )}
                {order.packageDescription && (
                  <p style={{ fontSize: '14px', color: 'gray', marginBottom: '15px' }}>📦 {order.packageDescription}</p>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ fontSize: '12px', color: 'gray' }}>
                    <p style={{ margin: 0 }}>🚚 {order.serviceType} | 💵 {order.paymentMethod}</p>
                    <p style={{ margin: '3px 0 0 0' }}>📍 {order.deliveryAddress}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    {order.deliveryProofUrl && (
                      <button onClick={() => setProofUrl(order.deliveryProofUrl)} style={{ padding: '8px 16px', backgroundColor: '#17a2b8', color: 'white', border: '2px solid black', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px', boxShadow: '2px 2px 0px black' }}>
                        📸 View Proof
                      </button>
                    )}
                    <p style={{ fontSize: '22px', fontWeight: 'bold', color: '#4caf50', margin: 0 }}>₱{(order.totalAmount || 0).toFixed(2)}</p>
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
