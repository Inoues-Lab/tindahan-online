'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminHeader from '@/components/AdminHeader'

export default function AdminProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    imageUrl: ''
  })
  const [error, setError] = useState('')

  useEffect(() => {
    checkAuth()
    fetchProducts()
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

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/admin/products')
      const data = await res.json()
      if (res.ok) {
        setProducts(data.products || [])
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setUploading(true)

    try {
      let imageUrl = formData.imageUrl

      if (selectedFile) {
        const uploadFormData = new FormData()
        uploadFormData.append('file', selectedFile)

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: uploadFormData
        })

        const uploadData = await uploadRes.json()
        if (uploadRes.ok) {
          imageUrl = uploadData.url
        } else {
          setError(uploadData.error || 'Failed to upload image')
          setUploading(false)
          return
        }
      }

      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock),
          imageUrl: imageUrl
        })
      })

      const data = await res.json()

      if (res.ok) {
        alert('Product added!')
        setShowModal(false)
        setFormData({ name: '', description: '', price: '', stock: '', imageUrl: '' })
        setSelectedFile(null)
        fetchProducts()
      } else {
        setError(data.error || 'Failed to add product')
      }
    } catch (error) {
      setError('An error occurred')
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      const res = await fetch(`/api/admin/products?id=${productId}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        fetchProducts()
      } else {
        alert('Failed to delete product')
      }
    } catch (error) {
      alert('Error deleting product')
    }
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
            <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '5px' }}>
               Product Management
            </h1>
            <p style={{ fontSize: '16px', color: 'gray' }}>
              Manage your inventory ({products.length} products)
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setShowModal(true)}
              style={{
                padding: '12px 24px',
                backgroundColor: '#4caf50',
                color: 'white',
                border: '2px solid black',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '3px 3px 0px black'
              }}
            >
              + Add New Product
            </button>
            <button
              onClick={() => router.push('/admin/dashboard')}
              style={{
                padding: '12px 24px',
                backgroundColor: 'white',
                color: 'black',
                border: '2px solid black',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              ← Back
            </button>
          </div>
        </div>

        {error && (
          <div style={{ backgroundColor: '#fee', padding: '15px', borderRadius: '8px', border: '2px solid red', marginBottom: '20px', color: 'red' }}>
            {error}
          </div>
        )}

        {products.length === 0 ? (
          <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', border: '3px solid black', textAlign: 'center' }}>
            <p style={{ fontSize: '18px', color: 'gray' }}>No products yet. Add your first product!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {products.map((product) => (
              <div key={product.id} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '3px solid black', boxShadow: '4px 4px 0px black' }}>
                {product.imageUrl && (
                  <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px', marginBottom: '15px' }} />
                )}
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '5px' }}>{product.name}</h3>
                <p style={{ color: 'gray', fontSize: '14px', marginBottom: '10px' }}>{product.description}</p>
                
                {/* Show Merchant Name */}
<p style={{ fontSize: '12px', color: '#00bcd4', fontWeight: 'bold', marginBottom: '10px' }}>
   Sold by: {product.merchant?.storeName || product.merchant?.user?.name || 'Admin / Unknown'}
</p>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#4caf50' }}>₱{product.price}</span>
                  <span style={{ fontSize: '14px', color: 'gray' }}>Stock: {product.stock}</span>
                </div>
                <button
                  onClick={() => handleDeleteProduct(product.id)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: '2px solid black',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                   Delete
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add Product Modal */}
        {showModal && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
            <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', border: '3px solid black', maxWidth: '500px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Add New Product</h2>
              
              <form onSubmit={handleAddProduct}>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Product Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    style={{ width: '100%', padding: '12px', border: '2px solid black', borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    style={{ width: '100%', padding: '12px', border: '2px solid black', borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Product Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    disabled={uploading}
                    style={{ 
                      width: '100%', 
                      padding: '12px', 
                      border: '2px dashed black', 
                      borderRadius: '8px',
                      backgroundColor: selectedFile ? '#e8f5e9' : '#f9f9f9',
                      cursor: 'pointer',
                      marginBottom: '10px'
                    }}
                  />
                  {selectedFile && (
                    <p style={{ fontSize: '12px', color: 'green', marginBottom: '10px' }}>
                      ✓ Selected: {selectedFile.name}
                    </p>
                  )}
                  <p style={{ fontSize: '12px', color: 'gray', marginBottom: '10px' }}>Or paste image URL below:</p>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    disabled={uploading || !!selectedFile}
                    style={{ 
                      width: '100%', 
                      padding: '12px', 
                      border: '2px solid black', 
                      borderRadius: '8px', 
                      fontSize: '14px',
                      boxSizing: 'border-box',
                      opacity: selectedFile ? 0.6 : 1
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Price (₱) *</label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                      step="0.01"
                      style={{ width: '100%', padding: '12px', border: '2px solid black', borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Stock Quantity *</label>
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      required
                      style={{ width: '100%', padding: '12px', border: '2px solid black', borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="submit"
                    disabled={uploading}
                    style={{
                      flex: 1,
                      padding: '15px',
                      backgroundColor: uploading ? '#999' : '#4caf50',
                      color: 'white',
                      border: '2px solid black',
                      borderRadius: '8px',
                      fontWeight: 'bold',
                      fontSize: '16px',
                      cursor: uploading ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {uploading ? 'Uploading...' : 'Add Product'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    disabled={uploading}
                    style={{
                      padding: '15px 24px',
                      backgroundColor: 'white',
                      color: 'black',
                      border: '2px solid black',
                      borderRadius: '8px',
                      fontWeight: 'bold',
                      fontSize: '16px',
                      cursor: uploading ? 'not-allowed' : 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}