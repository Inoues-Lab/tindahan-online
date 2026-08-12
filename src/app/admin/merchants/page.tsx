'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminHeader from '@/components/AdminHeader'

export default function AdminMerchantsPage() {
  const router = useRouter()
  const [merchants, setMerchants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMerchants()
  }, [])

  const fetchMerchants = async () => {
    try {
      const res = await fetch('/api/admin/merchants')
      const data = await res.json()
      if (res.ok) {
        setMerchants(data.merchants || [])
      }
    } catch (error) {
      console.error('Error fetching merchants:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (merchantId: string) => {
    try {
      const res = await fetch('/api/admin/merchants/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ merchantId })
      })
      if (res.ok) {
        fetchMerchants()
      }
    } catch (error) {
      console.error('Error approving merchant:', error)
    }
  }

  const handleReject = async (merchantId: string) => {
    try {
      const res = await fetch('/api/admin/merchants/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ merchantId })
      })
      if (res.ok) {
        fetchMerchants()
      }
    } catch (error) {
      console.error('Error rejecting merchant:', error)
    }
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
      <AdminHeader />
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '30px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '5px' }}>Merchant Applications</h1>
            <p style={{ fontSize: '16px', color: 'gray' }}>Review and approve new store partners</p>
          </div>
          <button
            onClick={() => router.push('/admin/dashboard')}
            style={{ padding: '10px 20px', backgroundColor: 'white', color: 'black', border: '2px solid black', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            ← Back
          </button>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : merchants.length === 0 ? (
          <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', border: '3px solid black', textAlign: 'center' }}>
            <p style={{ fontSize: '18px', color: 'gray' }}>No merchant applications yet</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '20px' }}>
            {merchants.map((merchant) => (
              <div key={merchant.id} style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', border: '3px solid black' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px' }}>
                  <div>
                    <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '5px' }}>{merchant.storeName}</h2>
                    <span style={{ 
                      display: 'inline-block',
                      padding: '5px 15px', 
                      backgroundColor: merchant.status === 'PENDING' ? '#fff3cd' : merchant.status === 'APPROVED' ? '#d4edda' : '#f8d7da',
                      color: merchant.status === 'PENDING' ? '#856404' : merchant.status === 'APPROVED' ? '#155724' : '#721c24',
                      borderRadius: '20px',
                      fontWeight: 'bold',
                      fontSize: '14px'
                    }}>
                      {merchant.status}
                    </span>
                  </div>
                  {merchant.status === 'PENDING' && (
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        onClick={() => handleApprove(merchant.id)}
                        style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: '2px solid black', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                      >
                        ✓ Approve
                      </button>
                      <button
                        onClick={() => handleReject(merchant.id)}
                        style={{ padding: '10px 20px', backgroundColor: '#dc3545', color: 'white', border: '2px solid black', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                      >
                        ✗ Reject
                      </button>
                    </div>
                  )}
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>Business Type:</p>
                  <p>{merchant.businessType || 'N/A'}</p>
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>Contact:</p>
                  <p>{merchant.user?.name || 'N/A'}</p>
                  <p>{merchant.user?.email || 'N/A'}</p>
                </div>

                {merchant.documents && merchant.documents.length > 0 ? (
                  <div>
                    <p style={{ fontWeight: 'bold', marginBottom: '10px' }}>Documents:</p>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      {merchant.documents.map((doc: any, idx: number) => (
                        <a key={idx} href={doc.url} target="_blank" rel="noopener noreferrer" style={{ padding: '10px 15px', backgroundColor: '#f0f0f0', borderRadius: '8px', textDecoration: 'none', color: 'black' }}>
                          View Document {idx + 1}
                        </a>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p style={{ color: 'gray' }}>No documents uploaded</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}