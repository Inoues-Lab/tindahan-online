'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'

export default function AdminDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [riders, setRiders] = useState<any[]>([])
  const [incomeData, setIncomeData] = useState<any>({
    todayIncome: 0,
    totalIncome: 0,
    todayRevenue: 0,
    totalRevenue: 0,
    todayOrders: 0,
    totalOrders: 0
  })
  const [error, setError] = useState('')

  useEffect(() => {
    checkAuth()
  }, [router])

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me')
      const data = await res.json()
      
      if (!data.user || data.user.role !== 'ADMIN') {
        router.push('/')
        return
      }
      
      setUser(data.user)
      fetchDashboardData()
    } catch (error) {
      router.push('/')
    }
  }

  const fetchDashboardData = async () => {
    try {
      // Fetch riders
      const ridersRes = await fetch('/api/admin/riders')
      const ridersData = await ridersRes.json()
      
      if (ridersRes.ok) {
        setRiders(ridersData.riders || [])
      }

      // Fetch income
      const incomeRes = await fetch('/api/admin/income')
      const incomeData = await incomeRes.json()
      
      if (incomeRes.ok) {
        setIncomeData(incomeData)
      } else {
        console.error('Income fetch error:', incomeData)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setError('Failed to load dashboard data')
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
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '5px' }}>
          Admin Dashboard 🔧
        </h1>
        <p style={{ fontSize: '16px', color: 'gray', marginBottom: '20px' }}>
          Manage riders, view remittances, and track income
        </p>

        {error && (
          <div style={{ backgroundColor: '#fee', padding: '15px', borderRadius: '8px', border: '2px solid red', marginBottom: '20px' }}>
            <strong style={{ color: 'red' }}>Error:</strong> {error}
          </div>
        )}

        {/* Registered Riders */}
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '3px solid black', marginBottom: '20px', boxShadow: '4px 4px 0px black' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '15px' }}>Registered Riders</h2>
          {riders.length === 0 ? (
            <p style={{ color: 'gray' }}>No riders registered yet</p>
          ) : (
            <div style={{ display: 'grid', gap: '15px' }}>
              {riders.map((rider) => (
                <div key={rider.id} style={{ padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '2px solid black', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontWeight: 'bold', marginBottom: '3px' }}>{rider.name}</p>
                    <p style={{ fontSize: '13px', color: 'gray' }}>{rider.email}</p>
                    <p style={{ fontSize: '13px', color: 'gray' }}>Phone: {rider.phone || 'N/A'}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '12px', color: 'gray' }}>Cash on Hand</p>
                    <p style={{ fontSize: '20px', fontWeight: 'bold', color: 'green' }}>₱{rider.cashOnHand?.toFixed(2) || '0.00'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Income Overview */}
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '3px solid black', marginBottom: '20px', boxShadow: '4px 4px 0px black' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '15px' }}>💰 Income Overview</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            <div style={{ padding: '15px', backgroundColor: '#e8f5e9', borderRadius: '8px', border: '2px solid green' }}>
              <p style={{ fontSize: '12px', color: 'gray', marginBottom: '5px' }}>Today's Income</p>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'green' }}>₱{incomeData.todayIncome?.toFixed(2) || '0.00'}</p>
              <p style={{ fontSize: '11px', color: 'gray' }}>{incomeData.todayOrders || 0} orders today</p>
            </div>
            <div style={{ padding: '15px', backgroundColor: '#e3f2fd', borderRadius: '8px', border: '2px solid blue' }}>
              <p style={{ fontSize: '12px', color: 'gray', marginBottom: '5px' }}>Total Income</p>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'blue' }}>₱{incomeData.totalIncome?.toFixed(2) || '0.00'}</p>
              <p style={{ fontSize: '11px', color: 'gray' }}>{incomeData.totalOrders || 0} total orders</p>
            </div>
            <div style={{ padding: '15px', backgroundColor: '#fff3e0', borderRadius: '8px', border: '2px solid orange' }}>
              <p style={{ fontSize: '12px', color: 'gray', marginBottom: '5px' }}>Today's Revenue</p>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'orange' }}>₱{incomeData.todayRevenue?.toFixed(2) || '0.00'}</p>
              <p style={{ fontSize: '11px', color: 'gray' }}>Gross sales</p>
            </div>
            <div style={{ padding: '15px', backgroundColor: '#f3e5f5', borderRadius: '8px', border: '2px solid purple' }}>
              <p style={{ fontSize: '12px', color: 'gray', marginBottom: '5px' }}>Total Revenue</p>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'purple' }}>{incomeData.totalRevenue?.toFixed(2) || '0.00'}</p>
              <p style={{ fontSize: '11px', color: 'gray' }}>All time gross</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <button
            onClick={() => router.push('/admin/products')}
            style={{
              padding: '20px',
              backgroundColor: 'blue',
              color: 'white',
              border: '3px solid black',
              borderRadius: '12px',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '18px',
              boxShadow: '4px 4px 0px black'
            }}
          >
            📦 Manage Products
          </button>
          <button
            onClick={() => router.push('/admin/remittance')}
            style={{
              padding: '20px',
              backgroundColor: 'green',
              color: 'white',
              border: '3px solid black',
              borderRadius: '12px',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '18px',
              boxShadow: '4px 4px 0px black'
            }}
          >
            💸 Process Remittances
          </button>
        </div>
      </div>
    </main>
  )
}