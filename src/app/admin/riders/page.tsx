'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminHeader from '@/components/AdminHeader'

export default function AdminRidersPage() {
  const router = useRouter()
  const [riders, setRiders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRiders()
  }, [])

  const fetchRiders = async () => {
    try {
      const res = await fetch('/api/admin/riders')
      const data = await res.json()
      if (res.ok) {
        setRiders(data.riders || [])
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (userId: string, action: string) => {
    if (!confirm(`${action} this rider?`)) return
    
    try {
      const res = await fetch('/api/admin/riders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action })
      })
      
      const data = await res.json()
      if (res.ok) {
        alert(data.message || `Rider ${action.toLowerCase()}!`)
        fetchRiders()
      } else {
        alert(data.error)
      }
    } catch (error) {
      alert('Error processing request')
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
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '5px' }}>
              ️ Manage Riders
            </h1>
            <p style={{ fontSize: '16px', color: 'gray' }}>
              Approve rider applications and verify documents
            </p>
          </div>
          <button
            onClick={() => router.push('/admin')}
            style={{
              padding: '10px 20px',
              backgroundColor: 'gray',
              color: 'white',
              border: '2px solid black',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            ← Back
          </button>
        </div>

        {riders.length === 0 ? (
          <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', border: '3px solid black', textAlign: 'center' }}>
            <p style={{ fontSize: '18px', color: 'gray' }}>No riders found.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '15px' }}>
            {riders.map((rider) => {
              const riderStatus = rider.riderProfile?.status || 'PENDING'
              const isPending = riderStatus === 'PENDING' || riderStatus === 'ONLINE'
              
              return (
                <div key={rider.id} style={{ 
                  backgroundColor: 'white', 
                  padding: '20px', 
                  borderRadius: '12px', 
                  border: '3px solid black',
                  boxShadow: isPending ? '4px 4px 0px black' : 'none'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                        <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>{rider.name}</h3>
                        <span style={{ 
                          padding: '4px 12px', 
                          borderRadius: '20px', 
                          fontSize: '12px', 
                          fontWeight: 'bold',
                          backgroundColor: riderStatus === 'APPROVED' ? '#e8f5e9' : riderStatus === 'REJECTED' ? '#fee' : '#fff3cd',
                          color: riderStatus === 'APPROVED' ? 'green' : riderStatus === 'REJECTED' ? 'red' : '#856404',
                          border: `1px solid ${riderStatus === 'APPROVED' ? 'green' : riderStatus === 'REJECTED' ? 'red' : '#ffc107'}`
                        }}>
                          {riderStatus}
                        </span>
                      </div>
                      <p style={{ margin: '5px 0', color: 'gray' }}>{rider.email}</p>
                      <p style={{ margin: '5px 0', color: 'gray' }}>Phone: {rider.phone || 'N/A'}</p>
                      
                      {rider.riderProfile && (
                        <div style={{ marginTop: '15px', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                          {rider.riderProfile.licenseUrl && (
                            <a href={rider.riderProfile.licenseUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'blue', textDecoration: 'underline', fontSize: '14px' }}>📄 View License</a>
                          )}
                          {rider.riderProfile.orCrUrl && (
                            <a href={rider.riderProfile.orCrUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'blue', textDecoration: 'underline', fontSize: '14px' }}>📄 View OR/CR</a>
                          )}
                          {rider.riderProfile.authLetterUrl && (
                            <a href={rider.riderProfile.authLetterUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'blue', textDecoration: 'underline', fontSize: '14px' }}> View Auth Letter</a>
                          )}
                          {!rider.riderProfile.licenseUrl && !rider.riderProfile.orCrUrl && !rider.riderProfile.authLetterUrl && (
                            <p style={{ color: 'gray', fontSize: '14px' }}>No documents uploaded yet</p>
                          )}
                        </div>
                      )}
                    </div>

                    {isPending && (
                      <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
                        <button
                          onClick={() => handleAction(rider.id, 'APPROVE')}
                          style={{
                            padding: '10px 20px',
                            backgroundColor: 'green',
                            color: 'white',
                            border: '2px solid black',
                            borderRadius: '8px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            minWidth: '120px'
                          }}
                        >
                          ✅ Approve
                        </button>
                        <button
                          onClick={() => handleAction(rider.id, 'REJECT')}
                          style={{
                            padding: '10px 20px',
                            backgroundColor: 'red',
                            color: 'white',
                            border: '2px solid black',
                            borderRadius: '8px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            minWidth: '120px'
                          }}
                        >
                          ❌ Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}