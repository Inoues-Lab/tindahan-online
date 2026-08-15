'use client'

import { useState, useEffect, useRef, type CSSProperties } from 'react'
import { useRouter } from 'next/navigation'
import MerchantHeader from '@/components/MerchantHeader'

export default function MerchantProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<'add' | 'edit' | null>(null)
  const [editingId, setEditingId] = useState('')
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', price: '', stock: '', description: '', imageUrl: '' })
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/merchant/products')
      const data = await res.json()
      if (res.ok) setProducts(data.products || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const openAdd = () => {
    setModal('add')
    setEditingId('')
    setForm({ name: '', price: '', stock: '', description: '', imageUrl: '' })
  }

  const openEdit = (p: any) => {
    setModal('edit')
    setEditingId(p.id)
    setForm({ name: p.name || '', price: String(p.price ?? ''), stock: String(p.stock ?? ''), description: p.description || '', imageUrl: p.imageUrl || '' })
  }

  const upload = async (file: File) => {
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    const data = await res.json()
    return res.ok ? data.url : null
  }

  const handleFile = async (e: any) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = await upload(file)
    if (url) setForm((f) => ({ ...f, imageUrl: url }))
    else alert('Upload failed')
  }

  const handleSave = async () => {
    if (!form.name || !form.price) { alert('Name and price are required!'); return }
    setSaving(true)
    try {
      const res = await fetch('/api/merchant/products', {
        method: modal === 'edit' ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(modal === 'edit' ? { productId: editingId, ...form } : form)
      })
      const data = await res.json()
      if (res.ok) { alert(data.message); setModal(null); fetchProducts() } else { alert(data.error) }
    } catch (error) { alert('Error') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return
    try {
      const res = await fetch('/api/merchant/products?productId=' + id, { method: 'DELETE' })
      const data = await res.json()
      if (res.ok) { alert(data.message); fetchProducts() } else { alert(data.error) }
    } catch (error) { alert('Error') }
  }

  const statusColors: any = { PENDING: '#ff9800', APPROVED: '#4caf50', REJECTED: '#dc3545' }

  const inputStyle: CSSProperties = {
    width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid black',
    boxSizing: 'border-box', fontSize: '16px', fontWeight: 'bold', backgroundColor: 'white'
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
      <MerchantHeader />
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '30px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '5px' }}>📦 My Products</h1>
            <p style={{ fontSize: '16px', color: 'gray' }}>New & edited products need admin approval</p>
          </div>
          <button onClick={openAdd} style={{ padding: '12px 24px', backgroundColor: '#4caf50', color: 'white', border: '2px solid black', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '3px 3px 0px black' }}>
            + Add Product
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>Loading...</div>
        ) : products.length === 0 ? (
          <div style={{ backgroundColor: 'white', padding: '60px 40px', borderRadius: '12px', border: '3px solid black', textAlign: 'center' }}>
            <p style={{ fontSize: '20px', fontWeight: 'bold' }}>No products yet — add your first one!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
            {products.map((p) => (
              <div key={p.id} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '3px solid black', boxShadow: '4px 4px 0px black' }}>
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt={p.name} style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '8px', border: '2px solid black', marginBottom: '15px' }} />
                ) : (
                  <div style={{ width: '100%', height: '160px', backgroundColor: '#f0f0f0', borderRadius: '8px', border: '2px dashed black', marginBottom: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px' }}>🛒</div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: 0 }}>{p.name}</h3>
                  <span style={{ padding: '3px 10px', backgroundColor: statusColors[p.status] || '#757575', color: 'white', borderRadius: '20px', fontWeight: 'bold', fontSize: '10px' }}>{p.status}</span>
                </div>
                <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#4caf50', margin: '0 0 5px 0' }}>₱{(p.price || 0).toFixed(2)}</p>
                <p style={{ fontSize: '12px', color: p.stock > 0 ? 'gray' : 'red', margin: '0 0 15px 0' }}>Stock: {p.stock}</p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => openEdit(p)} style={{ flex: 1, padding: '10px', backgroundColor: '#2196f3', color: 'white', border: '2px solid black', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '2px 2px 0px black' }}>✏️ Edit</button>
                  <button onClick={() => handleDelete(p.id)} style={{ padding: '10px 14px', backgroundColor: '#dc3545', color: 'white', border: '2px solid black', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '2px 2px 0px black' }}>🗑️</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', border: '3px solid black', maxWidth: '500px', width: '100%', maxHeight: '85vh', overflowY: 'auto', boxShadow: '8px 8px 0px black' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>{modal === 'edit' ? '✏️ Edit Product' : '+ Add Product'}</h2>

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
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Product Image</label>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
              <button type="button" onClick={() => fileRef.current?.click()} style={{ width: '100%', padding: '12px', border: '2px dashed black', borderRadius: '8px', cursor: 'pointer', backgroundColor: form.imageUrl ? '#e8f5e9' : '#f0f0f0', fontWeight: 'bold' }}>
                {form.imageUrl ? '✅ Image ready — change' : '📤 Upload Image'}
              </button>
              {form.imageUrl && <img src={form.imageUrl} alt="preview" style={{ width: '100%', maxHeight: '150px', objectFit: 'cover', borderRadius: '8px', border: '2px solid black', marginTop: '10px' }} />}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={handleSave} disabled={saving} style={{ flex: 1, padding: '15px', backgroundColor: saving ? 'gray' : '#4caf50', color: 'white', border: '2px solid black', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '3px 3px 0px black' }}>
                {saving ? 'Saving...' : '💾 Save'}
              </button>
              <button onClick={() => setModal(null)} style={{ padding: '15px 20px', backgroundColor: 'white', border: '2px solid black', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>✕</button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
