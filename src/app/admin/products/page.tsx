'use client'

import { useState, useEffect, type CSSProperties } from 'react'
import { useRouter } from 'next/navigation'
import AdminHeader from '@/components/AdminHeader'

export default function AdminProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', price: '', stock: '', description: '', imageUrl: '' })

  useEffect(() => {
    checkAuth()
  }, [router])

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me')
      const data = await res.json()
      if (!data.user || (data.user.role !== 'ADMIN' && data.user.role !== 'SUB_ADMIN')) {
        router.push('/')
        return
      }
      fetchProducts()
    } catch (error) {
      router.push('/')
    }
  }

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/admin/products')
      const data = await res.json()
      if (res.ok) setProducts(data.products || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const filtered = products.filter((p) =>
    (p.name || '').toLowerCase().includes(search.toLowerCase())
  )

  const openEdit = (p: any) => {
    setEditing(p)
    setForm({
      name: p.name || '',
      price: String(p.price ?? ''),
      stock: String(p.stock ?? ''),
      description: p.description || '',
      imageUrl: p.imageUrl || ''
    })
  }

  const handleSave = async () => {
    if (!form.name || !form.price) {
      alert('Name and price are required!')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/admin/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: editing.id, ...form })
      })
      const data = await res.json()
      if (res.ok) {
        alert(data.message || 'Product updated!')
        setEditing(null)
        fetchProducts()
      } else {
        alert(data.error || 'Failed to update product')
      }
    } catch (error) {
      alert('Error')
    } finally {
      setSaving(false)
    }
  }

  const inputStyle: CSSProperties = {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: '2px solid black',
    boxSizing: 'border-box',
    fontSize: '16px',
    fontWeight: 'bold',
    backgroundColor: 'white'
  }

  if (loading) {
    return (
      <main style={{ minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
        <AdminHeader />
        <div style={{ textAlign: 'center', padding: '100px 20px' }}>Loading...</div>
      </main>
    )
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
      <AdminHeader />
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '30px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '5px' }}>📦 Product Management</h1>
            <p style={{ fontSize: '16px', color: 'gray' }}>Edit any product in the platform</p>
          </div>
          <button onClick={() => router.push('/admin')} style={{ padding: '12px 24px', backgroundColor: 'white', border: '2px solid black', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
            ← Back
          </button>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 Search products by name..."
            style={{ ...inputStyle, padding: '15px', fontSize: '16px', boxShadow: '4px 4px 0px black' }}
          />
        </div>

        {products.length === 0 ? (
          <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', border: '3px solid black', textAlign: 'center' }}>
            <p style={{ fontSize: '18px', color: 'gray' }}>No products yet.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', border: '3px solid black', textAlign: 'center' }}>
            <p style={{ fontSize: '18px', color: 'gray' }}>No products match "{search}"</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
            {filtered.map((p) => (
              <div key={p.id} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '3px solid black', boxShadow: '4px 4px 0px black' }}>
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt={p.name} style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '8px', border: '2px solid black', marginBottom: '15px' }} />
                ) : (
                  <div style={{ width: '100%', height: '160px', backgroundColor: '#f0f0f0', borderRadius: '8px', border: '2px dashed black', marginBottom: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px' }}>
                    🛒
                  </div>
                )}
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '5px' }}>{p.name}</h3>
                <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#4caf50', margin: '0 0 5px 0' }}>₱{(p.price || 0).toFixed(2)}</p>
                <p style={{ fontSize: '12px', color: p.stock > 0 ? 'gray' : 'red', margin: '0 0 15px 0' }}>Stock: {p.stock}</p>
                <button
                  onClick={() => openEdit(p)}
                  style={{ width: '100%', padding: '12px', backgroundColor: '#2196f3', color: 'white', border: '2px solid black', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '3px 3px 0px black' }}
                >
                  ✏️ Edit Product
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {editing && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', border: '3px solid black', maxWidth: '500px', width: '100%', maxHeight: '85vh', overflowY: 'auto', boxShadow: '8px 8px 0px black' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>✏️ Edit Product</h2>
              <button onClick={() => setEditing(null)} style={{ padding: '8px 16px', backgroundColor: 'white', border: '2px solid black', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Product Name *</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputStyle} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Price (₱) *</label>
                <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Stock</label>
                <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} style={inputStyle} />
              </div>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ ...inputStyle, minHeight: '70px' }} />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Image URL</label>
              <input type="text" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} style={inputStyle} />
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              style={{ width: '100%', padding: '15px', backgroundColor: saving ? 'gray' : '#4caf50', color: 'white', border: '2px solid black', borderRadius: '8px', fontWeight: 'bold', fontSize: '18px', cursor: saving ? 'not-allowed' : 'pointer', boxShadow: '3px 3px 0px black' }}
            >
              {saving ? 'Saving...' : '💾 Save Changes'}
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
