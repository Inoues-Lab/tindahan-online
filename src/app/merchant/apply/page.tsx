'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import MerchantHeader from '@/components/MerchantHeader'

export default function MerchantApplyPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [application, setApplication] = useState<any>(null)
  const [formData, setFormData] = useState({ storeName: '', businessType: 'Grocery' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    checkApplication()
  }, [])

  const checkApplication = async () => {
    try {
      const res = await fetch('/api/merchant/apply/check')
      const data = await res.json()
      if (data.hasApplication) {
        setApplication(data)
      }
    } catch (err) {
      console.error('Error checking application:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const res = await fetch('/api/merchant/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Application failed')
        setSubmitting(false)
        return
      }

      // Refresh to show the pending status
      checkApplication()
    } catch (err) {
      setError('An error occurred. Please try again.')
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div style={{ padding: '50px', textAlign: 'center' }}>Checking application status...</div>
  }

  // 1. ALREADY APPLIED: Show Status (No Form)
  if (application) {
    return (
      <main style={{ minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
        <MerchantHeader />
        <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px' }}>
          <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', border: '3px solid black', boxShadow: '4px 4px 0px black', textAlign: 'center' }}>
            
            {application.status === 'PENDING' && (
              <>
                <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '20px' }}>⏳ Waiting for Approval</h1>
                <p style={{ fontSize: '16px', color: 'gray', marginBottom: '20px' }}>
                  Your application for <strong>{application.storeName}</strong> is currently under review by the admin.
                </p>
                <div style={{ backgroundColor: '#fff3cd', padding: '15px', borderRadius: '8px', marginBottom: '20px', fontWeight: 'bold', color: '#856404' }}>
                  Current Status: PENDING
                </div>
              </>
            )}

            {application.status === 'APPROVED' && (
              <>
                <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '20px', color: 'green' }}>✅ Application Approved!</h1>
                <p style={{ fontSize: '16px', color: 'gray', marginBottom: '20px' }}>
                  Congratulations! You can now start managing your store.
                </p>
              </>
            )}

            {application.status === 'REJECTED' && (
              <>
                <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '20px', color: 'red' }}>❌ Application Not Approved</h1>
                <p style={{ fontSize: '16px', color: 'gray', marginBottom: '20px' }}>
                  Your application was not approved. Please contact admin for more details.
                </p>
              </>
            )}

            <button
              onClick={() => router.push(application.status === 'APPROVED' ? '/merchant/dashboard' : '/')}
              style={{
                padding: '15px 30px',
                backgroundColor: application.status === 'APPROVED' ? '#4caf50' : '#2196f3',
                color: 'white',
                border: '2px solid black',
                borderRadius: '8px',
                fontWeight: 'bold',
                fontSize: '16px',
                cursor: 'pointer',
                boxShadow: '3px 3px 0px black'
              }}
            >
              {application.status === 'APPROVED' ? 'Go to Dashboard' : 'Go to Home'}
            </button>
          </div>
        </div>
      </main>
    )
  }

  // 2. NO APPLICATION YET: Show Form
  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
      <MerchantHeader />
      <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px' }}>
        <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', border: '3px solid black', boxShadow: '4px 4px 0px black' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '10px', textAlign: 'center' }}>Merchant Application</h1>
          <p style={{ textAlign: 'center', color: 'gray', marginBottom: '30px' }}>Fill out the form to become a partner merchant</p>

          {error && (
            <div style={{ backgroundColor: '#fee', border: '2px solid red', padding: '15px', borderRadius: '8px', marginBottom: '20px', color: 'red' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Store Name</label>
              <input
                type="text"
                value={formData.storeName}
                onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                placeholder="Your Store Name"
                required
                style={{ width: '100%', padding: '12px', border: '2px solid black', borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Business Type</label>
              <select
                value={formData.businessType}
                onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                style={{ width: '100%', padding: '12px', border: '2px solid black', borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box' }}
              >
                <option value="Grocery">Grocery</option>
                <option value="Convenience Store">Convenience Store</option>
                <option value="Supermarket">Supermarket</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={{ 
                width: '100%', 
                padding: '15px', 
                backgroundColor: submitting ? 'gray' : '#ff9800', 
                color: 'white', 
                border: '2px solid black', 
                borderRadius: '8px', 
                fontWeight: 'bold', 
                fontSize: '18px', 
                cursor: submitting ? 'not-allowed' : 'pointer',
                boxShadow: '4px 4px 0px black'
              }}
            >
              {submitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}