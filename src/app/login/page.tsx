// src/app/login/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'

export default function LoginPage() {
  const router = useRouter()
  const [isRegister, setIsRegister] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login'
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        // Simply redirect to home - Header will show correct nav based on cookies
        window.location.href = '/'
      } else {
        setError(data.error || 'Login failed. Please try again.')
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('Failed to connect to server. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: 'white' }}>
      <Header />
      <div style={{ maxWidth: '450px', margin: '0 auto', padding: '40px 20px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '10px', textAlign: 'center' }}>
          {isRegister ? 'Create Account' : 'Welcome Back'}
        </h1>
        <p style={{ fontSize: '16px', color: 'gray', marginBottom: '30px', textAlign: 'center' }}>
          {isRegister ? 'Sign up to start shopping' : 'Login to your account'}
        </p>

        {error && (
          <div style={{ backgroundColor: '#ffebee', color: 'red', padding: '15px', borderRadius: '8px', border: '2px solid red', marginBottom: '20px' }}>
            <p style={{ margin: 0, fontWeight: 'bold' }}>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', border: '3px solid black', boxShadow: '4px 4px 0px black' }}>
          {isRegister && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Juan Dela Cruz"
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid black', fontSize: '16px', boxSizing: 'border-box' }}
              />
            </div>
          )}

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="you@example.com"
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid black', fontSize: '16px', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Password</label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid black', fontSize: '16px', boxSizing: 'border-box' }}
            />
          </div>

          {isRegister && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Phone Number</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="09XX XXX XXXX"
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid black', fontSize: '16px', boxSizing: 'border-box' }}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              backgroundColor: loading ? 'gray' : 'blue',
              color: 'white',
              padding: '15px',
              borderRadius: '8px',
              border: '2px solid black',
              fontWeight: 'bold',
              fontSize: '18px',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: '15px'
            }}
          >
            {loading ? 'Please wait...' : (isRegister ? 'Create Account' : 'Login')}
          </button>

          <div style={{ textAlign: 'center' }}>
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister)
                setError('')
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'blue',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '14px',
                textDecoration: 'underline'
              }}
            >
              {isRegister ? 'Already have an account? Login here' : "Don't have an account? Register here"}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}