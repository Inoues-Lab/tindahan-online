// src/app/admin/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'

export default function AdminDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [riders, setRiders] = useState([])
  const [income, setIncome] = useState<any>(null)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me')
      const data = await response.json()
      
      // SECURITY CHECK: Must be ADMIN role
      if (!data.user || data.user.role !== 'ADMIN') {
        alert('Access denied. Admins only.')
        router.push('/') // Redirect to home
        return
      }
      
      setUser(data.user)
      fetchDashboardData()
    } catch (error) {
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const fetchDashboardData = async () => {
    try {
      const [ridersRes, incomeRes] = await Promise.all([
        fetch('/api/admin/riders'),
        fetch('/api/admin/income')
      ])
      
      const ridersData = await ridersRes.json()
      const incomeData = await incomeRes.json()
      
      if (ridersRes.ok) setRiders(ridersData.riders || [])
      if (incomeRes.ok) setIncome(incomeData)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    }
  }

  if (loading) {
    return (
      <main style={{ minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
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
          Admin Dashboard 🔧
        </h1>
        <p style={{ fontSize: '18px', color: 'gray', marginBottom: '30px' }}>
          Manage riders, view remittances, and track income
        </p>

        <div style={{ display: 'grid', gap: '20px' }}>
          {/* Riders Section */}
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', border: '3px solid black', boxShadow: '4px 4px 0px black' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '15px' }}>
              Registered Riders
            </h2>
            {riders.length === 0 ? (
              <p style={{ color: 'gray' }}>No riders registered yet.</p>
            ) : (
              <div style={{ display: 'grid', gap: '10px' }}>
                {riders.map((rider: any) => (
                  <div key={rider.id} style={{ padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '2px solid black' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '5px' }}>{rider.name}</h3>
                        <p style={{ color: 'gray', marginBottom: '5px' }}>{rider.email}</p>
                        <p style={{ color: 'gray' }}>Phone: {rider.phone || 'N/A'}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '14px', color: 'gray' }}>Cash on Hand</p>
                        <p style={{ fontSize: '20px', fontWeight: 'bold', color: 'green' }}>₱{(rider.cashOnHand || 0).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Income Section */}
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', border: '3px solid black', boxShadow: '4px 4px 0px black' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '15px' }}>
              💰 Income Overview
            </h2>
            {income ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                <div style={{ padding: '20px', backgroundColor: '#e3f2fd', borderRadius: '8px', border: '2px solid black' }}>
                  <p style={{ fontSize: '14px', color: 'gray', marginBottom: '5px' }}>Total Revenue</p>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'blue' }}>₱{income.totalRevenue?.toFixed(2) || '0.00'}</p>
                </div>
                <div style={{ padding: '20px', backgroundColor: '#f3e5f5', borderRadius: '8px', border: '2px solid black' }}>
                  <p style={{ fontSize: '14px', color: 'gray', marginBottom: '5px' }}>Platform Income</p>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'purple' }}>₱{income.platformIncome?.toFixed(2) || '0.00'}</p>
                </div>
                <div style={{ padding: '20px', backgroundColor: '#e8f5e9', borderRadius: '8px', border: '2px solid black' }}>
                  <p style={{ fontSize: '14px', color: 'gray', marginBottom: '5px' }}>Pending Remittances</p>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'green' }}>₱{income.pendingRemittances?.toFixed(2) || '0.00'}</p>
                </div>
              </div>
            ) : (
              <p style={{ color: 'gray' }}>Loading income data...</p>
            )}
          </div>

          {/* Quick Links */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
            <a href="/admin/products" style={{ padding: '20px', backgroundColor: 'blue', color: 'white', borderRadius: '8px', border: '3px solid black', textAlign: 'center', fontWeight: 'bold', textDecoration: 'none', boxShadow: '4px 4px 0px black' }}>
              📦 Manage Products
            </a>
            <a href="/admin/remittance" style={{ padding: '20px', backgroundColor: 'green', color: 'white', borderRadius: '8px', border: '3px solid black', textAlign: 'center', fontWeight: 'bold', textDecoration: 'none', boxShadow: '4px 4px 0px black' }}>
              💸 Process Remittances
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}