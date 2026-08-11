'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'

export default function AdminDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalMerchants: 0,
    totalRiders: 0,
    totalOrders: 0,
    totalProducts: 0
  })

  useEffect(() => {
    checkAuth()
  }, [router])

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me')
      const data = await res.json()
      
      if (!data.user || data.user.role !== 'ADMIN') {
        router.push('/login')
        return
      }
      
      setUser(data.user)
      fetchStats()
    } catch (error) {
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats')
      const data = await res.json()
      if (res.ok) {
        setStats({
          totalUsers: data.totalUsers || 0,
          totalMerchants: data.totalMerchants || 0,
          totalRiders: data.totalRiders || 0,
          totalOrders: data.totalOrders || 0,
          totalProducts: data.totalProducts || 0
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
        <div style={{ textAlign: 'center', padding: '100px 20px' }}>Loading...</div>
      </main>
    )
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
      <Header />
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '10px' }}>
            Admin Dashboard
          </h1>
          <p style={{ fontSize: '16px', color: 'gray' }}>
            Welcome back, {user?.name}!
          </p>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          <div style={{ backgroundColor: '#e3f2fd', padding: '25px', borderRadius: '12px', border: '3px solid #2196f3', textAlign: 'center' }}>
            <p style={{ fontSize: '14px', color: 'gray', marginBottom: '10px', fontWeight: 'bold' }}>Total Users</p>
            <p style={{ fontSize: '48px', fontWeight: 'bold', color: '#2196f3', margin: 0 }}>{stats.totalUsers}</p>
          </div>

          <div style={{ backgroundColor: '#fff3e0', padding: '25px', borderRadius: '12px', border: '3px solid #ff9800', textAlign: 'center' }}>
            <p style={{ fontSize: '14px', color: 'gray', marginBottom: '10px', fontWeight: 'bold' }}>Merchants</p>
            <p style={{ fontSize: '48px', fontWeight: 'bold', color: '#ff9800', margin: 0 }}>{stats.totalMerchants}</p>
          </div>

          <div style={{ backgroundColor: '#e8f5e9', padding: '25px', borderRadius: '12px', border: '3px solid #4caf50', textAlign: 'center' }}>
            <p style={{ fontSize: '14px', color: 'gray', marginBottom: '10px', fontWeight: 'bold' }}>Riders</p>
            <p style={{ fontSize: '48px', fontWeight: 'bold', color: '#4caf50', margin: 0 }}>{stats.totalRiders}</p>
          </div>

          <div style={{ backgroundColor: '#f3e5f5', padding: '25px', borderRadius: '12px', border: '3px solid #9c27b0', textAlign: 'center' }}>
            <p style={{ fontSize: '14px', color: 'gray', marginBottom: '10px', fontWeight: 'bold' }}>Orders</p>
            <p style={{ fontSize: '48px', fontWeight: 'bold', color: '#9c27b0', margin: 0 }}>{stats.totalOrders}</p>
          </div>

          <div style={{ backgroundColor: '#fce4ec', padding: '25px', borderRadius: '12px', border: '3px solid #e91e63', textAlign: 'center' }}>
            <p style={{ fontSize: '14px', color: 'gray', marginBottom: '10px', fontWeight: 'bold' }}>Products</p>
            <p style={{ fontSize: '48px', fontWeight: 'bold', color: '#e91e63', margin: 0 }}>{stats.totalProducts}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          <button
            onClick={() => router.push('/admin/merchants')}
            style={{
              padding: '30px',
              backgroundColor: '#ff9800',
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
             Manage Merchants
          </button>

          <button
            onClick={() => router.push('/admin/riders')}
            style={{
              padding: '30px',
              backgroundColor: '#4caf50',
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
            ️ Manage Riders
          </button>

          <button
            onClick={() => router.push('/admin/orders')}
            style={{
              padding: '30px',
              backgroundColor: '#9c27b0',
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
            📦 View All Orders
          </button>

          <button
            onClick={() => router.push('/admin/products')}
            style={{
              padding: '30px',
              backgroundColor: '#e91e63',
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
            🛍️ Manage Products
          </button>

          <button
            onClick={() => router.push('/admin/income')}
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
            💰 Income & Analytics
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
             Go to Home
          </button>
        </div>
      </div>
    </main>
  )
}