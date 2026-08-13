'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'

export default function ShopPage() {
  const router = useRouter()
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products')
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

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
      <Header />
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '30px 20px' }}>
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '10px' }}>
            🛍️ Shop
          </h1>
          <p style={{ fontSize: '16px', color: 'gray', marginBottom: '20px' }}>
            Browse products from local merchants
          </p>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 Search products..."
            style={{
              width: '100%',
              padding: '15px',
              border: '3px solid black',
              borderRadius: '12px',
              fontSize: '16px',
              boxSizing: 'border-box',
              backgroundColor: 'white'
            }}
          />
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>Loading products...</div>
        ) : filteredProducts.length === 0 ? (
          <div style={{ backgroundColor: 'white', padding: '60px 40px', borderRadius: '12px', border: '3px solid black', textAlign: 'center' }}>
            <p style={{ fontSize: '24px', marginBottom: '10px' }}>🏪</p>
            <p style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px' }}>No products found</p>
            <p style={{ color: 'gray' }}>Try a different search or check back later!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => router.push(`/products/${product.id}`)}
                style={{
                  backgroundColor: 'white',
                  padding: '20px',
                  borderRadius: '12px',
                  border: '3px solid black',
                  boxShadow: '4px 4px 0px black',
                  cursor: 'pointer'
                }}
              >
                {product.imageUrl && (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px', marginBottom: '15px' }}
                  />
                )}
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '5px' }}>{product.name}</h3>
                <p style={{ color: 'gray', fontSize: '14px', marginBottom: '10px' }}>{product.description}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '22px', fontWeight: 'bold', color: '#4caf50' }}>₱{product.price}</span>
                  <span style={{ fontSize: '14px', color: 'gray' }}>Stock: {product.stock}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}