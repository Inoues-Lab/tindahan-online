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
  imageUrl?: string
  weightKg: number
  createdAt: string
}

export default function AdminProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    weightKg: '',
    imageUrl: ''
  })

  useEffect(() => {
    checkAuth()
    fetchProducts()
  }, [])

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
      const res = await fetch('/api/products')
      const data = await res.json()
      if (res.ok) {
        setProducts(data)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const openAddModal = () => {
    setEditingProduct(null)
    setFormData({
      name: '',
      description: '',
      price: '',
      stock: '',
      weightKg: '',
      imageUrl: ''
    })
    setShowModal(true)
  }

  const openEditModal = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      stock: product.stock.toString(),
      weightKg: product.weightKg.toString(),
      imageUrl: product.imageUrl || ''
    })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.price || !formData.stock) {
      alert('Please fill in required fields')
      return
    }

    try {
      const url = editingProduct ? `/api/admin/products?id=${editingProduct.id}` : '/api/admin/products'
      const method = editingProduct ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock),
          weightKg: parseFloat(formData.weightKg) || 1.0
        })
      })

      if (res.ok) {
        alert(editingProduct ? 'Product updated!' : 'Product added!')
        setShowModal(false)
        fetchProducts()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to save product')
      }
    } catch (error) {
      alert('Error saving product')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      const res = await fetch(`/api/admin/products?id=${id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        alert('Product deleted!')
        fetchProducts()
      } else {
        alert('Failed to delete product')
      }
    } catch (error) {
      alert('Error deleting product')
    }
  }

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '5px' }}>
               Product Management
            </h1>
            <p style={{ fontSize: '16px', color: 'gray' }}>
              Manage your inventory ({products.length} products)
            </p>
          </div>
          <button
            onClick={openAddModal}
            style={{
              padding: '12px 24px',
              backgroundColor: 'green',
              color: 'white',
              border: '2px solid black',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '16px',
              whiteSpace: 'nowrap'
            }}
          >
            ➕ Add New Product
          </button>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="🔍 Search products..."
            style={{
              width: '100%',
              padding: '12px 15px',
              fontSize: '16px',
              border: '2px solid black',
              borderRadius: '8px',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '3px solid black', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: '#f0f0f0' }}>
                <tr>
                  <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid black', fontSize: '14px' }}>Product</th>
                  <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid black', fontSize: '14px' }}>Price</th>
                  <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid black', fontSize: '14px' }}>Stock</th>
                  <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid black', fontSize: '14px' }}>Weight</th>
                  <th style={{ padding: '15px', textAlign: 'right', borderBottom: '2px solid black', fontSize: '14px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'gray' }}>
                      {searchTerm ? 'No products found' : 'No products yet. Click "Add New Product" to start!'}
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr key={product.id} style={{ borderBottom: '1px solid #ddd' }}>
                      <td style={{ padding: '15px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                          <div style={{ 
                            width: '60px', 
                            height: '60px', 
                            backgroundColor: '#f0f0f0', 
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '24px',
                            flexShrink: 0
                          }}>
                            {product.imageUrl ? (
                              <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                            ) : (
                              '📦'
                            )}
                          </div>
                          <div>
                            <p style={{ fontWeight: 'bold', marginBottom: '3px' }}>{product.name}</p>
                            <p style={{ fontSize: '13px', color: 'gray' }}>{product.description}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '15px' }}>
                        <span style={{ fontSize: '16px', fontWeight: 'bold', color: 'green' }}>
                          ₱{product.price.toFixed(2)}
                        </span>
                      </td>
                      <td style={{ padding: '15px' }}>
                        <span style={{ 
                          padding: '4px 12px', 
                          backgroundColor: product.stock > 0 ? '#e8f5e9' : '#fee',
                          color: product.stock > 0 ? 'green' : 'red',
                          borderRadius: '4px',
                          fontWeight: 'bold',
                          fontSize: '14px'
                        }}>
                          {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
                        </span>
                      </td>
                      <td style={{ padding: '15px', fontSize: '14px', color: 'gray' }}>
                        {product.weightKg}kg
                      </td>
                      <td style={{ padding: '15px', textAlign: 'right' }}>
                        <button
                          onClick={() => openEditModal(product)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: 'blue',
                            color: 'white',
                            border: '2px solid black',
                            borderRadius: '6px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            fontSize: '12px',
                            marginRight: '8px'
                          }}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: 'red',
                            color: 'white',
                            border: '2px solid black',
                            borderRadius: '6px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          🗑️ Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit Product Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '16px', border: '4px solid black', maxWidth: '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
              {editingProduct ? '✏️ Edit Product' : '➕ Add New Product'}
            </h2>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Product Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Canned Corned Beef"
                  style={{ width: '100%', padding: '12px', border: '2px solid black', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                  required
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Product description..."
                  style={{ width: '100%', padding: '12px', border: '2px solid black', borderRadius: '8px', fontSize: '14px', minHeight: '80px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Price (₱) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0.00"
                    style={{ width: '100%', padding: '12px', border: '2px solid black', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Stock Quantity *</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="0"
                    style={{ width: '100%', padding: '12px', border: '2px solid black', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.weightKg}
                    onChange={(e) => setFormData({ ...formData, weightKg: e.target.value })}
                    placeholder="1.0"
                    style={{ width: '100%', padding: '12px', border: '2px solid black', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Image URL</label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    style={{ width: '100%', padding: '12px', border: '2px solid black', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: 'green',
                    color: 'white',
                    border: '2px solid black',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}
                >
                  {editingProduct ? '💾 Update Product' : '✅ Add Product'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: 'gray',
                    color: 'white',
                    border: '2px solid black',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}
                >
                  ❌ Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}