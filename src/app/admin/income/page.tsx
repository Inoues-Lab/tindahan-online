'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminHeader from '@/components/AdminHeader'

const COMMISSION_RATE = 0.10
const DELIVERY_CUT_RATE = 0.20

export default function AdminIncomePage() {
  const router = useRouter()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState('')

  useEffect(() => {
    checkAuth()
  }, [router])

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me')
      const data = await res.json()
      if (!data.user || (data.user.role !== 'ADMIN' && data.user.role !== 'SUB_ADMIN')) {
        router.push('/')
        return
      }
      fetchOrders()
    } catch (error) {
      router.push('/')
    }
  }

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/admin/orders')
      const data = await res.json()
      if (res.ok) setOrders(data.orders || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const dateKey = (value: any) => {
    const d = new Date(value)
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
  }

  const valid = orders.filter((o) => o.status !== 'CANCELLED')

  const split = (o: any) => {
    const productSubtotal = Math.max((o.totalAmount || 0) - (o.deliveryFee || 0), 0)
    const commission = productSubtotal * COMMISSION_RATE
    const cut = o.riderId ? (o.deliveryFee || 0) * DELIVERY_CUT_RATE : 0
    return {
      productSubtotal,
      commission,
      cut,
      platform: commission + cut,
      merchant: productSubtotal - commission,
      rider: o.riderId ? (o.deliveryFee || 0) - cut : 0
    }
  }

  const totals = valid.reduce((acc, o) => {
    const s = split(o)
    acc.platform += s.platform
    acc.merchant += s.merchant
    acc.rider += s.rider
    acc.revenue += o.totalAmount || 0
    return acc
  }, { platform: 0, merchant: 0, rider: 0, revenue: 0 })

  const todayKey = dateKey(new Date())
  const yest = new Date()
  yest.setDate(yest.getDate() - 1)
  const yesterdayKey = dateKey(yest)

  const platformFor = (key: string) =>
    valid.filter((o) => dateKey(o.createdAt) === key).reduce((s, o) => s + split(o).platform, 0)

  const todayPlatform = platformFor(todayKey)
  const yesterdayPlatform = platformFor(yesterdayKey)
  const selectedPlatform = selectedDate ? platformFor(selectedDate) : 0
  const displayList = selectedDate ? orders.filter((o) => dateKey(o.createdAt) === selectedDate) : orders

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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '5px' }}>💰 Income & Analytics</h1>
            <p style={{ fontSize: '16px', color: 'gray' }}>10% commission + 20% delivery cut per order</p>
          </div>
          <button onClick={() => router.push('/admin')} style={{ padding: '12px 24px', backgroundColor: 'white', border: '2px solid black', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
            ← Back
          </button>
        </div>

        <div style={{ backgroundColor: '#ede7f6', padding: '25px', borderRadius: '12px', border: '3px solid #673ab7', textAlign: 'center', marginBottom: '20px', boxShadow: '4px 4px 0px black' }}>
          <p style={{ fontSize: '16px', color: 'gray', fontWeight: 'bold', marginBottom: '10px' }}>💎 YOUR PLATFORM EARNINGS (All Time)</p>
          <p style={{ fontSize: '48px', fontWeight: 'bold', color: '#673ab7', margin: 0 }}>₱{totals.platform.toFixed(2)}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          <div style={{ backgroundColor: '#e8f5e9', padding: '25px', borderRadius: '12px', border: '3px solid #4caf50', textAlign: 'center', boxShadow: '4px 4px 0px black' }}>
            <p style={{ fontSize: '14px', color: 'gray', fontWeight: 'bold', marginBottom: '10px' }}>📅 Today (Yours)</p>
            <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#4caf50', margin: 0 }}>₱{todayPlatform.toFixed(2)}</p>
          </div>
          <div style={{ backgroundColor: '#e3f2fd', padding: '25px', borderRadius: '12px', border: '3px solid #2196f3', textAlign: 'center', boxShadow: '4px 4px 0px black' }}>
            <p style={{ fontSize: '14px', color: 'gray', fontWeight: 'bold', marginBottom: '10px' }}>⏮️ Yesterday (Yours)</p>
            <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#2196f3', margin: 0 }}>₱{yesterdayPlatform.toFixed(2)}</p>
          </div>
          <div style={{ backgroundColor: '#fff3e0', padding: '25px', borderRadius: '12px', border: '3px solid #ff9800', textAlign: 'center', boxShadow: '4px 4px 0px black' }}>
            <p style={{ fontSize: '14px', color: 'gray', fontWeight: 'bold', marginBottom: '10px' }}>🏪 Merchants Earned</p>
            <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#ff9800', margin: 0 }}>₱{totals.merchant.toFixed(2)}</p>
          </div>
          <div style={{ backgroundColor: '#e0f7fa', padding: '25px', borderRadius: '12px', border: '3px solid #00bcd4', textAlign: 'center', boxShadow: '4px 4px 0px black' }}>
            <p style={{ fontSize: '14px', color: 'gray', fontWeight: 'bold', marginBottom: '10px' }}>🏍️ Riders Earned</p>
            <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#00bcd4', margin: 0 }}>₱{totals.rider.toFixed(2)}</p>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '3px solid black', boxShadow: '4px 4px 0px black', marginBottom: '30px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '15px' }}>🔍 Check a Specific Date</h2>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{ flex: 1, minWidth: '200px', padding: '12px', borderRadius: '8px', border: '2px solid black', fontSize: '16px', fontWeight: 'bold', boxSizing: 'border-box' }}
            />
            {selectedDate && (
              <button onClick={() => setSelectedDate('')} style={{ padding: '12px 20px', backgroundColor: 'white', border: '2px solid black', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                ✕ Clear
              </button>
            )}
          </div>
          {selectedDate && (
            <div style={{ marginTop: '15px', padding: '15px', backgroundColor: '#ede7f6', borderRadius: '8px', border: '2px solid #673ab7', textAlign: 'center' }}>
              <p style={{ fontWeight: 'bold', margin: 0, fontSize: '18px' }}>💎 Your earnings for {selectedDate}: ₱{selectedPlatform.toFixed(2)}</p>
            </div>
          )}
        </div>

        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '15px' }}>
          🧾 {selectedDate ? 'Orders on ' + selectedDate : 'Recent Orders'}
        </h2>
        {displayList.length === 0 ? (
          <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', border: '3px solid black', textAlign: 'center' }}>
            <p style={{ color: 'gray' }}>No orders.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '15px' }}>
            {displayList.map((o) => (
              <div key={o.id} style={{ backgroundColor: 'white', padding: '15px 20px', borderRadius: '12px', border: '3px solid black', boxShadow: '4px 4px 0px black', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <p style={{ fontWeight: 'bold', margin: '0 0 5px 0' }}>Order #{o.id.slice(-6).toUpperCase()} — {o.serviceType} | {o.status}</p>
                  <p style={{ fontSize: '12px', color: 'gray', margin: 0 }}>{new Date(o.createdAt).toLocaleString()} | {o.user?.name || 'N/A'} | Total ₱{(o.totalAmount || 0).toFixed(2)}</p>
                </div>
                <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#673ab7', margin: 0 }}>+₱{split(o).platform.toFixed(2)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
