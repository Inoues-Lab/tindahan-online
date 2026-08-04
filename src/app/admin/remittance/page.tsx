// src/app/admin/remittance/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'

export default function RemittancePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [riders, setRiders] = useState<any[]>([])
  const [remittances, setRemittances] = useState<any[]>([])
  const [processing, setProcessing] = useState<string | null>(null)

  useEffect(() => {
    checkAuth()
  }, [router])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me')
      const data = await response.json()
      
      if (!data.user || data.user.role !== 'ADMIN') {
        alert('Access denied. Admins only.')
        router.push('/')
        return
      }
      
      setUser(data.user)
      fetchData()
    } catch (error) {
      router.push('/login')
    }
  }

  const fetchData = async () => {
    try {
      const [ridersRes, remittancesRes] = await Promise.all([
        fetch('/api/admin/riders'),
        fetch('/api/admin/remittance')
      ])
      
      const ridersData = await ridersRes.json()
      const remittancesData = await remittancesRes.json()
      
      if (ridersRes.ok) setRiders(ridersData.riders || [])
      if (remittancesRes.ok) setRemittances(remittancesData.remittances || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const processRemittance = async (riderId: string, amount: number, riderName: string) => {
    if (!confirm(`Process remittance of ₱${amount.toFixed(2)} from ${riderName}?`)) {
      return
    }

    setProcessing(riderId)
    try {
      const response = await fetch('/api/admin/remittance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ riderId, amount })
      })

      const data = await response.json()

      if (response.ok) {
        alert(`Remittance of ₱${amount.toFixed(2)} from ${riderName} processed successfully!`)
        fetchData()
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
        <div style={{ textAlign: 'center', padding: '100px 20px' }}>
          <p>Loading...</p>
        </div>
      </main>
    )
  }

  const ridersWithBalance = riders.filter((rider: any) => rider.cashOnHand > 0)
  const totalPendingRemittance = ridersWithBalance.reduce((sum: number, rider: any) => sum + rider.cashOnHand, 0)

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
      <Header />
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: 'black', marginBottom: '10px' }}>
              💸 Process Remittances
            </h1>
            <p style={{ fontSize: '18px', color: 'gray' }}>
              Collect cash on hand from riders
            </p>
          </div>
          <button
            onClick={() => router.push('/admin')}
            style={{
              padding: '12px 24px',
              backgroundColor: 'gray',
              color: 'white',
              border: '2px solid black',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            ← Back to Dashboard
          </button>
        </div>

        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', border: '3px solid black', marginBottom: '30px', boxShadow: '4px 4px 0px black' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>💰 Remittance Summary</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
            <div style={{ padding: '20px', backgroundColor: '#e8f5e9', borderRadius: '8px', border: '2px solid green' }}>
              <p style={{ fontSize: '14px', color: 'gray', marginBottom: '5px' }}>Riders with Balance</p>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'green' }}>{ridersWithBalance.length}</p>
            </div>
            <div style={{ padding: '20px', backgroundColor: '#fff3e0', borderRadius: '8px', border: '2px solid orange' }}>
              <p style={{ fontSize: '14px', color: 'gray', marginBottom: '5px' }}>Total Pending</p>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'orange' }}>₱{totalPendingRemittance.toFixed(2)}</p>
            </div>
            <div style={{ padding: '20px', backgroundColor: '#e3f2fd', borderRadius: '8px', border: '2px solid blue' }}>
              <p style={{ fontSize: '14px', color: 'gray', marginBottom: '5px' }}>Processed Today</p>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'blue' }}>{remittances.length}</p>
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', border: '3px solid black', marginBottom: '30px', boxShadow: '4px 4px 0px black' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
            ️ Riders with Cash on Hand ({ridersWithBalance.length})
          </h2>
          
          {ridersWithBalance.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
              <p style={{ fontSize: '18px', color: 'gray', marginBottom: '10px' }}>✅ All riders have remitted!</p>
              <p style={{ fontSize: '14px', color: 'gray' }}>No pending remittances at the moment.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '15px' }}>
              {ridersWithBalance.map((rider: any) => (
                <div key={rider.id} style={{ padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '2px solid black' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '5px' }}>{rider.name}</h3>
                      <p style={{ color: 'gray', marginBottom: '5px' }}>{rider.email}</p>
                      <p style={{ color: 'gray', fontSize: '14px' }}>Phone: {rider.phone || 'N/A'}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '14px', color: 'gray' }}>Cash on Hand</p>
                      <p style={{ fontSize: '28px', fontWeight: 'bold', color: 'green' }}>₱{rider.cashOnHand.toFixed(2)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => processRemittance(rider.id, rider.cashOnHand, rider.name)}
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
                      fontSize: '16px',
                      boxShadow: '3px 3px 0px black'
                    }}
                  >
                    {processing === rider.id ? 'Processing...' : `✅ Process Remittance - ₱${rider.cashOnHand.toFixed(2)}`}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {remittances.length > 0 && (
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', border: '3px solid black', boxShadow: '4px 4px 0px black' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
              📋 Remittance History ({remittances.length})
            </h2>
            <div style={{ display: 'grid', gap: '10px' }}>
              {remittances.map((remittance: any) => (
                <div key={remittance.id} style={{ padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '2px solid black', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontWeight: 'bold', color: 'black', marginBottom: '5px' }}>
                      {remittance.rider?.name || 'Unknown Rider'}
                    </p>
                    <p style={{ fontSize: '12px', color: 'gray' }}>
                      {new Date(remittance.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '20px', fontWeight: 'bold', color: 'green' }}>₱{remittance.amount.toFixed(2)}</p>
                    <p style={{ fontSize: '12px', color: 'gray' }}>{remittance.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
