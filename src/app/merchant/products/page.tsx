'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'

export default function MerchantProductsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    imageUrl: ''
  })

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
    } finally {
      setLoading(false)
    }
  }

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/merchant/products')
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.price || !formData.stock) {
      alert('Please fill in all required fields')
      return
    }

    try {
      const url = editingProduct 
        ? `/api/merchant/products?id=${editingProduct.id}`
        : '/api/merchant/products'
      
      const method = editingProduct ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock)
        })
      })

      if (res.ok) {
        alert(editingProduct ? 'Product updated!' : 'Product added!')
        setShowAddForm(false)
        setEditingProduct(null)
        setFormData({ name: '', description: '', price: '', stock: '', imageUrl: '' })
        fetchProducts()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to save product')
      }
    } catch (error) {
      alert('Error saving product')
    }
  }

  const handleEdit = (product: any) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      stock: product.stock.toString(),
      imageUrl: product.imageUrl || ''
    })
    setShowAddForm(true)
  }

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      const res = await fetch(`/api/merchant/products?id=${productId}`, {
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
            <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '5px' }}>📦 My Products</h1>
            <p style={{ color: 'gray' }}>Manage your store inventory</p>
          </div>
          <button
            onClick={() => {
              setShowAddForm(!showAddForm)
              setEditingProduct(null)
              setFormData({ name: '', description: '', price: '', stock: '', imageUrl: '' })
            }}
            style={{
              padding: '12px 24px',
              backgroundColor: showAddForm ? 'gray' : 'green',
              color: 'white',
              border: '2px solid black',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            {showAddForm ? '✕ Cancel' : '+ Add Product'}
          </button>
        </div>

        {/* Add/Edit Product Form */}
        {showAddForm && (
          <div style={{ 
            backgroundColor: 'white', 
            padding: '30px', 
            borderRadius: '12px', 
            border: '3px solid black', 
            marginBottom: '30px',
            boxShadow: '4px 4px 0px black'
          }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Product Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Canned Corned Beef"
                    style={{ width: '100%', padding: '12px', border: '2px solid black', borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box' }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Price (₱) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0.00"
                    style={{ width: '100%', padding: '12px', border: '2px solid black', borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box' }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Stock Quantity *</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="100"
                    style={{ width: '100%', padding: '12px', border: '2px solid black', borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box' }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Image URL</label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    style={{ width: '100%', padding: '12px', border: '2px solid black', borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your product..."
                  rows={3}
                  style={{ width: '100%', padding: '12px', border: '2px solid black', borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box' }}
                />
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '15px',
                  backgroundColor: 'green',
                  color: 'white',
                  border: '2px solid black',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  fontSize: '18px',
                  cursor: 'pointer',
                  boxShadow: '4px 4px 0px black'
                }}
              >
                {editingProduct ? 'Update Product' : 'Add Product'}
              </button>
            </form>
          </div>
        )}

        {/* Products Grid */}
        {products.length === 0 ? (
          <div style={{ backgroundColor: 'white', padding: '60px', borderRadius: '12px', border: '3px solid black', textAlign: 'center' }}>
            <p style={{ fontSize: '18px', color: 'gray', marginBottom: '20px' }}>No products yet</p>
            <button
              onClick={() => setShowAddForm(true)}
              style={{
                padding: '12px 24px',
                backgroundColor: 'green',
                color: 'white',
                border: '2px solid black',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              + Add Your First Product
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {products.map((product) => (
              <div key={product.id} style={{ 
                backgroundColor: 'white', 
                padding: '20px', 
                borderRadius: '12px', 
                border: '3px solid black',
                boxShadow: '4px 4px 0px black'
              }}>
                {product.imageUrl ? (
                  <img 
                    src={product.imageUrl} 
                    alt={product.name} 
                    style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '8px', marginBottom: '15px' }}
                  />
                ) : (
                  <div style={{ 
                    width: '100%', 
                    height: '180px', 
                    backgroundColor: '#f0f0f0', 
                    borderRadius: '8px', 
                    marginBottom: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '48px'
                  }}>
                    📦
                  </div>
                )}
                
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>{product.name}</h3>
                <p style={{ fontSize: '14px', color: 'gray', marginBottom: '10px' }}>{product.description || 'No description'}</p>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <span style={{ fontSize: '24px', fontWeight: 'bold', color: 'green' }}>₱{product.price.toFixed(2)}</span>
                  <span style={{ 
                    fontSize: '14px', 
                    fontWeight: 'bold',
                    backgroundColor: product.stock > 10 ? '#e8f5e9' : product.stock > 0 ? '#fff3cd' : '#fee',
                    color: product.stock > 10 ? 'green' : product.stock > 0 ? 'orange' : 'red',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    border: '2px solid black'
                  }}>
                    {product.stock > 10 ? 'In Stock' : product.stock > 0 ? `Only ${product.stock} left` : 'Out of Stock'}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => handleEdit(product)}
                    style={{
                      flex: 1,
                      padding: '10px',
                      backgroundColor: '#2196f3',
                      color: 'white',
                      border: '2px solid black',
                      borderRadius: '8px',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    ️ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    style={{
                      flex: 1,
                      padding: '10px',
                      backgroundColor: '#f44336',
                      color: 'white',
                      border: '2px solid black',
                      borderRadius: '8px',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}