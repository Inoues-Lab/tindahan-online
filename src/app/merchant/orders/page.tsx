'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import MerchantHeader from '@/components/MerchantHeader'

export default function MerchantOrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    checkAuth()
    fetchOrders()
  }, [router])

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me')
      const data = await res.json()
      if (!data.user || data.user.role !== 'MERCHANT') {
        router.push('/')
      }
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
      } else {
        setError(data.error)
      }
    } catch (error) {
      setError('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`/api/merchant/orders`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status })
      })

      if (res.ok) {
        alert(`Order ${status}`)
        fetchOrders()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to update order')
      }
    } catch (error) {
      alert('Error updating order')
    }
  }

  if (loading) {
    return (
      <main style={{ minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
        <MerchantHeader />
        <div style={{ textAlign: 'center', padding: '100px 20px' }}>Loading orders...</div>
      </main>
    )
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
      <MerchantHeader />
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '5px' }}>
            Customer Orders
          </h1>
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
            ← Back to Dashboard
          </button>
        </div>

        {error && (
          <div style={{ backgroundColor: '#fee', padding: '15px', borderRadius: '8px', border: '2px solid red', marginBottom: '20px', color: 'red' }}>
            {error}
          </div>
        )}

        {orders.length === 0 ? (
          <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', border: '3px solid black', textAlign: 'center' }}>
            <p style={{ fontSize: '18px', color: 'gray' }}>No orders yet.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '20px' }}>
            {orders.map((order) => (
              <div key={order.id} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '3px solid black' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '5px' }}>Order #{order.id.slice(-6)}</h3>
                    <p style={{ color: 'gray', fontSize: '14px' }}>
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <span style={{
                    padding: '5px 15px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    backgroundColor: order.status === 'COMPLETED' ? '#d4edda' : order.status === 'CANCELLED' ? '#f8d7da' : '#fff3cd',
                    color: order.status === 'COMPLETED' ? '#155724' : order.status === 'CANCELLED' ? '#721c24' : '#856404',
                    border: `1px solid ${order.status === 'COMPLETED' ? '#28a745' : order.status === 'CANCELLED' ? '#dc3545' : '#ffc107'}`
                  }}>
                    {order.status}
                  </span>
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>Customer:</p>
                  <p style={{ fontSize: '14px' }}>{order.user?.name || 'N/A'}</p>
                  <p style={{ fontSize: '14px', color: 'gray' }}>{order.user?.email || 'N/A'}</p>
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>Items:</p>
                  <ul style={{ margin: 0, paddingLeft: '20px' }}>
                    {order.items?.map((item: any, idx: number) => (
                      <li key={idx} style={{ fontSize: '14px', marginBottom: '3px' }}>
                        {item.quantity}x {item.product?.name} - {item.product?.price}
                      </li>
                    ))}
                  </ul>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '2px solid #f0f0f0', paddingTop: '15px' }}>
                  <div>
                    <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#4caf50', margin: 0 }}>
                      Total: ₱{order.totalAmount}
                    </p>
                    {order.deliveryAddress && (
                      <p style={{ fontSize: '14px', color: 'gray', margin: '5px 0 0 0' }}>
                        📍 {order.deliveryAddress}
                      </p>
                    )}
                  </div>
                  
                  {order.status === 'PENDING' && (
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        onClick={() => updateOrderStatus(order.id, 'CONFIRMED')}
                        style={{
                          padding: '10px 20px',
                          backgroundColor: '#28a745',
                          color: 'white',
                          border: '2px solid black',
                          borderRadius: '8px',
                          fontWeight: 'bold',
                          cursor: 'pointer'
                        }}
                      >
                        ✓ Confirm
                      </button>
                      <button
                        onClick={() => updateOrderStatus(order.id, 'CANCELLED')}
                        style={{
                          padding: '10px 20px',
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: '2px solid black',
                          borderRadius: '8px',
                          fontWeight: 'bold',
                          cursor: 'pointer'
                        }}
                      >
                        ✗ Cancel
                      </button>
                    </div>
                  )}
                  
                  {order.status === 'CONFIRMED' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'READY_FOR_PICKUP')}
                      style={{
                        padding: '10px 20px',
                        backgroundColor: '#17a2b8',
                        color: 'white',
                        border: '2px solid black',
                        borderRadius: '8px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                    >
                       Mark as Ready
                    </button>
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