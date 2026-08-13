'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminHeader from '@/components/AdminHeader'

export default function SubAdminsPage() {
  const router = useRouter()
  const [subAdmins, setSubAdmins] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')

  useEffect(() => {
    checkAuth()
    fetchSubAdmins()
  }, [router])

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me')
      const data = await res.json()
      if (!data.user || data.user.role !== 'ADMIN') {
        router.push('/')
      }
    } catch (error) {
      router.push('/')
    }
  }

  const fetchSubAdmins = async () => {
    try {
      const res = await fetch('/api/admin/sub-admins')
      const data = await res.json()
      if (res.ok) {
        setSubAdmins(data.users || [])
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      const res = await fetch('/api/admin/sub-admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      const data = await res.json()
      if (res.ok) {
        alert('Sub-Admin created!')
        setShowModal(false)
        setFormData({ name: '', email: '', password: '' })
        fetchSubAdmins()
      } else {
        setError(data.error)
      }
    } catch (error) {
      setError('Error creating sub-admin')
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
      <AdminHeader />
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '30px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold' }}>Manage Sub-Admins</h1>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setShowModal(true)} style={{ padding: '12px 24px', backgroundColor: '#607d8b', color: 'white', border: '2px solid black', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '3px 3px 0px black' }}>
              + Create Sub-Admin
            </button>
            <button onClick={() => router.push('/admin/dashboard')} style={{ padding: '12px 24px', backgroundColor: 'white', color: 'black', border: '2px solid black', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
              ← Back
            </button>
          </div>
        </div>

        {error && <div style={{ backgroundColor: '#fee', padding: '15px', borderRadius: '8px', border: '2px solid red', marginBottom: '20px', color: 'red' }}>{error}</div>}

        {subAdmins.length === 0 ? (
          <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', border: '3px solid black', textAlign: 'center' }}>
            <p style={{ fontSize: '18px', color: 'gray' }}>No sub-admins yet.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '15px' }}>
            {subAdmins.map((admin) => (
              <div key={admin.id} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '3px solid black', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>{admin.name}</h3>
                  <p style={{ color: 'gray', margin: '5px 0 0 0' }}>{admin.email}</p>
                </div>
                <span style={{ padding: '5px 15px', backgroundColor: '#607d8b', color: 'white', borderRadius: '20px', fontWeight: 'bold' }}>Sub-Admin</span>
              </div>
            ))}
          </div>
        )}

        {showModal && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', border: '3px solid black', maxWidth: '500px', width: '100%' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Create Sub-Admin</h2>
              <form onSubmit={handleCreate}>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Full Name</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required style={{ width: '100%', padding: '12px', border: '2px solid black', borderRadius: '8px', boxSizing: 'border-box' }} />
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Email</label>
                  <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required style={{ width: '100%', padding: '12px', border: '2px solid black', borderRadius: '8px', boxSizing: 'border-box' }} />
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Password</label>
                  <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required style={{ width: '100%', padding: '12px', border: '2px solid black', borderRadius: '8px', boxSizing: 'border-box' }} />
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" style={{ flex: 1, padding: '15px', backgroundColor: '#607d8b', color: 'white', border: '2px solid black', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Create</button>
                  <button type="button" onClick={() => setShowModal(false)} style={{ padding: '15px 24px', backgroundColor: 'white', color: 'black', border: '2px solid black', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}