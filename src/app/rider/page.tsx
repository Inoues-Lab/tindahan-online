// src/app/rider/page.tsx
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
  customer?: {
    name: string
    phone: string
  }
}

export default function RiderDashboard() {
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
      
      if (!data.user || data.user.role !== 'RIDER') {
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
      setError('')
      
      const [ordersResponse, userResponse] = await Promise.all([
        fetch('/api/orders'),
        fetch('/api/auth/me')
      ])
      
      const ordersData = await ordersResponse.json()
      const userData = await userResponse.json()
      
      if (ordersResponse.ok && ordersData.orders) {
        setOrders(ordersData.orders)
      } else {
        setError('Failed to fetch orders')
      }
      
      if (userData.user) {
        setUser(userData.user)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      setError('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptOrder = async (orderId: string) => {
    try {
      const response = await fetch('/api/rider/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId })
      })

      if (response.ok) {
        alert('Order accepted!')
        fetchOrders()
      } else {
        alert('Failed to accept order')
      }
    } catch (error) {
      console.error('Error accepting order:', error)
      alert('Error accepting order')
    }
  }

  const handleMarkDelivered = async (orderId: string, totalAmount: number) => {
    try {
      const response = await fetch('/api/rider/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          orderId,
          status: 'COMPLETED',
          cashOnHand: totalAmount
        })
      })

      if (response.ok) {
        setTimeout(() => {
          fetchOrders()
        }, 500)
        alert('Order marked as completed! Cash on hand updated.')
      } else {
        const errorData = await response.json()
        alert('Failed to update order status: ' + (errorData.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error updating order:', error)
      alert('Error updating order')
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
          Rider Dashboard 🏍️
        </h1>
        <p style={{ fontSize: '18px', color: 'gray', marginBottom: '30px' }}>
          Accept deliveries and earn money
        </p>

        {user && (
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '3px solid black', marginBottom: '30px', boxShadow: '4px 4px 0px black' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '15px' }}>💰 Rider Earnings</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <div style={{ backgroundColor: '#d4edda', padding: '15px', borderRadius: '8px', border: '2px solid #28a745' }}>
                <p style={{ fontSize: '14px', color: 'gray', marginBottom: '5px' }}>Cash on Hand</p>
                <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#28a745', margin: 0 }}>
                  ₱{user.cashOnHand?.toFixed(2) || '0.00'}
                </p>
                <p style={{ fontSize: '12px', color: 'gray', marginTop: '5px' }}>To remit to admin</p>
              </div>
              <div style={{ backgroundColor: '#cce5ff', padding: '15px', borderRadius: '8px', border: '2px solid #007bff' }}>
                <p style={{ fontSize: '14px', color: 'gray', marginBottom: '5px' }}>Remittance Limit</p>
                <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#007bff', margin: 0 }}>
                  ₱{user.remittanceLimit?.toFixed(2) || '2000.00'}
                </p>
                <p style={{ fontSize: '12px', color: 'gray', marginTop: '5px' }}>Max cash before remitting</p>
              </div>
            </div>
          </div>
        )}

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

        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
          Available Orders ({orders.length})
        </h2>

        {orders.length === 0 ? (
          <div style={{ backgroundColor: 'white', padding: '60px', borderRadius: '12px', border: '3px solid black', textAlign: 'center' }}>
            <p style={{ fontSize: '18px', color: 'gray', marginBottom: '20px' }}>No orders available right now</p>
            <p style={{ fontSize: '16px', color: 'gray' }}>Check back soon!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '20px' }}>
            {orders.map((order) => (
              <div key={order.id} style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', border: '3px solid black', boxShadow: '4px 4px 0px black' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                  <div>
                    <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 10px 0' }}>Order #{order.id.slice(0, 8)}</h3>
                    <p style={{ fontSize: '14px', color: 'gray', margin: '5px 0' }}>
                      Status: <strong style={{ color: order.status === 'PENDING' ? 'orange' : 'green' }}>{order.status}</strong>
                    </p>
                    <p style={{ fontSize: '14px', color: 'gray', margin: '5px 0' }}>
                      Customer: {order.customer?.name || 'N/A'}
                    </p>
                    <p style={{ fontSize: '14px', color: 'gray', margin: '5px 0' }}>
                      Contact: {order.contactNumber}
                    </p>
                    <p style={{ fontSize: '14px', color: 'gray', margin: '5px 0' }}>
                      Address: {order.deliveryAddress}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '28px', fontWeight: 'bold', color: 'green', margin: 0 }}>
                      ₱{order.totalAmount.toFixed(2)}
                    </p>
                    <p style={{ fontSize: '14px', color: 'gray', margin: '5px 0' }}>
                      Delivery Fee: ₱{order.deliveryFee.toFixed(2)}
                    </p>
                  </div>
                </div>

                {order.items && order.items.length > 0 && (
                  <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
                    <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px' }}>Items:</h4>
                    {order.items.map((item) => (
                      <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #ddd' }}>
                        <span>{item.product?.name || 'Product'} (x{item.quantity})</span>
                        <strong>₱{(item.price * item.quantity).toFixed(2)}</strong>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '10px' }}>
                  {order.status === 'PENDING' && (
                    <button
                      onClick={() => handleAcceptOrder(order.id)}
                      style={{
                        flex: 1,
                        backgroundColor: 'green',
                        color: 'white',
                        padding: '12px',
                        borderRadius: '8px',
                        border: '2px solid black',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        fontSize: '16px'
                      }}
                    >
                      Accept Order
                    </button>
                  )}
                  {order.status === 'ACCEPTED' && (
                    <button
                      onClick={() => handleMarkDelivered(order.id, order.totalAmount)}
                      style={{
                        flex: 1,
                        backgroundColor: 'blue',
                        color: 'white',
                        padding: '12px',
                        borderRadius: '8px',
                        border: '2px solid black',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        fontSize: '16px'
                      }}
                    >
                      Mark as Delivered
                    </button>
                  )}
                  {order.status === 'COMPLETED' && (
                    <div style={{ flex: 1, backgroundColor: '#d4edda', padding: '12px', borderRadius: '8px', border: '2px solid #28a745', textAlign: 'center', fontWeight: 'bold', color: '#28a745' }}>
                      ✓ Completed
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}