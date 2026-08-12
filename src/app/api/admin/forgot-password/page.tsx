'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await res.json()

      if (res.ok) {
        setSent(true)
        setMessage('If an account exists, a reset link has been sent to your email.')
      } else {
        setError(data.error || 'Failed to send reset link')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
      <Header />
      <div style={{ maxWidth: '500px', margin: '50px auto', padding: '20px' }}>
        <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', border: '3px solid black', boxShadow: '4px 4px 0px black' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '10px', textAlign: 'center' }}>
            Forgot Password?
          </h1>
          <p style={{ textAlign: 'center', color: 'gray', marginBottom: '30px' }}>
            No worries! Enter your email and we'll send you a reset link.
          </p>

          {message && (
            <div style={{ backgroundColor: '#d4edda', border: '2px solid #28a745', padding: '15px', borderRadius: '8px', marginBottom: '20px', color: '#155724' }}>
              {message}
            </div>
          )}

          {error && (
            <div style={{ backgroundColor: '#f8d7da', border: '2px solid #dc3545', padding: '15px', borderRadius: '8px', marginBottom: '20px', color: '#721c24' }}>
              {error}
            </div>
          )}

          {!sent ? (
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  style={{ width: '100%', padding: '12px', border: '2px solid black', borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box' }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{ 
                  width: '100%', 
                  padding: '15px', 
                  backgroundColor: loading ? 'gray' : '#2196f3', 
                  color: 'white', 
                  border: '2px solid black', 
                  borderRadius: '8px', 
                  fontWeight: 'bold', 
                  fontSize: '18px', 
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '4px 4px 0px black'
                }}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <p style={{ marginBottom: '20px', fontSize: '16px' }}>
                Check your email for the reset link!
              </p>
              <button
                onClick={() => router.push('/login')}
                style={{ 
                  padding: '15px 30px', 
                  backgroundColor: '#4caf50', 
                  color: 'white', 
                  border: '2px solid black', 
                  borderRadius: '8px', 
                  fontWeight: 'bold', 
                  fontSize: '16px', 
                  cursor: 'pointer',
                  boxShadow: '3px 3px 0px black'
                }}
              >
                Back to Login
              </button>
            </div>
          )}

          <div style={{ marginTop: '30px', textAlign: 'center' }}>
            <a href="/login" style={{ color: '#2196f3', fontWeight: 'bold' }}>
              ← Back to Login
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}