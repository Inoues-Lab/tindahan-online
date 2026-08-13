'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultRole = searchParams.get('role') || 'CUSTOMER'
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    role: defaultRole
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // 🔑 STEP 1: Log out any existing session (clears old admin cookie)
      await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {})

      // STEP 2: Register the new user
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Registration failed')
        setLoading(false)
        return
      }

      // STEP 3: Auto-login as the NEW user
      const loginRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      })

      const loginData = await loginRes.json()

      // STEP 4: Redirect based on the NEW user's role
      if (loginRes.ok && loginData.user) {
        if (loginData.user.role === 'MERCHANT') {
          router.push('/merchant/apply')
        } else if (loginData.user.role === 'RIDER') {
          router.push('/rider/apply')
        } else if (loginData.user.role === 'ADMIN' || loginData.user.role === 'SUB_ADMIN') {
          router.push('/admin/dashboard')
        } else {
          router.push('/') // CUSTOMER goes to home/shop
        }
      } else {
        router.push('/login')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Full Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Juan Dela Cruz"
          required
          style={{ width: '100%', padding: '12px', border: '2px solid black', borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box' }}
        />
      </div>

      <div style={{ marginBottom: '15px' }}>
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

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Password</label>
        <input
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          placeholder="Create a password"
          required
          style={{ width: '100%', padding: '12px', border: '2px solid black', borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box' }}
        />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Phone Number</label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          placeholder="09551652430"
          style={{ width: '100%', padding: '12px', border: '2px solid black', borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box' }}
        />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Address</label>
        <textarea
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          placeholder="Your complete address"
          rows={3}
          style={{ width: '100%', padding: '12px', border: '2px solid black', borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box' }}
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>I want to:</label>
        <select
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          style={{ width: '100%', padding: '12px', border: '2px solid black', borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box' }}
        >
          <option value="CUSTOMER">Shop as Customer</option>
          <option value="MERCHANT">Become a Merchant</option>
          <option value="RIDER">Become a Rider</option>
        </select>
      </div>

      {error && (
        <div style={{ backgroundColor: '#fee', border: '2px solid red', padding: '15px', borderRadius: '8px', marginBottom: '20px', color: 'red' }}>
          {error}
        </div>
      )}

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
        {loading ? 'Creating Account...' : 'Register'}
      </button>
    </form>
  )
}