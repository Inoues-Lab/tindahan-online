'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Check if already logged in
  useEffect(() => {
    const checkLogin = async () => {
      try {
        const res = await fetch('/api/auth/me')
        const data = await res.json()
        
        if (data.user) {
          // Already logged in, redirect to appropriate dashboard
          if (data.user.role === 'ADMIN' || data.user.role === 'SUB_ADMIN') {
            router.push('/admin/dashboard')
          } else if (data.user.role === 'MERCHANT') {
            router.push('/merchant/dashboard')
          } else if (data.user.role === 'RIDER') {
            router.push('/rider/dashboard')
          } else {
            router.push('/')
          }
        }
      } catch (error) {
        // Not logged in, stay on login page
      }
    }
    
    checkLogin()
  }, [router])

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
        setLoading(false)
        return
      }

      if (data.user) {
        // 🔑 Redirect based on role - SUB_ADMIN goes to admin dashboard
        if (data.user.role === 'ADMIN' || data.user.role === 'SUB_ADMIN') {
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
      setLoading(false)
    }
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
      {/* Clean Simple Header for Auth Pages */}
      <div style={{ 
        backgroundColor: 'white', 
        borderBottom: '3px solid black', 
        padding: '15px 30px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Link href="/" style={{ fontSize: '24px', fontWeight: 'bold', textDecoration: 'none', color: 'black', display: 'flex', alignItems: 'center', gap: '10px' }}>
           Tindahan
        </Link>
        <Link href="/register" style={{ 
          padding: '8px 20px', 
          backgroundColor: 'white', 
          color: 'black', 
          border: '2px solid black', 
          borderRadius: '8px', 
          fontWeight: 'bold', 
          textDecoration: 'none',
          fontSize: '14px'
        }}>
          Register
        </Link>
      </div>

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
            
            <div style={{ textAlign: 'right', marginBottom: '20px' }}>
              <Link href="/forgot-password" style={{ color: '#2196f3', fontSize: '14px', fontWeight: 'bold' }}>
                Forgot Password?
              </Link>
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
              <Link href="/register" style={{ color: '#2196f3', fontWeight: 'bold' }}>
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}