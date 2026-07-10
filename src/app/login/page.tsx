'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        if (data.user.role === 'RIDER') {
          router.push('/rider')
        } else {
          router.push('/')
        }
        router.refresh()
      } else {
        setError(data.error || 'Login failed')
      }
    } catch (err) {
      setError('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: 'white' }}>
      <Header />
      <div style={{ maxWidth: '500px', margin: '50px auto', padding: '20px' }}>
        <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', border: '3px solid black', boxShadow: '4px 4px 0px black' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: 'black', textAlign: 'center', marginBottom: '30px', marginTop: 0 }}>Login</h1>
          
          {error && (
            <div style={{ backgroundColor: '#ffebee', color: 'red', padding: '15px', borderRadius: '8px', border: '2px solid red', marginBottom: '20px', fontWeight: 'bold' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', color: 'black', marginBottom: '8px' }}>Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                style={{ width: '100%', padding: '12px', fontSize: '16px', border: '2px solid black', borderRadius: '8px', fontWeight: 'bold', color: 'black', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: '30px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', color: 'black', marginBottom: '8px' }}>Password</label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                style={{ width: '100%', padding: '12px', fontSize: '16px', border: '2px solid black', borderRadius: '8px', fontWeight: 'bold', color: 'black', boxSizing: 'border-box' }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', backgroundColor: loading ? 'gray' : 'green', color: 'white', padding: '15px', fontSize: '18px', fontWeight: 'bold', border: '3px solid black', borderRadius: '8px', cursor: 'pointer', boxShadow: '3px 3px 0px black' }}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '20px', fontWeight: 'bold', color: 'black' }}>
            Don't have an account? <Link href="/register" style={{ color: 'blue', textDecoration: 'underline' }}>Register here</Link>
          </p>
        </div>
      </div>
    </main>
  )
}
