// src/app/rider/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'

export default function RiderDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [pendingOrders, setPendingOrders] = useState<any[]>([])
  const [myOrders, setMyOrders] = useState<any[]>([])
  const [cashOnHand, setCashOnHand] = useState(0)
  const [todayEarnings, setTodayEarnings] = useState(0)

  useEffect(() => {
    checkAuth()
  }, [router])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me')
      const data = await response.json()
      
      if (!data.user || data.user.role !== 'RIDER') {
        alert('Access denied. Riders only.')
        router.push('/')
        return
      }
      
      setUser(data.user)
      fetchRiderData()
    } catch (error) {
      router.push('/login')
    }
  }

  const fetchRiderData = async () => {
    try {
      const ordersRes = await fetch('/api/rider/orders')
      const ordersData = await ordersRes.json()
      
      if (ordersRes.ok) {
        setPendingOrders(ordersData.pendingOrders || [])
        setMyOrders(ordersData.myOrders || [])
        
        const today = new Date().toISOString().split('T')[0]
        const todaysCompleted = (ordersData.myOrders || []).filter((order: any) => {
          const orderDate = order.createdAt ? order.createdAt.split('T')[0] : ''
          return orderDate === today && order.status === 'COMPLETED'
        })
        
        const todaysIncome = todaysCompleted.reduce((sum: number, order: any) => {
          return sum + (order.riderPayout || 0)
        }, 0)
        
        setTodayEarnings(todaysIncome)
      }
    } catch (error) {
      console.error('Error fetching rider data:', error)
    } finally {
      setLoading(false)
    }
  }

  const acceptOrder = async (orderId: string) => {
    try {
      const response = await fetch(`/api/rider/orders/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId })
      })
      
      if (response.ok) {
        alert('Order accepted!')
        fetchRiderData()
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to accept order')
      }
    } catch (error) {
      alert('Error accepting order')
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

        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', border: '3px solid black', marginBottom: '30px', boxShadow: '4px 4px 0px black' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>💰 Rider Earnings</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
            <div style={{ padding: '20px', backgroundColor: '#e8f5e9', borderRadius: '8px', border: '2px solid green' }}>
              <p style={{ fontSize: '14px', color: 'gray', marginBottom: '5px' }}>Today's Income</p>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'green' }}>₱{todayEarnings.toFixed(2)}</p>
              <p style={{ fontSize: '12px', color: 'gray' }}>From completed deliveries</p>
            </div>
            <div style={{ padding: '20px', backgroundColor: '#e3f2fd', borderRadius: '8px', border: '2px solid blue' }}>
              <p style={{ fontSize: '14px', color: 'gray', marginBottom: '5px' }}>Cash on Hand</p>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'blue' }}>₱{cashOnHand.toFixed(2)}</p>
              <p style={{ fontSize: '12px', color: 'gray' }}>To remit to admin</p>
            </div>
            <div style={{ padding: '20px', backgroundColor: '#fff3e0', borderRadius: '8px', border: '2px solid orange' }}>
              <p style={{ fontSize: '14px', color: 'gray', marginBottom: '5px' }}>Remittance Limit</p>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'orange' }}>₱2000.00</p>
              <p style={{ fontSize: '12px', color: 'gray' }}>Max cash before remitting</p>
            </div>
          </div>
        </div>

        {/* Pending Orders - Available for all riders */}
        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', border: '3px solid black', marginBottom: '30px', boxShadow: '4px 4px 0px black' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
            📦 Available Orders ({pendingOrders.length})
          </h2>
          {pendingOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
              <p style={{ fontSize: '18px', color: 'gray' }}>No orders available right now</p>
              <p style={{ fontSize: '14px', color: 'gray' }}>Check back soon!</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '15px' }}>
              {pendingOrders.map((order) => (
                <div key={order.id} style={{ padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '2px solid black' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '5px' }}>Order #{order.id.slice(0, 8)}</h3>
                      <p style={{ color: 'gray', marginBottom: '5px' }}>{order.customer?.name}</p>
                      <p style={{ color: 'gray', marginBottom: '5px' }}>{order.deliveryAddress}</p>
                      <p style={{ color: 'gray', fontSize: '14px' }}>Contact: {order.contactNumber}</p>
                      <p style={{ color: 'gray', fontSize: '14px' }}>
                        Items: {order.items.map((item: any) => `${item.product.name} x${item.quantity}`).join(', ')}
                      </p>
                      <p style={{ color: 'gray', fontSize: '14px' }}>Weight: {order.requiredLoadKg}kg</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '14px', color: 'gray' }}>Delivery Fee</p>
                      <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'green' }}>₱{order.deliveryFee?.toFixed(2) || '0.00'}</p>
                      <p style={{ fontSize: '12px', color: 'gray' }}>Total: {order.totalAmount?.toFixed(2)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => acceptOrder(order.id)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      backgroundColor: 'blue',
                      color: 'white',
                      border: '2px solid black',
                      borderRadius: '8px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      fontSize: '16px',
                      boxShadow: '3px 3px 0px black'
                    }}
                  >
                    Accept Order
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My Orders */}
        {myOrders.length > 0 && (
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', border: '3px solid black', boxShadow: '4px 4px 0px black' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
              ️ My Orders ({myOrders.length})
            </h2>
            <div style={{ display: 'grid', gap: '15px' }}>
              {myOrders.map((order) => (
                <div key={order.id} style={{ padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '2px solid black' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>Order #{order.id.slice(0, 8)}</h3>
                      <p style={{ color: 'gray' }}>{order.deliveryAddress}</p>
                      <p style={{ color: 'gray' }}>Status: <span style={{ fontWeight: 'bold', color: order.status === 'COMPLETED' ? 'green' : 'orange' }}>{order.status}</span></p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '20px', fontWeight: 'bold', color: 'green' }}>₱{order.riderPayout?.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}