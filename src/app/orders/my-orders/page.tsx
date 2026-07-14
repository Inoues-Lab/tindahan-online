// src/app/orders/my-orders/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'

export default function MyOrdersPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user)
          fetchOrders()
        } else {
          router.push('/login')
        }
      })
      .catch(() => router.push('/login'))
  }, [router])

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders')
      const data = await res.json()
      if (res.ok) setOrders(data.orders || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'orange'
      case 'ACCEPTED': return 'blue'
      case 'COMPLETED': return 'green'
      case 'CANCELLED': return 'red'
      default: return 'gray'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING': return ' Pending'
      case 'ACCEPTED': return '✓ Accepted by Rider'
      case 'COMPLETED': return '✅ Delivered'
      case 'CANCELLED': return '❌ Cancelled'
      default: return status
    }
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
      <Header />
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '10px', color: 'black' }}>
          My Orders 📦
        </h1>
        <p style={{ fontSize: '18px', color: 'gray', marginBottom: '30px' }}>
          Track your orders and delivery status
        </p>

        {orders.length === 0 ? (
          <div style={{ backgroundColor: 'white', padding: '60px 20px', borderRadius: '12px', border: '3px solid black', textAlign: 'center' }}>
            <p style={{ fontSize: '20px', color: 'gray', marginBottom: '20px' }}>No orders yet</p>
            <button
              onClick={() => router.push('/')}
              style={{
                backgroundColor: 'blue', color: 'white', padding: '15px 30px',
                borderRadius: '8px', border: '2px solid black', fontWeight: 'bold', cursor: 'pointer'
              }}
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '20px' }}>
            {orders.map((order) => (
              <div key={order.id} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '3px solid black', boxShadow: '3px 3px 0px black' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'black' }}>
                      Order #{order.id.slice(0, 8).toUpperCase()}
                    </h3>
                    <p style={{ color: 'gray', fontSize: '14px' }}>
                      Date: {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'green' }}>{order.totalAmount?.toFixed(2)}</p>
                    <p style={{ fontSize: '12px', color: 'gray' }}>Delivery Fee: ₱{order.deliveryFee?.toFixed(2)}</p>
                  </div>
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <p style={{ color: 'gray', fontSize: '14px' }}>
                    Status: <span style={{ fontWeight: 'bold', color: getStatusColor(order.status) }}>
                      {getStatusLabel(order.status)}
                    </span>
                  </p>
                  <p style={{ color: 'gray', fontSize: '14px' }}>Delivery Address: {order.deliveryAddress}</p>
                  <p style={{ color: 'gray', fontSize: '14px' }}>Contact: {order.contactNumber}</p>
                </div>

                {/* Delivery Proof */}
                {order.delivery?.proofUrl && (
                  <div style={{ marginBottom: '15px', padding: '15px', backgroundColor: '#e8f5e9', borderRadius: '8px', border: '2px solid green' }}>
                    <p style={{ fontWeight: 'bold', color: 'green', marginBottom: '10px' }}>✅ Delivery Proof:</p>
                    <img 
                      src={order.delivery.proofUrl} 
                      alt="Delivery proof" 
                      style={{ width: '100%', maxWidth: '300px', borderRadius: '8px', border: '2px solid black' }}
                    />
                    <p style={{ fontSize: '12px', color: 'gray', marginTop: '5px' }}>
                      Delivered at: {new Date(order.delivery.completedAt).toLocaleString()}
                    </p>
                  </div>
                )}

                {/* Items */}
                <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '8px' }}>
                  <p style={{ fontWeight: 'bold', marginBottom: '10px', color: 'black' }}>Items Ordered:</p>
                  {order.items?.map((item: any, idx: number) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', paddingBottom: '5px', borderBottom: '1px solid #eee' }}>
                      <div>
                        <p style={{ fontWeight: 'bold', color: 'black' }}>{item.product?.name}</p>
                        <p style={{ fontSize: '12px', color: 'gray' }}>{item.product?.description}</p>
                        <p style={{ fontSize: '14px', color: 'gray' }}>Quantity: {item.quantity}</p>
                      </div>
                      <p style={{ fontWeight: 'bold', color: 'green' }}>{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}