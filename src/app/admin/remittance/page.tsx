'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'

export default function AdminRemittancePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [riders, setRiders] = useState<any[]>([])
  const [totalPending, setTotalPending] = useState(0)
  const [processedToday, setProcessedToday] = useState(0)
  const [processing, setProcessing] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    checkAuth()
    fetchRemittanceData()
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
    } catch (error) {
      router.push('/')
    }
  }

  const fetchRemittanceData = async () => {
    try {
      const res = await fetch('/api/admin/remittance')
      const data = await res.json()
      
      if (res.ok) {
        setRiders(data.riders || [])
        setTotalPending(data.totalPending || 0)
        setProcessedToday(data.processedToday || 0)
      } else {
        setError(data.error || 'Failed to load remittance data')
      }
    } catch (error) {
      setError('Error loading remittance data')
    } finally {
      setLoading(false)
    }
  }

  const processRemittance = async (riderId: string, riderName: string, amount: number) => {
    if (!confirm(`Process remittance of ₱${amount.toFixed(2)} from ${riderName}?`)) {
      return
    }

    setProcessing(riderId)
    try {
      const res = await fetch('/api/admin/remittance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ riderId, amount })
      })

      const data = await res.json()

      if (res.ok) {
        alert(`Remittance of ₱${amount.toFixed(2)} processed successfully!`)
        fetchRemittanceData()
      } else {
        alert(data.error || 'Failed to process remittance')
      }
    } catch (error) {
      alert('Error processing remittance')
    } finally {
      setProcessing(null)
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '5px' }}>
              💸 Remittance Management
            </h1>
            <p style={{ fontSize: '16px', color: 'gray' }}>
              Process rider cash remittances
            </p>
          </div>
          <button
            onClick={() => router.push('/admin')}
            style={{
              padding: '12px 20px',
              backgroundColor: 'gray',
              color: 'white',
              border: '2px solid black',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            ← Back to Dashboard
          </button>
        </div>

        {error && (
          <div style={{ backgroundColor: '#fee', padding: '15px', borderRadius: '8px', border: '2px solid red', marginBottom: '20px' }}>
            <strong style={{ color: 'red' }}>Error:</strong> {error}
          </div>
        )}

        {/* Summary Cards */}
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '3px solid black', marginBottom: '20px', boxShadow: '4px 4px 0px black' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '15px' }}>💰 Remittance Summary</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            <div style={{ padding: '15px', backgroundColor: '#e8f5e9', borderRadius: '8px', border: '2px solid green' }}>
              <p style={{ fontSize: '12px', color: 'gray', marginBottom: '5px' }}>Riders with Balance</p>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'green' }}>{riders.length}</p>
            </div>
            <div style={{ padding: '15px', backgroundColor: '#fff3e0', borderRadius: '8px', border: '2px solid orange' }}>
              <p style={{ fontSize: '12px', color: 'gray', marginBottom: '5px' }}>Total Pending</p>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'orange' }}>₱{totalPending.toFixed(2)}</p>
            </div>
            <div style={{ padding: '15px', backgroundColor: '#e3f2fd', borderRadius: '8px', border: '2px solid blue' }}>
              <p style={{ fontSize: '12px', color: 'gray', marginBottom: '5px' }}>Processed Today</p>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'blue' }}>{processedToday}</p>
            </div>
          </div>
        </div>

        {/* Riders List */}
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '3px solid black', boxShadow: '4px 4px 0px black' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '15px' }}>
            Riders with Cash on Hand ({riders.length})
          </h2>
          
          {riders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'gray' }}>
              <p style={{ fontSize: '16px' }}>No riders with pending remittances</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '15px' }}>
              {riders.map((rider) => (
                <div key={rider.id} style={{ padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '2px solid black' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <div>
                      <p style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '3px' }}>{rider.name}</p>
                      <p style={{ fontSize: '13px', color: 'gray' }}>{rider.email}</p>
                      <p style={{ fontSize: '13px', color: 'gray' }}>Phone: {rider.phone || 'N/A'}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '12px', color: 'gray' }}>Cash on Hand</p>
                      <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'green' }}>{rider.cashOnHand.toFixed(2)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => processRemittance(rider.id, rider.name, rider.cashOnHand)}
                    disabled={processing === rider.id}
                    style={{
                      width: '100%',
                      padding: '12px',
                      backgroundColor: processing === rider.id ? 'gray' : 'green',
                      color: 'white',
                      border: '2px solid black',
                      borderRadius: '8px',
                      fontWeight: 'bold',
                      cursor: processing === rider.id ? 'not-allowed' : 'pointer',
                      fontSize: '16px'
                    }}
                  >
                    {processing === rider.id ? 'Processing...' : `✅ Process Remittance - ₱${rider.cashOnHand.toFixed(2)}`}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}