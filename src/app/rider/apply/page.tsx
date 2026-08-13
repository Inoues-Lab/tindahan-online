'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'

export default function RiderApplyPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  // 🔑 NEW: Vehicle info
  const [vehicleType, setVehicleType] = useState('')
  const [plateNumber, setPlateNumber] = useState('')

  const [files, setFiles] = useState({
    license: null as File | null,
    orCr: null as File | null,
    auth: null as File | null
  })
  const [previews, setPreviews] = useState({
    license: '',
    orCr: '',
    auth: ''
  })

  const licenseRef = useRef<HTMLInputElement>(null)
  const orCrRef = useRef<HTMLInputElement>(null)
  const authRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (!data.user) router.push('/login')
        else if (data.user.role !== 'RIDER') router.push('/')
        else setUser(data.user)
      })
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false))
  }, [router])

  const handleFile = (type: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFiles(prev => ({ ...prev, [type]: file }))
      const reader = new FileReader()
      reader.onloadend = () => setPreviews(prev => ({ ...prev, [type]: reader.result as string }))
      reader.readAsDataURL(file)
    }
  }

  const upload = async (file: File | null) => {
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
      const licenseUrl = await upload(files.license)
      const orCrUrl = await upload(files.orCr)
      const authUrl = await upload(files.auth)

      if (!licenseUrl) {
        alert('Driving License is required!')
        setSubmitting(false)
        return
      }

      const res = await fetch('/api/rider/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          licenseUrl,
          orCrUrl,
          authLetterUrl: authUrl,
          vehicleType,
          plateNumber
        })
      })

      const data = await res.json()
      if (res.ok) {
        setMessage('✅ Requirements submitted! Wait for admin approval.')
      } else {
        setMessage(`❌ ${data.error}`)
      }
    } catch (error) {
      setMessage('❌ Error submitting requirements')
    } finally {
      setSubmitting(false)
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: '2px solid black',
    boxSizing: 'border-box',
    fontSize: '16px',
    fontWeight: 'bold',
    backgroundColor: 'white'
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
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', textAlign: 'center', marginBottom: '20px' }}>🏍️ Rider Requirements</h1>

          {message && (
            <div style={{
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '20px',
              backgroundColor: message.includes('✅') ? '#e8f5e9' : '#fee',
              border: `2px solid ${message.includes('✅') ? '#4caf50' : 'red'}`,
              color: message.includes('✅') ? '#2e7d32' : 'red',
              fontWeight: 'bold'
            }}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* 🔑 NEW: Vehicle Info Section */}
            <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#e8f5e9', borderRadius: '8px', border: '2px solid #4caf50' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px' }}>🏍️ Vehicle Information</h2>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Vehicle Type</label>
                <input
                  type="text"
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  placeholder="e.g., Motorcycle - Honda Click"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Plate Number</label>
                <input
                  type="text"
                  value={plateNumber}
                  onChange={(e) => setPlateNumber(e.target.value)}
                  placeholder="e.g., ABC 1234"
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Driving License (Required) *</label>
              <input
                ref={licenseRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleFile('license', e)}
                style={{ display: 'none' }}
              />
              <button
                type="button"
                onClick={() => licenseRef.current?.click()}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px dashed black',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  backgroundColor: files.license ? '#e8f5e9' : '#f0f0f0',
                  fontWeight: 'bold'
                }}
              >
                {files.license ? '✅ License Uploaded' : '📤 Upload License'}
              </button>
              {previews.license && (
                <img src={previews.license} alt="License" style={{ width: '100%', marginTop: '10px', borderRadius: '8px', border: '2px solid black' }} />
              )}
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Motorcycle OR/CR (If Owner)</label>
              <input
                ref={orCrRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleFile('orCr', e)}
                style={{ display: 'none' }}
              />
              <button
                type="button"
                onClick={() => orCrRef.current?.click()}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px dashed black',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  backgroundColor: files.orCr ? '#e8f5e9' : '#f0f0f0',
                  fontWeight: 'bold'
                }}
              >
                {files.orCr ? '✅ OR/CR Uploaded' : '📤 Upload OR/CR'}
              </button>
              {previews.orCr && (
                <img src={previews.orCr} alt="OR/CR" style={{ width: '100%', marginTop: '10px', borderRadius: '8px', border: '2px solid black' }} />
              )}
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Authorization Letter (If NOT Owner)</label>
              <input
                ref={authRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleFile('auth', e)}
                style={{ display: 'none' }}
              />
              <button
                type="button"
                onClick={() => authRef.current?.click()}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px dashed black',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  backgroundColor: files.auth ? '#e8f5e9' : '#f0f0f0',
                  fontWeight: 'bold'
                }}
              >
                {files.auth ? '✅ Letter Uploaded' : '📤 Upload Authorization Letter'}
              </button>
              {previews.auth && (
                <img src={previews.auth} alt="Auth Letter" style={{ width: '100%', marginTop: '10px', borderRadius: '8px', border: '2px solid black' }} />
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={{
                width: '100%',
                padding: '15px',
                backgroundColor: submitting ? 'gray' : '#4caf50',
                color: 'white',
                border: '2px solid black',
                borderRadius: '8px',
                fontWeight: 'bold',
                fontSize: '18px',
                cursor: submitting ? 'not-allowed' : 'pointer',
                boxShadow: '4px 4px 0px black'
              }}
            >
              {submitting ? 'Submitting...' : '🏍️ Submit Requirements'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}