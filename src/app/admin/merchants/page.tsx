'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminHeader from '@/components/AdminHeader'

export default function AdminMerchantsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [applications, setApplications] = useState<any[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    checkAuth()
    fetchApplications()
  }, [router])

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me')
      const data = await res.json()
      if (!data.user || data.user.role !== 'ADMIN') {
        router.push('/')
      }
    } catch (error) {
      router.push('/')
    }
  }

  const fetchApplications = async () => {
    try {
      const res = await fetch('/api/admin/merchants')
      const data = await res.json()
      if (res.ok) {
        setApplications(data.applications || [])
      } else {
        setError(data.error)
      }
    } catch (error) {
      setError('Failed to load applications')
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (id: string, action: string) => {
    if (!confirm(`Are you sure you want to ${action.toLowerCase()} this application?`)) return

    try {
      const res = await fetch('/api/admin/merchants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId: id, action })
      })

      const data = await res.json()
      if (res.ok) {
        alert(data.message)
        fetchApplications()
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
               Merchant Applications
            </h1>
            <p style={{ fontSize: '16px', color: 'gray' }}>
              Review and approve new store partners
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

        {error && (
          <div style={{ backgroundColor: '#fee', padding: '15px', borderRadius: '8px', border: '2px solid red', marginBottom: '20px', color: 'red' }}>
            {error}
          </div>
        )}

        {applications.length === 0 ? (
          <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', border: '3px solid black', textAlign: 'center' }}>
            <p style={{ fontSize: '18px', color: 'gray' }}>No applications yet.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '15px' }}>
            {applications.map((app) => (
              <div key={app.id} style={{ 
                backgroundColor: 'white', 
                padding: '20px', 
                borderRadius: '12px', 
                border: '3px solid black',
                boxShadow: app.status === 'PENDING' ? '4px 4px 0px black' : 'none',
                opacity: app.status !== 'PENDING' ? 0.7 : 1
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '15px' }}>
                  <div style={{ flex: 1, minWidth: '250px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                      <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>{app.storeName}</h3>
                      <span style={{ 
                        padding: '4px 12px', 
                        borderRadius: '20px', 
                        fontSize: '12px', 
                        fontWeight: 'bold',
                        backgroundColor: app.status === 'APPROVED' ? '#e8f5e9' : app.status === 'REJECTED' ? '#fee' : '#fff3cd',
                        color: app.status === 'APPROVED' ? 'green' : app.status === 'REJECTED' ? 'red' : '#856404',
                        border: `1px solid ${app.status === 'APPROVED' ? 'green' : app.status === 'REJECTED' ? 'red' : '#ffc107'}`
                      }}>
                        {app.status}
                      </span>
                    </div>
                    <p style={{ margin: '5px 0', color: 'gray' }}>
                      <strong>Business Type:</strong> {app.businessType}
                    </p>
                    <p style={{ margin: '5px 0', color: 'gray' }}>
                      <strong>Contact:</strong> {app.contactNumber}
                    </p>
                    <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#f0f8ff', borderRadius: '8px' }}>
                      <p style={{ margin: '2px 0', fontSize: '14px' }}><strong>Applicant:</strong> {app.user?.name || 'Unknown'}</p>
                      <p style={{ margin: '2px 0', fontSize: '14px' }}><strong>Email:</strong> {app.user?.email || 'Unknown'}</p>
                    </div>
                    
                    <div style={{ marginTop: '15px', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                      {app.birUrl && (
                        <a href={app.birUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'blue', textDecoration: 'underline', fontSize: '14px' }}>📄 View BIR</a>
                      )}
                      {app.businessPermitUrl && (
                        <a href={app.businessPermitUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'blue', textDecoration: 'underline', fontSize: '14px' }}> View Business Permit</a>
                      )}
                      {!app.birUrl && !app.businessPermitUrl && (
                        <p style={{ color: 'gray', fontSize: '14px' }}>No documents uploaded</p>
                      )}
                    </div>
                  </div>

                  {app.status === 'PENDING' && (
                    <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
                      <button
                        onClick={() => handleAction(app.id, 'APPROVE')}
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
                        onClick={() => handleAction(app.id, 'REJECT')}
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
            ))}
          </div>
        )}
      </div>
    </main>
  )
}