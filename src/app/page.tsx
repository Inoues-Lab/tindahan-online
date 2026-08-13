'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'

export default function HomePage() {
  const router = useRouter()
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

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

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
      <Header />
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '30px 20px' }}>
        <div style={{ marginBottom: '30px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '10px' }}>
            🛍️ Welcome to Tindahan Online
          </h1>
          <p style={{ fontSize: '18px', color: 'gray' }}>
            Browse products from local merchants
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>Loading products...</div>
        ) : products.length === 0 ? (
          <div style={{ 
            backgroundColor: 'white', 
            padding: '60px 40px', 
            borderRadius: '12px', 
            border: '3px solid black', 
            textAlign: 'center' 
          }}>
            <p style={{ fontSize: '24px', marginBottom: '10px' }}>🏪</p>
            <p style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px' }}>No products yet</p>
            <p style={{ color: 'gray' }}>Merchants will add products soon!</p>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
            gap: '20px' 
          }}>
            {products.map((product) => (
              <div 
                key={product.id} 
                style={{ 
                  backgroundColor: 'white', 
                  padding: '20px', 
                  borderRadius: '12px', 
                  border: '3px solid black', 
                  boxShadow: '4px 4px 0px black',
                  cursor: 'pointer'
                }}
                onClick={() => router.push(`/products/${product.id}`)}
              >
                {product.imageUrl && (
                  <img 
                    src={product.imageUrl} 
                    alt={product.name} 
                    style={{ 
                      width: '100%', 
                      height: '200px', 
                      objectFit: 'cover', 
                      borderRadius: '8px', 
                      marginBottom: '15px' 
                    }} 
                  />
                )}
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '5px' }}>
                  {product.name}
                </h3>
                <p style={{ color: 'gray', fontSize: '14px', marginBottom: '10px' }}>
                  {product.description}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '22px', fontWeight: 'bold', color: '#4caf50' }}>
                    ₱{product.price}
                  </span>
                  <span style={{ fontSize: '14px', color: 'gray' }}>
                    Stock: {product.stock}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}