// src/app/orders/my-orders/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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
      case 'ACCEPTED': return '✅ Accepted by Rider'
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
          My Orders 
        </h1>
        <p style={{ fontSize: '18px', color: 'gray', marginBottom: '30px' }}>
          Track your orders and delivery status
        </p>

        {orders.length === 0 ? (
          <div style={{ backgroundColor: 'white', padding: '60px 20px', borderRadius: '12px', border: '3px solid black', textAlign: 'center' }}>
            <p style={{ fontSize: '20px', color: 'gray', marginBottom: '20px' }}>No orders yet</p>
            <button
              onClick={() => router.push('/')}
              style={{ backgroundColor: 'blue', color: 'white', padding: '15px 30px', borderRadius: '8px', border: '2px solid black', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '20px' }}>
            {orders.map((order) => (
              <Link 
                key={order.id} 
                href={`/orders/${order.id}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div style={{ 
                  backgroundColor: 'white', 
                  padding: '20px', 
                  borderRadius: '12px', 
                  border: '3px solid black', 
                  boxShadow: '3px 3px 0px black',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  ':hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: '5px 5px 0px black'
                  }
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'black', margin: 0 }}>
                          Order #{order.id.slice(0, 8).toUpperCase()}
                        </h3>
                        {order.serviceType === 'PABILI' && (
                          <span style={{ padding: '4px 8px', backgroundColor: '#ffc107', color: 'black', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}> PABILI</span>
                        )}
                        {order.serviceType === 'PADALA' && (
                          <span style={{ padding: '4px 8px', backgroundColor: '#17a2b8', color: 'white', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>📦 PADALA</span>
                        )}
                      </div>
                      <p style={{ color: 'gray', fontSize: '14px', margin: '5px 0 0 0' }}>
                        Date: {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'green', margin: 0 }}>{order.totalAmount?.toFixed(2)}</p>
                      <p style={{ fontSize: '12px', color: 'gray', margin: '5px 0 0 0' }}>Delivery Fee: ₱{order.deliveryFee?.toFixed(2)}</p>
                    </div>
                  </div>

                  <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
                    <p style={{ color: 'gray', fontSize: '14px', margin: '5px 0' }}>
                      Status: <span style={{ fontWeight: 'bold', color: getStatusColor(order.status) }}>
                        {getStatusLabel(order.status)}
                      </span>
                    </p>
                    <p style={{ color: 'gray', fontSize: '14px', margin: '5px 0' }}>Delivery Address: {order.deliveryAddress}</p>
                    <p style={{ color: 'gray', fontSize: '14px', margin: '5px 0' }}>Contact: {order.contactNumber}</p>
                  </div>

                  {/* SERVICE SPECIFIC DETAILS */}
                  {order.serviceType === 'PABILI' && (
                    <div style={{ backgroundColor: '#fff3cd', padding: '15px', borderRadius: '8px', border: '2px solid #ffc107', marginBottom: '15px' }}>
                      <p style={{ fontWeight: 'bold', color: '#856404', marginBottom: '10px', margin: '0 0 10px 0' }}> PABILI Request Details:</p>
                      <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>What to buy:</strong> {order.itemDescription}</p>
                      {order.storeLocation && <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>Where:</strong> {order.storeLocation}</p>}
                      {order.maxAmount && <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>Max Budget:</strong> ₱{order.maxAmount.toFixed(2)}</p>}
                      {order.specialInstructions && <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>Instructions:</strong> {order.specialInstructions}</p>}
                    </div>
                  )}

                  {order.serviceType === 'PADALA' && (
                    <div style={{ backgroundColor: '#d1ecf1', padding: '15px', borderRadius: '8px', border: '2px solid #17a2b8', marginBottom: '15px' }}>
                      <p style={{ fontWeight: 'bold', color: '#0c5460', marginBottom: '10px', margin: '0 0 10px 0' }}>📦 PADALA Details:</p>
                      <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>Package:</strong> {order.packageDescription}</p>
                      <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>Sender:</strong> {order.senderName} ({order.senderContact})</p>
                      <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>Receiver:</strong> {order.receiverName} ({order.receiverContact})</p>
                    </div>
                  )}

                  {/* GROCERY ITEMS */}
                  {(!order.serviceType || order.serviceType === 'GROCERY') && order.items && order.items.length > 0 && (
                    <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
                      <p style={{ fontWeight: 'bold', marginBottom: '10px', color: 'black', margin: '0 0 10px 0' }}>Items Ordered:</p>
                      {order.items.map((item: any, idx: number) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', paddingBottom: '5px', borderBottom: '1px solid #eee' }}>
                          <div>
                            <p style={{ fontWeight: 'bold', color: 'black', margin: '0 0 5px 0' }}>{item.product?.name}</p>
                            <p style={{ fontSize: '12px', color: 'gray', margin: 0 }}>Quantity: {item.quantity}</p>
                          </div>
                          <p style={{ fontWeight: 'bold', color: 'green', margin: 0 }}>{(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* DELIVERY PROOF */}
                  {order.delivery?.proofUrl && (
                    <div style={{ padding: '15px', backgroundColor: '#e8f5e9', borderRadius: '8px', border: '2px solid green' }}>
                      <p style={{ fontWeight: 'bold', color: 'green', marginBottom: '10px', margin: '0 0 10px 0' }}>✅ Delivery Proof:</p>
                      <img src={order.delivery.proofUrl} alt="Delivery proof" style={{ width: '100%', maxWidth: '300px', borderRadius: '8px', border: '2px solid black' }} />
                      <p style={{ fontSize: '12px', color: 'gray', marginTop: '5px', margin: '5px 0 0 0' }}>
                        Delivered at: {new Date(order.delivery.completedAt).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}