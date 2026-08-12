'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminHeader from '@/components/AdminHeader'

export default function AdminDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    merchants: 0,
    riders: 0,
    customers: 0,
    orders: 0,
    products: 0
  })

  useEffect(() => {
    checkAuth()
  }, [router])

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me')
      const data = await res.json()
      
      if (!data.user) {
        router.push('/login')
        return
      }
      
      if (data.user.role !== 'ADMIN') {
        router.push('/')
        return
      }
      
      setUser(data.user)
      fetchStats()
    } catch (error) {
      console.error('Auth check error:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      // Fetch all stats in parallel
      const [usersRes, merchantsRes, ridersRes, ordersRes, productsRes] = await Promise.all([
        fetch('/api/admin/users'), // You might need to create this or adjust based on your existing API
        fetch('/api/admin/merchants'),
        fetch('/api/admin/riders'),
        fetch('/api/admin/orders'),
        fetch('/api/admin/products')
      ])

      const usersData = await usersRes.json().catch(() => ({ users: [] }))
      const merchantsData = await merchantsRes.json().catch(() => ({ applications: [] }))
      const ridersData = await ridersRes.json().catch(() => ({ applications: [] }))
      const ordersData = await ordersRes.json().catch(() => ({ orders: [] }))
      const productsData = await productsRes.json().catch(() => ({ products: [] }))

      // Calculate customers (users with role USER)
      const customersCount = (usersData.users || []).filter((u: any) => u.role === 'USER').length

      setStats({
        totalUsers: (usersData.users || []).length,
        merchants: (merchantsData.applications || []).length,
        riders: (ridersData.applications || []).length,
        customers: customersCount,
        orders: (ordersData.orders || []).length,
        products: (productsData.products || []).length
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  if (loading) {
    return (
      <main style={{ minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
        <AdminHeader />
        <div style={{ textAlign: 'center', padding: '100px 20px' }}>Loading...</div>
      </main>
    )
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
      <AdminHeader />
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '30px 20px' }}>
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '5px' }}>
            Admin Dashboard
          </h1>
          <p style={{ fontSize: '16px', color: 'gray' }}>
            Welcome back, {user?.name}!
          </p>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
          <div style={{ backgroundColor: '#e3f2fd', padding: '25px', borderRadius: '12px', border: '3px solid #2196f3', textAlign: 'center' }}>
            <p style={{ fontSize: '14px', color: 'gray', marginBottom: '10px', fontWeight: 'bold' }}>Total Users</p>
            <p style={{ fontSize: '48px', fontWeight: 'bold', color: '#2196f3', margin: 0 }}>{stats.totalUsers}</p>
          </div>

          <div style={{ backgroundColor: '#fff3e0', padding: '25px', borderRadius: '12px', border: '3px solid #ff9800', textAlign: 'center' }}>
            <p style={{ fontSize: '14px', color: 'gray', marginBottom: '10px', fontWeight: 'bold' }}>Merchants</p>
            <p style={{ fontSize: '48px', fontWeight: 'bold', color: '#ff9800', margin: 0 }}>{stats.merchants}</p>
          </div>

          <div style={{ backgroundColor: '#e8f5e9', padding: '25px', borderRadius: '12px', border: '3px solid #4caf50', textAlign: 'center' }}>
            <p style={{ fontSize: '14px', color: 'gray', marginBottom: '10px', fontWeight: 'bold' }}>Riders</p>
            <p style={{ fontSize: '48px', fontWeight: 'bold', color: '#4caf50', margin: 0 }}>{stats.riders}</p>
          </div>

          <div style={{ backgroundColor: '#e0f7fa', padding: '25px', borderRadius: '12px', border: '3px solid #00bcd4', textAlign: 'center' }}>
            <p style={{ fontSize: '14px', color: 'gray', marginBottom: '10px', fontWeight: 'bold' }}>Customers</p>
            <p style={{ fontSize: '48px', fontWeight: 'bold', color: '#00bcd4', margin: 0 }}>{stats.customers}</p>
          </div>

          <div style={{ backgroundColor: '#f3e5f5', padding: '25px', borderRadius: '12px', border: '3px solid #9c27b0', textAlign: 'center' }}>
            <p style={{ fontSize: '14px', color: 'gray', marginBottom: '10px', fontWeight: 'bold' }}>Orders</p>
            <p style={{ fontSize: '48px', fontWeight: 'bold', color: '#9c27b0', margin: 0 }}>{stats.orders}</p>
          </div>

          <div style={{ backgroundColor: '#fce4ec', padding: '25px', borderRadius: '12px', border: '3px solid #e91e63', textAlign: 'center' }}>
            <p style={{ fontSize: '14px', color: 'gray', marginBottom: '10px', fontWeight: 'bold' }}>Products</p>
            <p style={{ fontSize: '48px', fontWeight: 'bold', color: '#e91e63', margin: 0 }}>{stats.products}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Quick Actions</h2>
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
             Manage Riders
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
             View All Orders
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
             Manage Products
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
             Income & Analytics
          </button>
        </div>
      </div>
    </main>
  )
}