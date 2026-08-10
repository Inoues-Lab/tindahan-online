'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'

export default function MerchantDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalSales: 0,
    pendingOrders: 0
  })
  const [loading, setLoading] = useState(true)
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    checkAuth()
    fetchPendingOrders()
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
      fetchStats()
    } catch (error) {
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  const fetchPendingOrders = async () => {
    try {
      const res = await fetch('/api/merchant/orders')
      const data = await res.json()
      if (res.ok) {
        const pending = data.orders?.filter((o: any) => 
          o.status === 'PENDING' || o.status === 'CONFIRMED' || o.status === 'PREPARING'
        ).length || 0
        setPendingCount(pending)
      }
    } catch (error) {
      console.error('Error fetching pending orders:', error)
    }
  }

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/merchant/stats')
      const data = await res.json()
      if (res.ok) {
        setStats({
          totalProducts: data.totalProducts || 0,
          totalSales: data.totalSales || 0,
          pendingOrders: data.pendingOrders || 0
        })
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  if (loading) {
    return (
      <main style={{ minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
        <Header />
        <div style={{ textAlign: 'center', padding: '100px 20px' }}>Loading dashboard...</div>
      </main>
    )
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
      <Header />
      
      {/* NOTIFICATION BANNER */}
      {pendingCount > 0 && (
        <div style={{ 
          backgroundColor: '#ff4d4f', 
          color: 'white', 
          padding: '15px', 
          textAlign: 'center', 
          fontWeight: 'bold', 
          fontSize: '18px',
          borderBottom: '3px solid black',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '10px',
          flexWrap: 'wrap'
        }}>
          <span style={{ fontSize: '24px' }}>🔔</span>
          <span>You have {pendingCount} new order(s) to process!</span>
          <button 
            onClick={() => router.push('/merchant/orders')}
            style={{ 
              marginLeft: '10px', 
              padding: '8px 20px', 
              backgroundColor: 'white', 
              color: '#ff4d4f', 
              border: '2px solid black', 
              borderRadius: '20px', 
              fontWeight: 'bold', 
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            View Now
          </button>
        </div>
      )}

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '10px' }}>
            Welcome back, {user?.name || 'Merchant'}!
          </h1>
          <p style={{ fontSize: '16px', color: 'gray' }}>
            Manage your store and orders
          </p>
        </div>

        {/* Quick Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          <div style={{ backgroundColor: '#e3f2fd', padding: '25px', borderRadius: '12px', border: '3px solid #2196f3', textAlign: 'center' }}>
            <p style={{ fontSize: '14px', color: 'gray', marginBottom: '10px', fontWeight: 'bold' }}>My Products</p>
            <p style={{ fontSize: '48px', fontWeight: 'bold', color: '#2196f3', margin: 0 }}>{stats.totalProducts}</p>
          </div>

          <div style={{ backgroundColor: '#e8f5e9', padding: '25px', borderRadius: '12px', border: '3px solid #4caf50', textAlign: 'center' }}>
            <p style={{ fontSize: '14px', color: 'gray', marginBottom: '10px', fontWeight: 'bold' }}>Total Sales</p>
            <p style={{ fontSize: '48px', fontWeight: 'bold', color: '#4caf50', margin: 0 }}>₱{stats.totalSales.toFixed(2)}</p>
          </div>

          <div style={{ backgroundColor: '#fff3e0', padding: '25px', borderRadius: '12px', border: '3px solid #ff9800', textAlign: 'center' }}>
            <p style={{ fontSize: '14px', color: 'gray', marginBottom: '10px', fontWeight: 'bold' }}>Pending Orders</p>
            <p style={{ fontSize: '48px', fontWeight: 'bold', color: '#ff9800', margin: 0 }}>{pendingCount}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          <button
            onClick={() => router.push('/merchant/products')}
            style={{
              padding: '30px',
              backgroundColor: '#2196f3',
              color: 'white',
              border: '3px solid black',
              borderRadius: '12px',
              fontSize: '20px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '4px 4px 0px black',
              textAlign: 'left'
            }}
          >
            📦 Manage Products
          </button>

          <button
            onClick={() => router.push('/merchant/orders')}
            style={{
              padding: '30px',
              backgroundColor: pendingCount > 0 ? '#ff4d4f' : '#4caf50',
              color: 'white',
              border: '3px solid black',
              borderRadius: '12px',
              fontSize: '20px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '4px 4px 0px black',
              textAlign: 'left',
              position: 'relative'
            }}
          >
            🛒 View Orders
            {pendingCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-10px',
                right: '-10px',
                backgroundColor: 'yellow',
                color: 'black',
                borderRadius: '50%',
                padding: '8px 12px',
                fontSize: '16px',
                fontWeight: 'bold',
                border: '2px solid black'
              }}>
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => router.push('/')}
            style={{
              padding: '30px',
              backgroundColor: 'white',
              color: 'black',
              border: '3px solid black',
              borderRadius: '12px',
              fontSize: '20px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '4px 4px 0px black',
              textAlign: 'left'
            }}
          >
            🏪 Go to Home
          </button>
        </div>
      </div>
    </main>
  )
}