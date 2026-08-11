'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Login failed')
        return
      }

      if (data.user) {
        if (data.user.role === 'ADMIN') {
          router.push('/admin/dashboard')
        } else if (data.user.role === 'MERCHANT') {
          router.push('/merchant/dashboard')
        } else if (data.user.role === 'RIDER') {
          router.push('/rider/dashboard')
        } else {
          router.push('/')
        }
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
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '30px', textAlign: 'center' }}>
            Login
          </h1>

          {error && (
            <div style={{ backgroundColor: '#fee', border: '2px solid red', padding: '15px', borderRadius: '8px', marginBottom: '20px', color: 'red' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="your@email.com"
                required
                style={{ width: '100%', padding: '12px', border: '2px solid black', borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Enter your password"
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
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div style={{ marginTop: '30px', textAlign: 'center' }}>
            <p style={{ color: 'gray' }}>
              Don't have an account?{' '}
              <a href="/register" style={{ color: '#2196f3', fontWeight: 'bold' }}>
                Register here
              </a>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}