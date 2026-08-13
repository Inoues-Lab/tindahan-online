'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({ email: '', password: '' })
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

      if (res.ok) {
        // 🔑 FIX IS HERE: Allow SUB_ADMIN to go to admin dashboard
        if (data.user.role === 'ADMIN' || data.user.role === 'SUB_ADMIN') {
          router.push('/admin/dashboard')
        } else if (data.user.role === 'MERCHANT') {
          router.push('/merchant/dashboard')
        } else if (data.user.role === 'RIDER') {
          router.push('/rider/dashboard')
        } else {
          router.push('/')
        }
      } else {
        setError(data.error || 'Login failed')
      }
    } catch (error) {
      setError('An error occurred during login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
      {error && (
        <div style={{ backgroundColor: '#fee', padding: '10px', borderRadius: '8px', border: '2px solid red', color: 'red', textAlign: 'center' }}>
          {error}
        </div>
      )}

      <div>
        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Email</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
          style={{ width: '100%', padding: '12px', border: '2px solid black', borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box' }}
        />
      </div>

      <div>
        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Password</label>
        <input
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
          style={{ width: '100%', padding: '12px', border: '2px solid black', borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box' }}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        style={{
          padding: '15px',
          backgroundColor: loading ? '#999' : '#2196f3',
          color: 'white',
          border: '2px solid black',
          borderRadius: '8px',
          fontWeight: 'bold',
          fontSize: '16px',
          cursor: loading ? 'not-allowed' : 'pointer',
          boxShadow: '3px 3px 0px black'
        }}
      >
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  )
}