'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Header from '@/components/Header'

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!token) {
      setError('Invalid reset link. Please request a new one.')
    }
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword })
      })

      const data = await res.json()

      if (res.ok) {
        setMessage('Password reset successful! Redirecting to login...')
        setTimeout(() => router.push('/login'), 2000)
      } else {
        setError(data.error || 'Failed to reset password')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <main style={{ minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
        <Header />
        <div style={{ maxWidth: '500px', margin: '50px auto', padding: '20px' }}>
          <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', border: '3px solid black', boxShadow: '4px 4px 0px black', textAlign: 'center' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '20px', color: 'red' }}>
              Invalid Link
            </h1>
            <p style={{ marginBottom: '20px' }}>{error}</p>
            <button
              onClick={() => router.push('/forgot-password')}
              style={{ 
                padding: '15px 30px', 
                backgroundColor: '#2196f3', 
                color: 'white', 
                border: '2px solid black', 
                borderRadius: '8px', 
                fontWeight: 'bold', 
                cursor: 'pointer'
              }}
            >
              Request New Link
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
      <Header />
      <div style={{ maxWidth: '500px', margin: '50px auto', padding: '20px' }}>
        <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', border: '3px solid black', boxShadow: '4px 4px 0px black' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '10px', textAlign: 'center' }}>
            Reset Password
          </h1>
          <p style={{ textAlign: 'center', color: 'gray', marginBottom: '30px' }}>
            Enter your new password below
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

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                required
                style={{ width: '100%', padding: '12px', border: '2px solid black', borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
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
                backgroundColor: loading ? 'gray' : '#4caf50', 
                color: 'white', 
                border: '2px solid black', 
                borderRadius: '8px', 
                fontWeight: 'bold', 
                fontSize: '18px', 
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '4px 4px 0px black'
              }}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}