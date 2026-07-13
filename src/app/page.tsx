// src/app/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import CartButton from '@/components/CartButton'

interface Product {
  id: string
  name: string
  description: string
  price: number
  stock: number
  weightKg: number
  image: string | null
}

export default function HomePage() {
  const [query, setQuery] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data.products || [])
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching products:', err)
        setLoading(false)
      })
  }, [])

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(query.toLowerCase()) ||
    product.description.toLowerCase().includes(query.toLowerCase())
  )

  if (loading) {
    return (
      <main style={{ minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
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
        <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: 'black', marginBottom: '10px' }}>
          Fresh Groceries
        </h1>
        <p style={{ fontSize: '18px', color: 'gray', marginBottom: '30px' }}>
          Delivered to your door within the day
        </p>

        <div style={{ marginBottom: '30px' }}>
          <input
            type="text"
            placeholder="Search products (type to filter)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              width: '100%',
              maxWidth: '600px',
              padding: '12px 20px',
              borderRadius: '8px',
              border: '2px solid black',
              fontSize: '16px',
              boxShadow: '3px 3px 0px black'
            }}
          />
        </div>

        {query && (
          <p style={{ fontSize: '16px', color: 'gray', marginBottom: '20px' }}>
            Found {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} for "{query}"
          </p>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {filteredProducts.map((product) => (
            <div key={product.id} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '2px solid black', boxShadow: '3px 3px 0px black' }}>
              {/* Show image if exists, otherwise show emoji */}
              {product.image ? (
                <img 
                  src={product.image} 
                  alt={product.name}
                  style={{ 
                    width: '100%', 
                    height: '150px', 
                    objectFit: 'cover',
                    borderRadius: '8px',
                    marginBottom: '15px'
                  }} 
                />
              ) : (
                <div style={{ backgroundColor: '#f0f0f0', height: '150px', borderRadius: '8px', marginBottom: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px' }}>
                  🛍️
                </div>
              )}
              
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'black', margin: '0 0 5px 0' }}>{product.name}</h3>
              <p style={{ fontSize: '14px', color: 'gray', margin: '0 0 15px 0' }}>{product.description}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '20px', fontWeight: 'bold', color: 'green' }}>₱{product.price.toFixed(2)}</span>
                <CartButton product={{
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  weightKg: product.weightKg
                }} />
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: 'white', borderRadius: '12px', border: '3px solid black' }}>
            <p style={{ fontSize: '18px', color: 'gray' }}>
              {query ? `No products found for "${query}"` : 'No products available'}
            </p>
          </div>
        )}
      </div>
    </main>
  )
}