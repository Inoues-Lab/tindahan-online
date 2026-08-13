'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminHeader from '@/components/AdminHeader'

export default function AdminRidersPage() {
  const router = useRouter()
  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<any>(null)

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
      fetchApplications()
    } catch (error) {
      router.push('/')
    }
  }

  const fetchApplications = async () => {
    try {
      const res = await fetch('/api/admin/riders')
      const data = await res.json()
      if (res.ok) {
        setApplications(data.applications || [])
      }
    } catch (error) {
      console.error('Error fetching applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (profileId: string, status: string) => {
    if (status === 'REJECTED' && !confirm('Are you sure you want to reject this rider?')) return

    try {
      const res = await fetch('/api/admin/riders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ riderProfileId: profileId, status })
      })
      const data = await res.json()
      if (res.ok) {
        alert(data.message || 'Rider updated!')
        fetchApplications()
      } else {
        alert(data.error || 'Failed to update rider')
      }
    } catch (error) {
      alert('Network error')
    }
  }

  // 🔍 Find uploaded documents (checks multiple possible field names)
  const getDocuments = (app: any) => {
    const docs: { label: string; url: string }[] = []
    const candidates: [string[], string][] = [
      [['licenseUrl', 'drivingLicenseUrl', 'drivingLicense', 'license'], '🪪 Driving License'],
      [['orcrUrl', 'motorcycleOrcrUrl', 'orcr', 'motorcycleOrCr'], '🏍️ Motorcycle OR/CR'],
      [['authorizationUrl', 'authorizationLetterUrl', 'authorizationLetter', 'authorization'], '📄 Authorization Letter']
    ]
    for (const [keys, label] of candidates) {
      for (const key of keys) {
        if (app[key] && typeof app[key] === 'string' && app[key].startsWith('http')) {
          docs.push({ label, url: app[key] })
          break
        }
      }
    }
    return docs
  }

  const statusColors: any = {
    PENDING: '#ff9800',
    APPROVED: '#4caf50',
    REJECTED: '#dc3545'
  }

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
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '30px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '5px' }}>🏍️ Rider Applications</h1>
            <p style={{ fontSize: '16px', color: 'gray' }}>Review and approve new rider partners</p>
          </div>
          <button
            onClick={() => router.push('/admin')}
            style={{ padding: '12px 24px', backgroundColor: 'white', color: 'black', border: '2px solid black', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            ← Back
          </button>
        </div>

        {applications.length === 0 ? (
          <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', border: '3px solid black', textAlign: 'center' }}>
            <p style={{ fontSize: '18px', color: 'gray' }}>No rider applications yet.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '20px' }}>
            {applications.map((app) => (
              <div key={app.id} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '3px solid black', boxShadow: '4px 4px 0px black', opacity: app.status !== 'PENDING' ? 0.75 : 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>{app.user?.name}</h3>
                    <span style={{ padding: '5px 15px', backgroundColor: statusColors[app.status] || '#757575', color: 'white', borderRadius: '20px', fontWeight: 'bold', fontSize: '12px' }}>
                      {app.status}
                    </span>
                  </div>
                  {app.status === 'PENDING' && (
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        onClick={() => handleAction(app.id, 'APPROVED')}
                        style={{ padding: '10px 20px', backgroundColor: '#4caf50', color: 'white', border: '2px solid black', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '3px 3px 0px black' }}
                      >
                        ✅ Approve
                      </button>
                      <button
                        onClick={() => handleAction(app.id, 'REJECTED')}
                        style={{ padding: '10px 20px', backgroundColor: '#dc3545', color: 'white', border: '2px solid black', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '3px 3px 0px black' }}
                      >
                        ❌ Reject
                      </button>
                    </div>
                  )}
                </div>

                <p style={{ fontSize: '14px', color: 'gray', margin: '0 0 5px 0' }}>📧 {app.user?.email} | 📞 {app.user?.phone || 'N/A'}</p>
                <p style={{ fontSize: '14px', color: 'gray', margin: '0 0 15px 0' }}>🏍️ {app.vehicleType || 'N/A'} | 🔢 {app.plateNumber || 'N/A'}</p>

                {/* 🔑 VIEW DETAILS BUTTON */}
                <button
                  onClick={() => setSelected(app)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#2196f3',
                    color: 'white',
                    border: '2px solid black',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    boxShadow: '3px 3px 0px black'
                  }}
                >
                  👁️ View Details & Documents
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 🔑 DETAILS MODAL */}
      {selected && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', border: '3px solid black', maxWidth: '600px', width: '100%', maxHeight: '85vh', overflowY: 'auto', boxShadow: '8px 8px 0px black' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>🏍️ Rider Details</h2>
              <button
                onClick={() => setSelected(null)}
                style={{ padding: '8px 16px', backgroundColor: 'white', border: '2px solid black', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                ✕ Close
              </button>
            </div>

            <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '8px', border: '2px solid black', marginBottom: '20px' }}>
              <p style={{ margin: '0 0 8px 0' }}><strong>👤 Name:</strong> {selected.user?.name}</p>
              <p style={{ margin: '0 0 8px 0' }}><strong>📧 Email:</strong> {selected.user?.email}</p>
              <p style={{ margin: '0 0 8px 0' }}><strong>📞 Phone:</strong> {selected.user?.phone || 'N/A'}</p>
              <p style={{ margin: '0 0 8px 0' }}><strong>📍 Address:</strong> {selected.user?.address || 'N/A'}</p>
              <p style={{ margin: '0 0 8px 0' }}><strong>🏍️ Vehicle:</strong> {selected.vehicleType || 'N/A'}</p>
              <p style={{ margin: 0 }}><strong>🔢 Plate Number:</strong> {selected.plateNumber || 'N/A'}</p>
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px' }}>📄 Uploaded Documents</h3>
            {getDocuments(selected).length === 0 ? (
              <p style={{ color: 'gray', textAlign: 'center', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '2px dashed black' }}>
                No documents uploaded
              </p>
            ) : (
              <div style={{ display: 'grid', gap: '15px' }}>
                {getDocuments(selected).map((doc) => (
                  <div key={doc.label} style={{ border: '2px solid black', borderRadius: '8px', padding: '10px' }}>
                    <p style={{ fontWeight: 'bold', marginBottom: '10px' }}>{doc.label}</p>
                    <img src={doc.url} alt={doc.label} style={{ width: '100%', maxHeight: '250px', objectFit: 'contain', borderRadius: '8px', backgroundColor: '#f9f9f9' }} />
                    <a href={doc.url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginTop: '10px', color: '#2196f3', fontWeight: 'bold', fontSize: '14px' }}>
                      🔗 Open Full Image
                    </a>
                  </div>
                ))}
              </div>
            )}

            {selected.status === 'PENDING' && (
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button
                  onClick={() => { handleAction(selected.id, 'APPROVED'); setSelected(null) }}
                  style={{ flex: 1, padding: '15px', backgroundColor: '#4caf50', color: 'white', border: '2px solid black', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '3px 3px 0px black' }}
                >
                  ✅ Approve
                </button>
                <button
                  onClick={() => { handleAction(selected.id, 'REJECTED'); setSelected(null) }}
                  style={{ flex: 1, padding: '15px', backgroundColor: '#dc3545', color: 'white', border: '2px solid black', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '3px 3px 0px black' }}
                >
                  ❌ Reject
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  )
}