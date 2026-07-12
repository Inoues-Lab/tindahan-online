// src/app/admin/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'

export default function AdminDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [riders, setRiders] = useState<any[]>([])
  const [incomeData, setIncomeData] = useState<any>(null)
  const [error, setError] = useState('')
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    checkAuth()
    fetchData()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me')
      const data = await response.json()
      
      if (!data.user || data.user.role !== 'ADMIN') {
        router.push('/login')
      } else {
        setUser(data.user)
      }
    } catch (error) {
      console.error('Auth check error:', error)
      router.push('/login')
    }
  }

  const fetchData = async () => {
    try {
      setError('')
      
      const [ridersResponse, incomeResponse] = await Promise.all([
        fetch('/api/admin/riders'),
        fetch('/api/admin/income')
      ])
      
      const ridersData = await ridersResponse.json()
      const incomeData = await incomeResponse.json()
      
      if (ridersResponse.ok && ridersData.riders) {
        setRiders(ridersData.riders)
      }
      
      if (incomeResponse.ok && incomeData) {
        setIncomeData(incomeData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      setError('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const handleRemittance = async (riderId: string, amount: number, riderName: string) => {
    if (!confirm(`Process remittance of ₱${amount.toFixed(2)} from ${riderName}?`)) return
    
    try {
      const response = await fetch('/api/admin/remittance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ riderId, amount })
      })

      if (response.ok) {
        alert(`Remittance of ₱${amount.toFixed(2)} processed successfully!`)
        fetchData()
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to process remittance')
      }
    } catch (error) {
      alert('Error processing remittance')
    }
  }

  if (loading) {
    return (
      <main style={{ minHeight: '100vh', backgroundColor: 'white' }}>
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
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: 'black', marginBottom: '10px' }}>
          Admin Dashboard 🔧
        </h1>
        <p style={{ fontSize: '18px', color: 'gray', marginBottom: '30px' }}>
          Manage riders, view remittances, and track income
        </p>

        {error && (
          <div style={{ backgroundColor: '#ffebee', color: 'red', padding: '20px', borderRadius: '8px', border: '2px solid red', marginBottom: '20px', textAlign: 'center' }}>
            <p style={{ margin: 0, fontWeight: 'bold' }}>{error}</p>
            <button
              onClick={fetchData}
              style={{
                backgroundColor: 'blue',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '8px',
                border: '2px solid black',
                fontWeight: 'bold',
                cursor: 'pointer',
                marginTop: '10px'
              }}
            >
              Retry
            </button>
          </div>
        )}

        {incomeData && (
          <div style={{ marginBottom: '30px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '20px', color: 'black' }}>
              💰 Income & Cash Flow Overview
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
              <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', border: '3px solid #28a745', boxShadow: '4px 4px 0px #28a745' }}>
                <p style={{ fontSize: '14px', color: 'gray', marginBottom: '10px', fontWeight: 'bold' }}>Total Revenue</p>
                <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#28a745', margin: 0 }}>
                  ₱{incomeData.totalRevenue?.toFixed(2) || '0.00'}
                </p>
                <p style={{ fontSize: '12px', color: 'gray', marginTop: '5px' }}>From {incomeData.ordersStats?.completed || 0} completed orders</p>
              </div>

              <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', border: '3px solid #007bff', boxShadow: '4px 4px 0px #007bff' }}>
                <p style={{ fontSize: '14px', color: 'gray', marginBottom: '10px', fontWeight: 'bold' }}>Platform Income</p>
                <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#007bff', margin: 0 }}>
                  ₱{incomeData.platformIncome?.toFixed(2) || '0.00'}
                </p>
                <p style={{ fontSize: '12px', color: 'gray', marginTop: '5px' }}>From delivery fees</p>
              </div>

              <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', border: '3px solid #ffc107', boxShadow: '4px 4px 0px #ffc107' }}>
                <p style={{ fontSize: '14px', color: 'gray', marginBottom: '10px', fontWeight: 'bold' }}>Pending Remittances</p>
                <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#ffc107', margin: 0 }}>
                  ₱{incomeData.pendingRemittances?.toFixed(2) || '0.00'}
                </p>
                <p style={{ fontSize: '12px', color: 'gray', marginTop: '5px' }}>From riders' cash on hand</p>
              </div>

              <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', border: '3px solid #dc3545', boxShadow: '4px 4px 0px #dc3545' }}>
                <p style={{ fontSize: '14px', color: 'gray', marginBottom: '10px', fontWeight: 'bold' }}>Total Rider Payouts</p>
                <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#dc3545', margin: 0 }}>
                  ₱{incomeData.totalRiderPayouts?.toFixed(2) || '0.00'}
                </p>
                <p style={{ fontSize: '12px', color: 'gray', marginTop: '5px' }}>Paid to riders</p>
              </div>
            </div>

            <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', border: '3px solid black', marginBottom: '30px', boxShadow: '4px 4px 0px black' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>📊 Order Statistics</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
                <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#fff3cd', borderRadius: '8px', border: '2px solid #ffc107' }}>
                  <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#ffc107', margin: '0 0 5px 0' }}>{incomeData.ordersStats?.pending || 0}</p>
                  <p style={{ fontSize: '14px', color: 'gray', margin: 0 }}>Pending</p>
                </div>
                <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#cce5ff', borderRadius: '8px', border: '2px solid #007bff' }}>
                  <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#007bff', margin: '0 0 5px 0' }}>{incomeData.ordersStats?.accepted || 0}</p>
                  <p style={{ fontSize: '14px', color: 'gray', margin: 0 }}>Accepted</p>
                </div>
                <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#d4edda', borderRadius: '8px', border: '2px solid #28a745' }}>
                  <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#28a745', margin: '0 0 5px 0' }}>{incomeData.ordersStats?.outForDelivery || 0}</p>
                  <p style={{ fontSize: '14px', color: 'gray', margin: 0 }}>Out for Delivery</p>
                </div>
                <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#d4edda', borderRadius: '8px', border: '2px solid #28a745' }}>
                  <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#28a745', margin: '0 0 5px 0' }}>{incomeData.ordersStats?.completed || 0}</p>
                  <p style={{ fontSize: '14px', color: 'gray', margin: 0 }}>Completed</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', border: '3px solid black', boxShadow: '4px 4px 0px black' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}> Registered Riders</h2>
          
          {riders.length === 0 ? (
            <p style={{ color: 'gray', fontSize: '16px' }}>No riders registered yet.</p>
          ) : (
            <div style={{ display: 'grid', gap: '15px' }}>
              {riders.map((rider) => (
                <div key={rider.id} style={{ padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '2px solid black' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>{rider.name}</h3>
                  <p style={{ color: 'gray', marginBottom: '5px' }}>Email: {rider.email}</p>
                  <p style={{ color: 'gray', marginBottom: '5px' }}>Phone: {rider.phone || 'N/A'}</p>
                  <p style={{ color: 'green', fontWeight: 'bold', marginBottom: '5px' }}>
                    Cash on Hand: ₱{rider.cashOnHand?.toFixed(2) || '0.00'}
                  </p>
                  <p style={{ color: 'blue', fontWeight: 'bold' }}>
                    Remittance Limit: ₱{rider.remittanceLimit?.toFixed(2) || '2000.00'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', border: '3px solid black', marginTop: '30px', boxShadow: '4px 4px 0px black' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>💸 Process Remittances</h2>
          <p style={{ fontSize: '16px', color: 'gray', marginBottom: '20px' }}>
            Riders remit their collected cash (product costs) to the admin. They keep the delivery fees as earnings.
          </p>
          
          {riders.filter(r => r.cashOnHand > 0).length === 0 ? (
            <p style={{ color: 'gray' }}>No riders have cash to remit.</p>
          ) : (
            <div style={{ display: 'grid', gap: '15px' }}>
              {riders.filter(r => r.cashOnHand > 0).map((rider) => (
                <div key={rider.id} style={{ padding: '20px', backgroundColor: '#fff3cd', borderRadius: '8px', border: '2px solid #ffc107', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '5px' }}>{rider.name}</h3>
                    <p style={{ color: 'gray', marginBottom: '5px' }}>Cash on Hand: <strong style={{ color: '#28a745' }}>₱{rider.cashOnHand.toFixed(2)}</strong></p>
                    <p style={{ fontSize: '14px', color: 'gray' }}>
                      Product costs to remit (rider keeps delivery fees as earnings)
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemittance(rider.id, rider.cashOnHand, rider.name)}
                    style={{
                      backgroundColor: '#28a745',
                      color: 'white',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      border: '2px solid black',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      fontSize: '16px'
                    }}
                  >
                    Process Remittance
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