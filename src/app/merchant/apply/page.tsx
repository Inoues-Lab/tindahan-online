'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'

export default function MerchantApplyPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [existingApplication, setExistingApplication] = useState<any>(null)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  
  const [formData, setFormData] = useState({
    storeName: '',
    businessType: 'Sari-Sari Store',
    contactNumber: '',
    birUrl: '',
    businessPermitUrl: ''
  })
  
  const [birFile, setBirFile] = useState<File | null>(null)
  const [birPreview, setBirPreview] = useState('')
  const [permitFile, setPermitFile] = useState<File | null>(null)
  const [permitPreview, setPermitPreview] = useState('')
  
  const birInputRef = useRef<HTMLInputElement>(null)
  const permitInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    checkAuth()
    // Load saved form data from localStorage
    const savedData = localStorage.getItem('merchantApplicationDraft')
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData)
        setFormData(prev => ({ ...prev, ...parsed }))
      } catch (e) {
        console.error('Failed to load saved data')
      }
    }
  }, [router])

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me')
      const data = await res.json()
      
      if (!data.user) {
        router.push('/login')
        return
      }
      
      setUser(data.user)
      
      // Check if they already have an application
      const appRes = await fetch('/api/merchant/apply/check')
      const appData = await appRes.json()
      if (appRes.ok && appData.application) {
        setExistingApplication(appData.application)
        if (appData.application.status === 'APPROVED') {
          router.push('/merchant/dashboard')
          return
        }
      }
    } catch (error) {
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    if (formData.storeName || formData.contactNumber) {
      localStorage.setItem('merchantApplicationDraft', JSON.stringify(formData))
    }
  }, [formData])

  const handleBirChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setBirFile(file)
      const reader = new FileReader()
      reader.onloadend = () => setBirPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handlePermitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPermitFile(file)
      const reader = new FileReader()
      reader.onloadend = () => setPermitPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const uploadFile = async (file: File | null): Promise<string | null> => {
    if (!file) return null
    const formDataUpload = new FormData()
    formDataUpload.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: formDataUpload })
    const data = await res.json()
    return res.ok ? data.url : null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage('')

    try {
      let birUrl = formData.birUrl
      let businessPermitUrl = formData.businessPermitUrl
      
      if (birFile) {
        birUrl = await uploadFile(birFile) || ''
      }
      if (permitFile) {
        businessPermitUrl = await uploadFile(permitFile) || ''
      }

      const res = await fetch('/api/merchant/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          birUrl,
          businessPermitUrl
        })
      })

      const data = await res.json()
      if (res.ok) {
        setMessage('✅ Application submitted successfully! You will be notified once approved.')
        localStorage.removeItem('merchantApplicationDraft')
        setFormData({
          storeName: '',
          businessType: 'Sari-Sari Store',
          contactNumber: '',
          birUrl: '',
          businessPermitUrl: ''
        })
        setBirFile(null)
        setPermitFile(null)
        setBirPreview('')
        setPermitPreview('')
      } else {
        setMessage(`❌ ${data.error}`)
      }
    } catch (error) {
      setMessage('❌ Error submitting application')
    } finally {
      setSubmitting(false)
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

  // Show existing application status
  if (existingApplication && existingApplication.status !== 'PENDING') {
    return (
      <main style={{ minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
        <Header />
        <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px', textAlign: 'center' }}>
          <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', border: '3px solid black', boxShadow: '4px 4px 0px black' }}>
            <div style={{ fontSize: '60px', marginBottom: '20px' }}>
              {existingApplication.status === 'APPROVED' ? '✅' : '❌'}
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px' }}>
              Application {existingApplication.status}
            </h1>
            <p style={{ color: 'gray', marginBottom: '20px' }}>
              {existingApplication.status === 'APPROVED' 
                ? 'Congratulations! You are now a partner merchant.' 
                : 'Unfortunately, your application was not approved at this time.'}
            </p>
            <button
              onClick={() => router.push(existingApplication.status === 'APPROVED' ? '/merchant/dashboard' : '/')}
              style={{
                padding: '12px 24px',
                backgroundColor: existingApplication.status === 'APPROVED' ? 'green' : 'blue',
                color: 'white',
                border: '2px solid black',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              {existingApplication.status === 'APPROVED' ? 'Go to Dashboard' : 'Go Home'}
            </button>
          </div>
        </div>
      </main>
    )
  }

  // Show pending application message
  if (existingApplication && existingApplication.status === 'PENDING') {
    return (
      <main style={{ minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
        <Header />
        <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px', textAlign: 'center' }}>
          <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', border: '3px solid #ffc107', boxShadow: '4px 4px 0px black' }}>
            <div style={{ fontSize: '60px', marginBottom: '20px' }}></div>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px' }}>Application Under Review</h1>
            <p style={{ color: 'gray', marginBottom: '20px' }}>
              Your application for <strong>{existingApplication.storeName}</strong> is pending approval.
            </p>
            <p style={{ color: 'gray', fontSize: '14px', marginBottom: '20px' }}>
              You will receive an email notification once your account is approved.
            </p>
            <button
              onClick={() => router.push('/')}
              style={{
                padding: '12px 24px',
                backgroundColor: '#ffc107',
                color: 'black',
                border: '2px solid black',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Go Home
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
      <Header />
      <div style={{ maxWidth: '700px', margin: '40px auto', padding: '20px' }}>
        <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', border: '3px solid black', boxShadow: '4px 4px 0px black' }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <div style={{ fontSize: '48px', marginBottom: '10px' }}>🏪</div>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '10px' }}>
              Become a Partner Merchant
            </h1>
            <p style={{ color: 'gray' }}>
              Join Tindahan Online and sell your products!
            </p>
          </div>

          {message && (
            <div style={{ 
              padding: '15px', 
              borderRadius: '8px', 
              marginBottom: '20px', 
              backgroundColor: message.includes('✅') ? '#e8f5e9' : '#fee',
              border: `2px solid ${message.includes('✅') ? 'green' : 'red'}`,
              color: message.includes('✅') ? 'green' : 'red',
              fontWeight: 'bold'
            }}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Store Name *</label>
              <input
                type="text"
                value={formData.storeName}
                onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                placeholder="e.g., Aling Nena's Sari-Sari Store"
                required
                style={{ width: '100%', padding: '12px', border: '2px solid black', borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Business Type *</label>
              <select
                value={formData.businessType}
                onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                required
                style={{ width: '100%', padding: '12px', border: '2px solid black', borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box' }}
              >
                <option value="Sari-Sari Store">Sari-Sari Store</option>
                <option value="Grocery">Grocery</option>
                <option value="Convenience Store">Convenience Store</option>
                <option value="Supermarket">Supermarket</option>
                <option value="Specialty Store">Specialty Store</option>
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Contact Number *</label>
              <input
                type="tel"
                value={formData.contactNumber}
                onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                placeholder="09XXXXXXXXX"
                required
                style={{ width: '100%', padding: '12px', border: '2px solid black', borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}> BIR Registration (Image)</label>
              <input
                ref={birInputRef}
                type="file"
                accept="image/*"
                onChange={handleBirChange}
                style={{ display: 'none' }}
              />
              <button
                type="button"
                onClick={() => birInputRef.current?.click()}
                style={{ width: '100%', padding: '12px', backgroundColor: birFile ? '#e8f5e9' : '#f0f0f0', border: '2px dashed black', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                {birFile ? '✅ BIR Uploaded' : '📤 Upload BIR Document'}
              </button>
              {birPreview && (
                <img src={birPreview} alt="BIR Preview" style={{ width: '100%', maxHeight: '200px', objectFit: 'contain', marginTop: '10px', borderRadius: '8px', border: '2px solid black' }} />
              )}
            </div>

            <div style={{ marginBottom: '30px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>📄 Business Permit (Image)</label>
              <input
                ref={permitInputRef}
                type="file"
                accept="image/*"
                onChange={handlePermitChange}
                style={{ display: 'none' }}
              />
              <button
                type="button"
                onClick={() => permitInputRef.current?.click()}
                style={{ width: '100%', padding: '12px', backgroundColor: permitFile ? '#e8f5e9' : '#f0f0f0', border: '2px dashed black', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                {permitFile ? '✅ Permit Uploaded' : '📤 Upload Business Permit'}
              </button>
              {permitPreview && (
                <img src={permitPreview} alt="Permit Preview" style={{ width: '100%', maxHeight: '200px', objectFit: 'contain', marginTop: '10px', borderRadius: '8px', border: '2px solid black' }} />
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={{
                width: '100%',
                padding: '15px',
                backgroundColor: submitting ? 'gray' : 'green',
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

          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <button
              onClick={() => router.push('/')}
              style={{
                padding: '10px 20px',
                backgroundColor: 'transparent',
                color: 'blue',
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}