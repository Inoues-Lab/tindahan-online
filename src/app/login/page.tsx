// src/app/login/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)

  const inputStyle = {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: '2px solid black',
    fontSize: '16px',
    boxSizing: 'border-box' as const,
    backgroundColor: 'white',
    color: 'black',
    fontWeight: 'bold' as const
  }

  const labelStyle = {
    display: 'block',
    fontWeight: 'bold' as const,
    marginBottom: '5px',
    color: 'black',
    fontSize: '16px'
  }

  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const response = await fetch('/api/auth/me')
        const data = await response.json()
        if (data.user) {
          if (data.user.role === 'ADMIN') router.push('/admin')
          else if (data.user.role === 'RIDER') router.push('/rider')
          else router.push('/')
        }
      } catch (error) {
        console.log('Not logged in')
      } finally {
        setCheckingAuth(false)
      }
    }
    checkLoggedIn()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await response.json()
      if (response.ok) {
        if (data.user.role === 'ADMIN') router.push('/admin')
        else if (data.user.role === 'RIDER') router.push('/rider')
        else router.push('/')
      } else {
        alert(data.error || 'Login failed')
      }
    } catch (error) {
      alert('Login error')
    } finally {
      setLoading(false)
    }
  }

  if (checkingAuth) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Loading...</p>
      </main>
    )
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f9f9f9', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', border: '3px solid black', boxShadow: '4px 4px 0px black', width: '100%', maxWidth: '400px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', textAlign: 'center', marginBottom: '10px', color: 'black' }}>
          Welcome Back
        </h1>
        <p style={{ textAlign: 'center', color: 'gray', marginBottom: '30px' }}>
          Login to your account
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px' }}>
          <div>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '15px',
              backgroundColor: loading ? 'gray' : 'blue',
              color: 'white',
              border: '2px solid black',
              borderRadius: '8px',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '3px 3px 0px black'
            }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Link href="/register" style={{ color: 'blue', fontWeight: 'bold' }}>
            Don't have an account? Register here
          </Link>
        </div>
      </div>
    </main>
  )
}