'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import RiderHeader from '@/components/RiderHeader'

export default function RiderIncomePage() {
  const router = useRouter()
  const [deliveries, setDeliveries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState('')

  useEffect(() => {
    fetchIncome()
  }, [])

  const fetchIncome = async () => {
    try {
      const res = await fetch('/api/rider/income')
      const data = await res.json()
      if (res.ok) setDeliveries(data.deliveries || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const dateKey = (value: any) => {
    const d = new Date(value)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return year + '-' + month + '-' + day
  }

  const todayKey = dateKey(new Date())
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayKey = dateKey(yesterday)

  const sumFor = (key: string) =>
    deliveries.filter((d) => dateKey(d.createdAt) === key).reduce((s, d) => s + (d.deliveryFee || 0), 0)

  const todayIncome = sumFor(todayKey)
  const yesterdayIncome = sumFor(yesterdayKey)
  const totalIncome = deliveries.reduce((s, d) => s + (d.deliveryFee || 0), 0)
  const selectedIncome = selectedDate ? sumFor(selectedDate) : 0
  const displayList = selectedDate ? deliveries.filter((d) => dateKey(d.createdAt) === selectedDate) : deliveries

  if (loading) {
    return (
      <main style={{ minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
        <RiderHeader />
        <div style={{ textAlign: 'center', padding: '100px 20px' }}>Loading...</div>
      </main>
    )
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
      <RiderHeader />
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '30px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '5px' }}>💰 My Income</h1>
            <p style={{ fontSize: '16px', color: 'gray' }}>Track your earnings</p>
          </div>
          <button onClick={() => router.push('/rider/dashboard')} style={{ padding: '12px 24px', backgroundColor: 'white', border: '2px solid black', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
            ← Back
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          <div style={{ backgroundColor: '#e8f5e9', padding: '25px', borderRadius: '12px', border: '3px solid #4caf50', textAlign: 'center', boxShadow: '4px 4px 0px black' }}>
            <p style={{ fontSize: '14px', color: 'gray', fontWeight: 'bold', marginBottom: '10px' }}>📅 Today's Income</p>
            <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#4caf50', margin: 0 }}>₱{todayIncome.toFixed(2)}</p>
            <p style={{ fontSize: '12px', color: 'gray', marginTop: '5px' }}>{deliveries.filter((d) => dateKey(d.createdAt) === todayKey).length} deliveries</p>
          </div>
          <div style={{ backgroundColor: '#e3f2fd', padding: '25px', borderRadius: '12px', border: '3px solid #2196f3', textAlign: 'center', boxShadow: '4px 4px 0px black' }}>
            <p style={{ fontSize: '14px', color: 'gray', fontWeight: 'bold', marginBottom: '10px' }}>⏮️ Yesterday</p>
            <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#2196f3', margin: 0 }}>₱{yesterdayIncome.toFixed(2)}</p>
            <p style={{ fontSize: '12px', color: 'gray', marginTop: '5px' }}>{deliveries.filter((d) => dateKey(d.createdAt) === yesterdayKey).length} deliveries</p>
          </div>
          <div style={{ backgroundColor: '#f3e5f5', padding: '25px', borderRadius: '12px', border: '3px solid #9c27b0', textAlign: 'center', boxShadow: '4px 4px 0px black' }}>
            <p style={{ fontSize: '14px', color: 'gray', fontWeight: 'bold', marginBottom: '10px' }}>🏆 Total Income</p>
            <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#9c27b0', margin: 0 }}>₱{totalIncome.toFixed(2)}</p>
            <p style={{ fontSize: '12px', color: 'gray', marginTop: '5px' }}>{deliveries.length} deliveries</p>
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
            <div style={{ marginTop: '15px', padding: '15px', backgroundColor: '#fff3e0', borderRadius: '8px', border: '2px solid #ff9800', textAlign: 'center' }}>
              <p style={{ fontWeight: 'bold', margin: 0, fontSize: '18px' }}>
                💵 Income for {selectedDate}: ₱{selectedIncome.toFixed(2)}
              </p>
            </div>
          )}
        </div>

        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '15px' }}>
           {selectedDate ? 'Deliveries on ' + selectedDate : 'All Deliveries'}
        </h2>
        {displayList.length === 0 ? (
          <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', border: '3px solid black', textAlign: 'center' }}>
            <p style={{ color: 'gray' }}>No delivered orders yet.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '15px' }}>
            {displayList.map((d) => (
              <div key={d.id} style={{ backgroundColor: 'white', padding: '15px 20px', borderRadius: '12px', border: '3px solid black', boxShadow: '4px 4px 0px black', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <p style={{ fontWeight: 'bold', margin: '0 0 5px 0' }}>Order #{d.id.slice(0, 8).toUpperCase()} — {d.serviceType}</p>
                  <p style={{ fontSize: '12px', color: 'gray', margin: 0 }}>{new Date(d.createdAt).toLocaleString()}</p>
                </div>
                <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#4caf50', margin: 0 }}>+₱{(d.deliveryFee || 0).toFixed(2)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
