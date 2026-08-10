'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'

export default function MerchantOrdersPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [error, setError] = useState('')

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
      const res = await fetch('/api/orders')
      const data = await res.json()
      if (res.ok) {
        // For now, show all orders. Later we'll filter by merchant products
        setOrders(data.orders || [])
      } else {
        setError(data.error)
      }
    } catch (error) {
      setError('Failed to load orders')
    } finally {
      setLoading(false)
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
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '5px' }}>
               Merchant Orders
            </h1>
            <p style={{ fontSize: '16px', color: 'gray' }}>
              View and manage customer orders
            </p>
          </div>
          <button
            onClick={() => router.push('/merchant/dashboard')}
            style={{
              padding: '10px 20px',
              backgroundColor: 'gray',
              color: 'white',
              border: '2px solid black',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            ← Back
          </button>
        </div>

        {error && (
          <div style={{ backgroundColor: '#fee', padding: '15px', borderRadius: '8px', border: '2px solid red', marginBottom: '20px', color: 'red' }}>
            {error}
          </div>
        )}

        {orders.length === 0 ? (
          <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', border: '3px solid black', textAlign: 'center' }}>
            <p style={{ fontSize: '18px', color: 'gray' }}>No orders yet</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '15px' }}>
            {orders.map((order) => (
              <div key={order.id} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '3px solid black', boxShadow: '4px 4px 0px black' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '15px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                      <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>Order #{order.id.slice(0, 8).toUpperCase()}</h3>
                      <span style={{ 
                        padding: '4px 12px', 
                        borderRadius: '20px', 
                        fontSize: '12px', 
                        fontWeight: 'bold',
                        backgroundColor: order.status === 'COMPLETED' ? '#e8f5e9' : order.status === 'PENDING' ? '#fff3cd' : '#e3f2fd',
                        color: order.status === 'COMPLETED' ? 'green' : order.status === 'PENDING' ? '#856404' : 'blue',
                        border: `1px solid ${order.status === 'COMPLETED' ? 'green' : order.status === 'PENDING' ? '#ffc107' : 'blue'}`
                      }}>
                        {order.status}
                      </span>
                    </div>
                    <p style={{ margin: '5px 0', color: 'gray', fontSize: '14px' }}>
                      <strong>Customer:</strong> {order.customer?.name || 'Unknown'}
                    </p>
                    <p style={{ margin: '5px 0', color: 'gray', fontSize: '14px' }}>
                      <strong>Address:</strong> {order.deliveryAddress}
                    </p>
                    <p style={{ margin: '5px 0', color: 'gray', fontSize: '14px' }}>
                      <strong>Contact:</strong> {order.contactNumber}
                    </p>
                    <p style={{ margin: '5px 0', color: 'gray', fontSize: '14px' }}>
                      <strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                    
                    {order.items && order.items.length > 0 && (
                      <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
                        <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>Items:</p>
                        {order.items.map((item: any, idx: number) => (
                          <p key={idx} style={{ margin: '3px 0', fontSize: '14px' }}>
                            • {item.product?.name || 'Product'} x{item.quantity} - ₱{(item.price * item.quantity).toFixed(2)}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div style={{ textAlign: 'right', minWidth: '150px' }}>
                    <p style={{ fontSize: '12px', color: 'gray', marginBottom: '5px' }}>Total Amount</p>
                    <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'green', marginBottom: '10px' }}>
                      ₱{order.totalAmount?.toFixed(2) || '0.00'}
                    </p>
                    <p style={{ fontSize: '12px', color: 'gray' }}>
                      Payment: {order.paymentMethod || 'COD'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}