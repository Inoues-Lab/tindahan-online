import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import MerchantHeader from '@/components/MerchantHeader'

export default function MerchantDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalSales: 0,
    pendingOrders: 0
  })

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me')
      const data = await res.json()
      
      if (!data.user) {
        router.push('/login')
        return
      }
      
      if (data.user.role !== 'MERCHANT') {
        if (data.user.role === 'ADMIN') {
          router.push('/admin/dashboard')
        } else if (data.user.role === 'RIDER') {
          router.push('/rider/dashboard')
        } else {
          router.push('/')
        }
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
        <MerchantHeader />
        <div style={{ textAlign: 'center', padding: '100px 20px' }}>Loading...</div>
      </main>
    )
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
      <MerchantHeader />
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '30px 20px' }}>
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '5px' }}>
            Welcome back, {user?.name}!
          </h1>
          <p style={{ fontSize: '16px', color: 'gray' }}>
            Manage your store and orders
          </p>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
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
            <p style={{ fontSize: '48px', fontWeight: 'bold', color: '#ff9800', margin: 0 }}>{stats.pendingOrders}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Quick Actions</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
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
              backgroundColor: '#dc3545',
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
            🛍️ View Orders
            {stats.pendingOrders > 0 && (
              <span style={{
                position: 'absolute',
                top: '-10px',
                right: '-10px',
                backgroundColor: 'yellow',
                color: 'black',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                border: '2px solid black'
              }}>
                {stats.pendingOrders}
              </span>
            )}
          </button>

          <button
            onClick={() => router.push('/merchant/income')}
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
            💰 My Income
          </button>
        </div>
      </div>
    </main>
  )
}
