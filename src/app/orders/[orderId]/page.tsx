'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Header from '@/components/Header'

export default function OrderDetailPage() {
  const router = useRouter()
  const params = useParams()
  const orderId = params.orderId
  
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user)
          fetchOrder()
        } else {
          router.push('/login')
        }
      })
      .catch(() => router.push('/login'))
  }, [orderId, router])

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}`)
      const data = await res.json()
      if (res.ok) {
        setOrder(data.order)
      } else {
        alert('Order not found')
        router.push('/orders/my-orders')
      }
    } catch (error) {
      console.error('Error fetching order:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return { bg: '#fff3cd', text: '#856404', label: '⏳ Pending' }
      case 'CONFIRMED': return { bg: '#d1ecf1', text: '#0c5460', label: '✅ Confirmed' }
      case 'PREPARING': return { bg: '#d1ecf1', text: '#0c5460', label: '🔨 Preparing' }
      case 'OUT_FOR_DELIVERY': return { bg: '#cce5ff', text: '#004085', label: ' Out for Delivery' }
      case 'DELIVERED': return { bg: '#d4edda', text: '#155724', label: '✅ Delivered' }
      case 'CANCELLED': return { bg: '#f8d7da', text: '#721c24', label: '❌ Cancelled' }
      default: return { bg: '#f0f0f0', text: '#333', label: status }
    }
  }

  if (loading) {
    return (
      <main style={{ minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
        <Header />
        <div style={{ textAlign: 'center', padding: '100px 20px' }}>Loading order details...</div>
      </main>
    )
  }

  if (!order) {
    return (
      <main style={{ minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
        <Header />
        <div style={{ textAlign: 'center', padding: '100px 20px' }}>
          <h1>Order not found</h1>
          <button 
            onClick={() => router.push('/orders/my-orders')}
            style={{ 
              marginTop: '20px', 
              padding: '12px 24px', 
              backgroundColor: 'blue', 
              color: 'white', 
              border: '2px solid black', 
              borderRadius: '8px', 
              fontWeight: 'bold', 
              cursor: 'pointer' 
            }}
          >
            ← Back to My Orders
          </button>
        </div>
      </main>
    )
  }

  const statusStyle = getStatusColor(order.status)

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
      <Header />
      <div style={{ 
        maxWidth: '800px', 
        margin: '0 auto', 
        padding: '16px'
      }}>
        <button
          onClick={() => router.push('/orders/my-orders')}
          style={{
            marginBottom: '20px',
            padding: '10px 16px',
            backgroundColor: 'white',
            color: 'black',
            border: '2px solid black',
            borderRadius: '8px',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          ← Back to Orders
        </button>

        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '12px', 
          border: '3px solid black',
          boxShadow: '4px 4px 0px black',
          marginBottom: '20px'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '10px',
            marginBottom: '20px',
            paddingBottom: '20px',
            borderBottom: '2px solid black'
          }}>
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '5px' }}>
                Order #{order.id.slice(-8).toUpperCase()}
              </h1>
              <p style={{ fontSize: '14px', color: 'gray' }}>
                📅 {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>
            <div style={{
              backgroundColor: statusStyle.bg,
              color: statusStyle.text,
              padding: '8px 16px',
              borderRadius: '8px',
              fontWeight: 'bold',
              fontSize: '14px',
              border: '2px solid black'
            }}>
              {statusStyle.label}
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px' }}>
              📍 Delivery Information
            </h2>
            <div style={{ 
              backgroundColor: '#f9f9f9', 
              padding: '15px', 
              borderRadius: '8px',
              border: '2px solid #ddd'
            }}>
              <p style={{ margin: '5px 0', fontSize: '14px' }}>
                <strong>Address:</strong> {order.deliveryAddress}
              </p>
              <p style={{ margin: '5px 0', fontSize: '14px' }}>
                <strong>Contact:</strong> {order.contactNumber}
              </p>
              <p style={{ margin: '5px 0', fontSize: '14px' }}>
                <strong>Payment:</strong> {order.paymentMethod === 'COD' ? '💵 Cash on Delivery' : '📱 GCash'}
              </p>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px' }}>
               Items Ordered
            </h2>
            <div style={{ border: '2px solid black', borderRadius: '8px' }}>
              {order.items.map((item: any, index: number) => (
                <div 
                  key={item.id}
                  style={{
                    padding: '15px',
                    borderBottom: index < order.items.length - 1 ? '1px solid #ddd' : 'none',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <p style={{ fontWeight: 'bold', margin: '0 0 5px 0', fontSize: '14px' }}>
                      {item.product?.name || 'Product'}
                    </p>
                    <p style={{ fontSize: '12px', color: 'gray', margin: 0 }}>
                      Quantity: {item.quantity}
                    </p>
                  </div>
                  <p style={{ fontWeight: 'bold', color: 'green', margin: 0 }}>
                    ₱{(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div style={{ 
            borderTop: '3px solid black', 
            paddingTop: '15px',
            backgroundColor: '#f9f9f9',
            padding: '15px',
            borderRadius: '8px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
              <span>Subtotal:</span>
              <span>₱{order.totalAmount ? (order.totalAmount - order.deliveryFee).toFixed(2) : '0.00'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
              <span>Delivery Fee:</span>
              <span>₱{order.deliveryFee?.toFixed(2) || '0.00'}</span>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              fontSize: '20px', 
              fontWeight: 'bold',
              borderTop: '2px solid black',
              paddingTop: '10px',
              color: 'green'
            }}>
              <span>Total:</span>
              <span>₱{order.totalAmount?.toFixed(2) || '0.00'}</span>
            </div>
          </div>
        </div>

        {/* Status Timeline */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '12px', 
          border: '3px solid black',
          boxShadow: '4px 4px 0px black'
        }}>
          <h2 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '15px' }}>
             Order Status Timeline
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ 
              padding: '12px', 
              backgroundColor: order.status === 'PENDING' ? '#fff3cd' : '#f0f0f0',
              borderRadius: '8px',
              border: '2px solid black',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <span style={{ fontSize: '20px' }}>⏳</span>
              <div>
                <p style={{ fontWeight: 'bold', margin: 0, fontSize: '14px' }}>Order Placed</p>
                <p style={{ fontSize: '12px', color: 'gray', margin: 0 }}>
                  {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
            
            {['CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED'].map((status, idx) => {
              const isCompleted = status === 'DELIVERED' && order.status === 'DELIVERED' ||
                                  status === 'OUT_FOR_DELIVERY' && ['OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.status) ||
                                  status === 'PREPARING' && ['PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.status) ||
                                  status === 'CONFIRMED' && !['PENDING'].includes(order.status)
              
              return (
                <div key={status} style={{ 
                  padding: '12px', 
                  backgroundColor: isCompleted ? '#d4edda' : '#f0f0f0',
                  borderRadius: '8px',
                  border: '2px solid black',
                  opacity: isCompleted ? 1 : 0.6,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <span style={{ fontSize: '20px' }}>
                    {status === 'CONFIRMED' ? '✅' : status === 'PREPARING' ? '🔨' : status === 'OUT_FOR_DELIVERY' ? '🚚' : '✅'}
                  </span>
                  <div>
                    <p style={{ fontWeight: 'bold', margin: 0, fontSize: '14px' }}>
                      {status === 'CONFIRMED' ? 'Order Confirmed' : 
                       status === 'PREPARING' ? 'Preparing Items' : 
                       status === 'OUT_FOR_DELIVERY' ? 'Out for Delivery' : 'Delivered'}
                    </p>
                    {isCompleted && (
                      <p style={{ fontSize: '12px', color: 'gray', margin: 0 }}>
                        Completed
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </main>
  )
}