// src/app/admin/products/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'

interface Product {
  id: string
  name: string
  description: string
  price: number
  stock: number
  weightKg: number
  image: string | null
}

export default function AdminProductsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState<Product[]>([])
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    weightKg: '',
    image: ''
  })

  useEffect(() => {
    checkAuth()
    fetchProducts()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me')
      const data = await response.json()
      
      if (!data.user || data.user.role !== 'ADMIN') {
        router.push('/login')
      }
    } catch (error) {
      router.push('/login')
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/admin/products')
      const data = await response.json()
      
      if (response.ok && data.products) {
        setProducts(data.products)
      } else {
        setError('Failed to fetch products')
      }
    } catch (error) {
      setError('Failed to fetch products')
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (response.ok) {
        setFormData(prev => ({ ...prev, image: data.url }))
        alert('Image uploaded successfully!')
      } else {
        alert(data.error || 'Upload failed')
      }
    } catch (error) {
      alert('Upload error')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingProduct 
        ? `/api/admin/products?id=${editingProduct.id}`
        : '/api/admin/products'
      
      const method = editingProduct ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock),
          weightKg: parseFloat(formData.weightKg),
          image: formData.image
        })
      })

      if (response.ok) {
        alert(editingProduct ? 'Product updated!' : 'Product added!')
        setShowForm(false)
        setEditingProduct(null)
        resetForm()
        fetchProducts()
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to save product')
      }
    } catch (error) {
      alert('Error saving product')
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      stock: product.stock.toString(),
      weightKg: product.weightKg.toString(),
      image: product.image || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (productId: string, productName: string) => {
    if (!confirm(`Delete "${productName}"?`)) return
    
    try {
      const response = await fetch(`/api/admin/products?id=${productId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        alert('Product deleted!')
        fetchProducts()
      } else {
        alert('Failed to delete product')
      }
    } catch (error) {
      alert('Error deleting product')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      stock: '',
      weightKg: '',
      image: ''
    })
  }

  if (loading) {
    return (
      <main style={{ minHeight: '100vh', backgroundColor: 'white' }}>
        <Header />
        <div style={{ textAlign: 'center', padding: '100px 20px' }}>
          <p>Loading...</p>
        </div>
      </main>
    )
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
      <Header />
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: 'black', marginBottom: '10px' }}>
              Manage Products 📦
            </h1>
            <p style={{ fontSize: '18px', color: 'gray' }}>
              Add, edit, or remove products from the shop
            </p>
          </div>
          <button
            onClick={() => {
              setShowForm(!showForm)
              if (showForm) {
                setEditingProduct(null)
                resetForm()
              }
            }}
            style={{
              backgroundColor: showForm ? 'gray' : 'green',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              border: '2px solid black',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            {showForm ? 'Cancel' : '+ Add Product'}
          </button>
        </div>

        {error && (
          <div style={{ backgroundColor: '#ffebee', color: 'red', padding: '20px', borderRadius: '8px', border: '2px solid red', marginBottom: '20px' }}>
            <p style={{ margin: 0 }}>{error}</p>
          </div>
        )}

        {showForm && (
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', border: '3px solid black', marginBottom: '30px', boxShadow: '4px 4px 0px black' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h2>
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Product Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '2px solid black', fontSize: '16px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Description</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '2px solid black', fontSize: '16px', minHeight: '80px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Price (₱)</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '2px solid black', fontSize: '16px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Stock</label>
                  <input
                    type="number"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '2px solid black', fontSize: '16px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Weight (kg)</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    value={formData.weightKg}
                    onChange={(e) => setFormData({ ...formData, weightKg: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '2px solid black', fontSize: '16px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Product Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '2px solid black', fontSize: '16px', boxSizing: 'border-box' }}
                />
                {uploading && <p style={{ color: 'blue', marginTop: '5px' }}>Uploading to Cloudinary...</p>}
                {formData.image && (
                  <div style={{ marginTop: '10px' }}>
                    <p style={{ fontSize: '12px', color: 'gray', marginBottom: '5px' }}>Preview:</p>
                    <img src={formData.image} alt="Preview" style={{ maxWidth: '200px', borderRadius: '8px', border: '2px solid black' }} />
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={uploading}
                style={{
                  backgroundColor: uploading ? 'gray' : 'blue',
                  color: 'white',
                  padding: '15px',
                  borderRadius: '8px',
                  border: '2px solid black',
                  fontWeight: 'bold',
                  fontSize: '18px',
                  cursor: uploading ? 'not-allowed' : 'pointer'
                }}
              >
                {uploading ? 'Uploading...' : (editingProduct ? 'Update Product' : 'Add Product')}
              </button>
            </form>
          </div>
        )}

        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', border: '3px solid black', boxShadow: '4px 4px 0px black' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
            All Products ({products.length})
          </h2>
          
          {products.length === 0 ? (
            <p style={{ color: 'gray' }}>No products yet. Click "Add Product" to create one.</p>
          ) : (
            <div style={{ display: 'grid', gap: '15px' }}>
              {products.map((product) => (
                <div key={product.id} style={{ padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '2px solid black', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flex: 1 }}>
                    {product.image && (
                      <img src={product.image} alt={product.name} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '2px solid black' }} />
                    )}
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '5px' }}>{product.name}</h3>
                      <p style={{ color: 'gray', marginBottom: '5px' }}>{product.description}</p>
                      <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
                        <span style={{ color: 'green', fontWeight: 'bold' }}>₱{product.price.toFixed(2)}</span>
                        <span style={{ color: 'gray' }}>Stock: {product.stock}</span>
                        <span style={{ color: 'gray' }}>Weight: {product.weightKg}kg</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => handleEdit(product)}
                      style={{
                        backgroundColor: 'blue',
                        color: 'white',
                        padding: '10px 20px',
                        borderRadius: '8px',
                        border: '2px solid black',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product.id, product.name)}
                      style={{
                        backgroundColor: 'red',
                        color: 'white',
                        padding: '10px 20px',
                        borderRadius: '8px',
                        border: '2px solid black',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                    >
                      Delete
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