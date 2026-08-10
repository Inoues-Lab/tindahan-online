'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'

export default function MerchantProductsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    weightKg: '',
    imageUrl: ''
  })
  
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    checkAuth()
  }, [router])

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me')
      const data = await res.json()
      
      if (!data.user || data.user.role !== 'MERCHANT') {
        router.push('/')
        return
      }
      
      setUser(data.user)
      fetchProducts()
    } catch (error) {
      router.push('/')
    }
  }

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products')
      const data = await res.json()
      if (res.ok) {
        const myProducts = (data.products || []).filter((p: any) => p.merchantId === user?.id)
        setProducts(myProducts)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => setImagePreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const uploadImage = async (file: File | null): Promise<string | null> => {
    if (!file) return null
    const formDataUpload = new FormData()
    formDataUpload.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: formDataUpload })
    const data = await res.json()
    return res.ok ? data.url : null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage('')

    try {
      let imageUrl = formData.imageUrl
      if (imageFile) {
        imageUrl = await uploadImage(imageFile) || ''
      }

      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        weightKg: parseFloat(formData.weightKg) || 1.0,
        imageUrl,
        merchantId: user?.id
      }

      const res = await fetch('/api/admin/products', {
        method: editingProduct ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingProduct ? { ...productData, id: editingProduct.id } : productData)
      })

      const data = await res.json()
      if (res.ok) {
        setMessage(editingProduct ? '✅ Product updated!' : '✅ Product added!')
        setFormData({ name: '', description: '', price: '', stock: '', weightKg: '', imageUrl: '' })
        setImageFile(null)
        setImagePreview('')
        setEditingProduct(null)
        setShowForm(false)
        fetchProducts()
      } else {
        setMessage(`❌ ${data.error}`)
      }
    } catch (error) {
      setMessage('❌ Error saving product')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (product: any) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      stock: product.stock.toString(),
      weightKg: product.weightKg?.toString() || '1',
      imageUrl: product.imageUrl || ''
    })
    setImagePreview(product.imageUrl || '')
    setShowForm(true)
  }

  const handleDelete = async (productId: string) => {
    if (!confirm('Delete this product?')) return
    
    try {
      const res = await fetch(`/api/admin/products?id=${productId}`, { method: 'DELETE' })
      if (res.ok) {
        alert('Product deleted!')
        fetchProducts()
      } else {
        alert('Failed to delete')
      }
    } catch (error) {
      alert('Error deleting product')
    }
  }

  if (loading) {
    return (
      <main style={{ minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
        <Header />
        <div style={{ textAlign: 'center', padding: '100px 20px' }}>Loading...</div>
      </main>
    )
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
      <Header />
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '5px' }}>
              📦 Manage Products
            </h1>
            <p style={{ fontSize: '16px', color: 'gray' }}>
              Add and manage your store products
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => router.push('/merchant/dashboard')}
              style={{
                padding: '10px 20px',
                backgroundColor: 'gray',
                color: 'white',
                border: '2px solid black',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              ← Back
            </button>
            <button
              onClick={() => { setShowForm(true); setEditingProduct(null); setFormData({ name: '', description: '', price: '', stock: '', weightKg: '', imageUrl: '' }); setImageFile(null); setImagePreview('') }}
              style={{
                padding: '10px 20px',
                backgroundColor: 'blue',
                color: 'white',
                border: '2px solid black',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              + Add Product
            </button>
          </div>
        </div>

        {message && (
          <div style={{ 
            padding: '15px', 
            borderRadius: '8px', 
            marginBottom: '20px', 
            backgroundColor: message.includes('✅') ? '#e8f5e9' : '#fee',
            border: `2px solid ${message.includes('✅') ? 'green' : 'red'}`,
            color: message.includes('✅') ? 'green' : 'red',
            fontWeight: 'bold'
          }}>
            {message}
          </div>
        )}

        {/* Add/Edit Product Form */}
        {showForm && (
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', border: '3px solid black', marginBottom: '20px', boxShadow: '4px 4px 0px black' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
              {editingProduct ? '✏️ Edit Product' : ' Add New Product'}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Product Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    style={{ width: '100%', padding: '12px', border: '2px solid black', borderRadius: '8px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Price (₱) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    style={{ width: '100%', padding: '12px', border: '2px solid black', borderRadius: '8px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Stock *</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    required
                    style={{ width: '100%', padding: '12px', border: '2px solid black', borderRadius: '8px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.weightKg}
                    onChange={(e) => setFormData({ ...formData, weightKg: e.target.value })}
                    style={{ width: '100%', padding: '12px', border: '2px solid black', borderRadius: '8px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  style={{ width: '100%', padding: '12px', border: '2px solid black', borderRadius: '8px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Product Image</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{ width: '100%', padding: '12px', backgroundColor: imageFile ? '#e8f5e9' : '#f0f0f0', border: '2px dashed black', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  {imageFile ? '✅ Image Selected' : '📷 Upload Image'}
                </button>
                {imagePreview && (
                  <img src={imagePreview} alt="Preview" style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', marginTop: '10px', borderRadius: '8px', border: '2px solid black' }} />
                )}
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setEditingProduct(null); setFormData({ name: '', description: '', price: '', stock: '', weightKg: '', imageUrl: '' }); setImageFile(null); setImagePreview('') }}
                  style={{ flex: 1, padding: '12px', backgroundColor: 'gray', color: 'white', border: '2px solid black', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ flex: 1, padding: '12px', backgroundColor: submitting ? 'gray' : 'green', color: 'white', border: '2px solid black', borderRadius: '8px', fontWeight: 'bold', cursor: submitting ? 'not-allowed' : 'pointer' }}
                >
                  {submitting ? 'Saving...' : editingProduct ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Products List */}
        <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', border: '3px solid black', boxShadow: '4px 4px 0px black' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '20px' }}>📦 Your Products ({products.length})</h2>
          
          {products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
              <p style={{ fontSize: '18px', color: 'gray', marginBottom: '10px' }}>No products yet</p>
              <p style={{ fontSize: '14px', color: 'gray' }}>Click "Add Product" to start selling!</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {products.map((product) => (
                <div key={product.id} style={{ padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '2px solid black' }}>
                  {product.imageUrl && (
                    <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '8px', marginBottom: '10px' }} />
                  )}
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '5px' }}>{product.name}</h3>
                  <p style={{ fontSize: '14px', color: 'gray', marginBottom: '10px' }}>{product.description}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontSize: '20px', fontWeight: 'bold', color: 'green' }}>₱{product.price.toFixed(2)}</span>
                    <span style={{ fontSize: '14px', color: 'gray' }}>Stock: {product.stock}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => handleEdit(product)}
                      style={{ flex: 1, padding: '8px', backgroundColor: 'blue', color: 'white', border: '2px solid black', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      style={{ flex: 1, padding: '8px', backgroundColor: 'red', color: 'white', border: '2px solid black', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}