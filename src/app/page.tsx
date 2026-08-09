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
}

export default function HomePage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products')
      const data = await res.json()
      
      if (res.ok) {
        // Handle different response formats
        let productsArray = []
        if (Array.isArray(data)) {
          productsArray = data
        } else if (data.products && Array.isArray(data.products)) {
          productsArray = data.products
        } else if (data.items && Array.isArray(data.items)) {
          productsArray = data.items
        }
        
        setProducts(productsArray)
        setFilteredProducts(productsArray)
        setError('')
      } else {
        setError(data.error || 'Failed to load products')
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      setError('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase()
    setSearchTerm(term)
    
    if (term.trim() === '') {
      setFilteredProducts(products)
    } else {
      const filtered = products.filter(product => 
        product.name.toLowerCase().includes(term) ||
        product.description.toLowerCase().includes(term)
      )
      setFilteredProducts(filtered)
    }
  }

  const addToCart = async (productId: string) => {
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity: 1 })
      })
      
      if (res.ok) {
        alert('Added to cart!')
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to add to cart')
      }
    } catch (error) {
      alert('Error adding to cart')
    }
  }

  if (loading) {
    return (
      <main style={{ minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
        <Header />
        <div style={{ textAlign: 'center', padding: '100px 20px' }}>
          <p>Loading products...</p>
        </div>
      </main>
    )
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
      <Header />
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '15px' }}>
        <div style={{ marginBottom: '20px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: 'black', marginBottom: '5px' }}>
            Fresh Groceries
          </h1>
          <p style={{ fontSize: '16px', color: 'gray', marginBottom: '15px' }}>
            Delivered to your door within the day
          </p>
        </div>

        {error && (
          <div style={{ backgroundColor: '#fee', padding: '15px', borderRadius: '8px', border: '2px solid red', marginBottom: '20px' }}>
            <strong style={{ color: 'red' }}>Error:</strong> {error}
            <button 
              onClick={fetchProducts}
              style={{ marginLeft: '10px', padding: '5px 10px', backgroundColor: 'blue', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Retry
            </button>
          </div>
        )}

        <div style={{ marginBottom: '20px' }}>
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search products (type to filter)..."
            style={{
              width: '100%',
              padding: '12px 15px',
              fontSize: '16px',
              border: '2px solid black',
              borderRadius: '8px',
              boxSizing: 'border-box',
              fontWeight: 'bold'
            }}
          />
        </div>

        {filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: 'white', borderRadius: '12px', border: '3px solid black' }}>
            <p style={{ fontSize: '18px', color: 'gray' }}>
              {error ? 'Failed to load products' : 'No products found'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '15px' }}>
            {filteredProducts.map((product) => (
              <div key={product.id} style={{ backgroundColor: 'white', borderRadius: '12px', border: '3px solid black', overflow: 'hidden', boxShadow: '3px 3px 0px black' }}>
                <div style={{ height: '200px', overflow: 'hidden', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {product.imageUrl ? (
                    <img 
                      src={product.imageUrl} 
                      alt={product.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <span style={{ fontSize: '48px' }}>📦</span>
                  )}
                </div>
                
                <div style={{ padding: '15px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '5px', color: 'black' }}>
                    {product.name}
                  </h3>
                  <p style={{ fontSize: '13px', color: 'gray', marginBottom: '10px' }}>
                    {product.description}
                  </p>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div>
                      <p style={{ fontSize: '18px', fontWeight: 'bold', color: 'green', margin: 0 }}>
                        ₱{product.price.toFixed(2)}
                      </p>
                      <p style={{ fontSize: '11px', color: 'gray', margin: 0 }}>
                        {product.weightKg}kg
                      </p>
                    </div>
                    <p style={{ fontSize: '12px', color: product.stock > 0 ? 'green' : 'red', fontWeight: 'bold', margin: 0 }}>
                      {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
                    </p>
                  </div>
                  
                  <button
                    onClick={() => addToCart(product.id)}
                    disabled={product.stock === 0}
                    style={{
                      width: '100%',
                      padding: '10px',
                      backgroundColor: product.stock === 0 ? 'gray' : 'green',
                      color: 'white',
                      border: '2px solid black',
                      borderRadius: '8px',
                      fontWeight: 'bold',
                      cursor: product.stock === 0 ? 'not-allowed' : 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
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