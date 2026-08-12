'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminHeader from '@/components/AdminHeader'

export default function AdminIncomePage() {
  const router = useRouter()
  const [stats, setStats] = useState({
    totalRevenue: 0,
    platformFees: 0,
    deliveryFees: 0
  })

  useEffect(() => {
    fetchIncome()
  }, [])

  const fetchIncome = async () => {
    try {
      const res = await fetch('/api/admin/income')
      const data = await res.json()
      if (res.ok) {
        setStats({
          totalRevenue: data.totalRevenue || 0,
          platformFees: data.platformFees || 0,
          deliveryFees: data.deliveryFees || 0
        })
      }
    } catch (error) {
      console.error('Error fetching income:', error)
    }
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
      <AdminHeader />
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '30px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold' }}>💰 Income & Analytics</h1>
          <button
            onClick={() => router.push('/admin/dashboard')}
            style={{ padding: '10px 20px', backgroundColor: 'white', color: 'black', border: '2px solid black', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            ← Back to Dashboard
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          <div style={{ backgroundColor: '#e8f5e9', padding: '30px', borderRadius: '12px', border: '3px solid #4caf50', textAlign: 'center' }}>
            <p style={{ fontSize: '14px', color: 'gray', marginBottom: '10px', fontWeight: 'bold' }}>Total Revenue</p>
            <p style={{ fontSize: '48px', fontWeight: 'bold', color: '#4caf50', margin: 0 }}>₱{stats.totalRevenue.toFixed(2)}</p>
          </div>

          <div style={{ backgroundColor: '#e3f2fd', padding: '30px', borderRadius: '12px', border: '3px solid #2196f3', textAlign: 'center' }}>
            <p style={{ fontSize: '14px', color: 'gray', marginBottom: '10px', fontWeight: 'bold' }}>Platform Fees</p>
            <p style={{ fontSize: '48px', fontWeight: 'bold', color: '#2196f3', margin: 0 }}>₱{stats.platformFees.toFixed(2)}</p>
          </div>

          <div style={{ backgroundColor: '#fff3e0', padding: '30px', borderRadius: '12px', border: '3px solid #ff9800', textAlign: 'center' }}>
            <p style={{ fontSize: '14px', color: 'gray', marginBottom: '10px', fontWeight: 'bold' }}>Delivery Fees</p>
            <p style={{ fontSize: '48px', fontWeight: 'bold', color: '#ff9800', margin: 0 }}>₱{stats.deliveryFees.toFixed(2)}</p>
          </div>
        </div>
      </div>
    </main>
  )
}