'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'

export default function MerchantApplyPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  
  const [formData, setFormData] = useState({
    storeName: '',
    businessType: 'Sari-Sari Store',
    contactNumber: ''
  })
  
  const [files, setFiles] = useState({
    bir: null as File | null,
    permit: null as File | null
  })
  
  const [previews, setPreviews] = useState({ bir: '', permit: '' })
  const birInputRef = useRef<HTMLInputElement>(null)
  const permitInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (!data.user) router.push('/login')
        else {
          setUser(data.user)
          setFormData(prev => ({ ...prev, contactNumber: data.user.phone || '' }))
        }
      })
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false))
  }, [router])

  const handleFileChange = (type: 'bir' | 'permit', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFiles(prev => ({ ...prev, [type]: file }))
      const reader = new FileReader()
      reader.onloadend = () => setPreviews(prev => ({ ...prev, [type]: reader.result as string }))
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
      const birUrl = await uploadFile(files.bir)
      const permitUrl = await uploadFile(files.permit)

      const res = await fetch('/api/merchant/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          birUrl,
          businessPermitUrl: permitUrl
        })
      })
      
      const data = await res.json()
      if (res.ok) {
        setMessage('✅ Application submitted! Wait for admin approval.')
        setFormData({ storeName: '', businessType: 'Sari-Sari Store', contactNumber: '' })
        setFiles({ bir: null, permit: null })
        setPreviews({ bir: '', permit: '' })
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

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
      <Header />
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', border: '3px solid black', boxShadow: '4px 4px 0px black' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '10px', textAlign: 'center' }}>🏪 Become a Partner Merchant</h1>
          <p style={{ textAlign: 'center', color: 'gray', marginBottom: '30px' }}>Join Tindahan Online and sell your products!</p>
          
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
                style={{ width: '100%', padding: '12px', border: '2px solid black', borderRadius: '8px', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Business Type *</label>
              <select
                value={formData.businessType}
                onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                style={{ width: '100%', padding: '12px', border: '2px solid black', borderRadius: '8px', boxSizing: 'border-box' }}
              >
                <option>Sari-Sari Store</option>
                <option>Bakery</option>
                <option>Hardware Store</option>
                <option>Pharmacy</option>
                <option>Restaurant</option>
                <option>Others</option>
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
                style={{ width: '100%', padding: '12px', border: '2px solid black', borderRadius: '8px', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>📄 BIR Registration (Image)</label>
              <input
                ref={birInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange('bir', e)}
                style={{ display: 'none' }}
              />
              <button
                type="button"
                onClick={() => birInputRef.current?.click()}
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  backgroundColor: files.bir ? '#e8f5e9' : '#f0f0f0', 
                  border: '2px dashed black', 
                  borderRadius: '8px', 
                  cursor: 'pointer', 
                  fontWeight: 'bold' 
                }}
              >
                {files.bir ? '✅ BIR Uploaded' : 'Upload BIR Document'}
              </button>
              {previews.bir && (
                <img src={previews.bir} alt="BIR" style={{ width: '100%', marginTop: '10px', borderRadius: '8px', border: '2px solid black' }} />
              )}
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}> Business Permit (Image)</label>
              <input
                ref={permitInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange('permit', e)}
                style={{ display: 'none' }}
              />
              <button
                type="button"
                onClick={() => permitInputRef.current?.click()}
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  backgroundColor: files.permit ? '#e8f5e9' : '#f0f0f0', 
                  border: '2px dashed black', 
                  borderRadius: '8px', 
                  cursor: 'pointer', 
                  fontWeight: 'bold' 
                }}
              >
                {files.permit ? '✅ Permit Uploaded' : 'Upload Business Permit'}
              </button>
              {previews.permit && (
                <img src={previews.permit} alt="Permit" style={{ width: '100%', marginTop: '10px', borderRadius: '8px', border: '2px solid black' }} />
              )}
            </div>

            <div style={{ backgroundColor: '#f0f8ff', padding: '15px', borderRadius: '8px', border: '2px solid #b0c4de', marginBottom: '20px' }}>
              <p style={{ fontSize: '14px', color: '#004080', margin: 0 }}>
                <strong>Note:</strong> By applying, you agree to a <strong>20% commission fee</strong> on all sales.
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={{
                width: '100%',
                padding: '15px',
                backgroundColor: submitting ? 'gray' : 'blue',
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