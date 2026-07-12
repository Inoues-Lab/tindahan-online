// src/app/orders/my-orders/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'

interface OrderItem {
  id: string
  productId: string
  quantity: number
  price: number
  product?: {
    name: string
    description?: string
  }
}

interface Order {
  id: string
  status: string
  totalAmount: number
  deliveryFee: number
  deliveryAddress: string
  contactNumber: string
  createdAt: string
  items?: OrderItem[]
}

export default function MyOrdersPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<Order[]>([])
  const [error, setError] = useState('')
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    checkAuth()
    fetchOrders()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me')
      const data = await response.json()
      
      if (!data.user || data.user.role !== 'CUSTOMER') {
        router.push('/login')
      } else {
        setUser(data.user)
      }
    } catch (error) {
      console.error('Auth check error:', error)
      router.push('/login')
    }
  }

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders')
      const data = await response.json()
      
      if (response.ok && data.orders) {
        setOrders(data.orders)
      } else {
        setError('Failed to fetch orders')
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      setError('Failed to fetch orders')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'PENDING': return 'orange'
      case 'ACCEPTED': return 'blue'
      case 'OUT_FOR_DELIVERY': return 'purple'
      case 'COMPLETED': return 'green'
      case 'CANCELLED': return 'red'
      default: return 'gray'
    }
  }

  const getStatusText = (status: string) => {
    switch(status) {
      case 'PENDING': return ' Pending'
      case 'ACCEPTED': return '✓ Accepted by Rider'
      case 'OUT_FOR_DELIVERY': return '🚚 Out for Delivery'
      case 'COMPLETED': return '✅ Completed'
      case 'CANCELLED': return '❌ Cancelled'
      default: return status
    }
  }

  if (loading) {
    return (
      <main style={{ minHeight: '100vh', backgroundColor: 'white' }}>
        <Header />
        <div style={{ textAlign: 'center', padding: '100px 20px' }}>
          <p>Loading...</p>
        </div>
      </main>
    )
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
      <Header />
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: 'black', marginBottom: '10px' }}>
          My Orders 📦
        </h1>
        <p style={{ fontSize: '18px', color: 'gray', marginBottom: '30px' }}>
          Track your orders and delivery status
        </p>

        {error && (
          <div style={{ backgroundColor: '#ffebee', color: 'red', padding: '20px', borderRadius: '8px', border: '2px solid red', marginBottom: '20px', textAlign: 'center' }}>
            <p style={{ margin: 0, fontWeight: 'bold' }}>{error}</p>
            <button
              onClick={fetchOrders}
              style={{
                backgroundColor: 'blue',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '8px',
                border: '2px solid black',
                fontWeight: 'bold',
                cursor: 'pointer',
                marginTop: '10px'
              }}
            >
              Retry
            </button>
          </div>
        )}

        {orders.length === 0 ? (
          <div style={{ backgroundColor: 'white', padding: '60px', borderRadius: '12px', border: '3px solid black', textAlign: 'center' }}>
            <p style={{ fontSize: '18px', color: 'gray', marginBottom: '20px' }}>You haven't placed any orders yet</p>
            <button
              onClick={() => router.push('/')}
              style={{
                backgroundColor: 'blue',
                color: 'white',
                padding: '15px 30px',
                borderRadius: '8px',
                border: '2px solid black',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '20px' }}>
            {orders.map((order) => (
              <div key={order.id} style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', border: '3px solid black', boxShadow: '4px 4px 0px black' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px', flexWrap: 'wrap', gap: '15px' }}>
                  <div>
                    <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 10px 0' }}>
                      Order #{order.id.slice(0, 8).toUpperCase()}
                    </h3>
                    <p style={{ fontSize: '14px', color: 'gray', margin: '5px 0' }}>
                      Date: {new Date(order.createdAt).toLocaleString()}
                    </p>
                    <p style={{ fontSize: '16px', margin: '10px 0' }}>
                      Status: <strong style={{ 
                        color: getStatusColor(order.status),
                        backgroundColor: getStatusColor(order.status) + '20',
                        padding: '5px 15px',
                        borderRadius: '20px',
                        display: 'inline-block'
                      }}>
                        {getStatusText(order.status)}
                      </strong>
                    </p>
                    <p style={{ fontSize: '14px', color: 'gray', margin: '5px 0' }}>
                      Delivery Address: {order.deliveryAddress}
                    </p>
                    <p style={{ fontSize: '14px', color: 'gray', margin: '5px 0' }}>
                      Contact: {order.contactNumber}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '32px', fontWeight: 'bold', color: 'green', margin: 0 }}>
                      ₱{order.totalAmount.toFixed(2)}
                    </p>
                    <p style={{ fontSize: '14px', color: 'gray', margin: '5px 0' }}>
                      Delivery Fee: ₱{order.deliveryFee.toFixed(2)}
                    </p>
                  </div>
                </div>

                {order.items && order.items.length > 0 && (
                  <div style={{ backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px', marginBottom: '15px' }}>
                    <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '15px' }}>Items Ordered:</h4>
                    {order.items.map((item) => (
                      <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #ddd', alignItems: 'center' }}>
                        <div>
                          <p style={{ fontWeight: 'bold', margin: 0, fontSize: '16px' }}>{item.product?.name || 'Product'}</p>
                          <p style={{ fontSize: '14px', color: 'gray', margin: '5px 0' }}>{item.product?.description || ''}</p>
                          <p style={{ fontSize: '14px', color: 'gray', margin: '5px 0' }}>Quantity: {item.quantity}</p>
                        </div>
                        <p style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>
                          ₱{(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {order.status === 'OUT_FOR_DELIVERY' && (
                  <div style={{ backgroundColor: '#e7f3ff', padding: '15px', borderRadius: '8px', border: '2px solid #0066cc', marginBottom: '15px' }}>
                    <p style={{ margin: 0, fontWeight: 'bold', color: '#0066cc', fontSize: '16px' }}>
                      🚚 Your order is out for delivery! A rider is on the way to deliver your items.
                    </p>
                  </div>
                )}

                {order.status === 'COMPLETED' && (
                  <div style={{ backgroundColor: '#d4edda', padding: '15px', borderRadius: '8px', border: '2px solid #28a745' }}>
                    <p style={{ margin: 0, fontWeight: 'bold', color: '#28a745', fontSize: '16px' }}>
                      ✅ Order completed successfully! Thank you for your purchase.
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}