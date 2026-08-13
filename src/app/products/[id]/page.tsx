'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Header from '@/components/Header'

export default function ProductDetailPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string

  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    if (productId) fetchProduct()
  }, [productId])

  const fetchProduct = async () => {
    try {
      const res = await fetch('/api/products')
      const data = await res.json()
      if (res.ok) {
        const found = (data.products || []).find((p: any) => p.id === productId)
        setProduct(found || null)
      }
    } catch (error) {
      console.error('Error fetching product:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async () => {
    setAdding(true)
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity })
      })
      const data = await res.json()

      if (res.ok) {
        alert('Added to cart! 🛒')
        router.push('/cart')
      } else {
        alert(data.error || 'Failed to add to cart')
      }
    } catch (error) {
      alert('Error adding to cart')
    } finally {
      setAdding(false)
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

  if (!product) {
    return (
      <main style={{ minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
        <Header />
        <div style={{ textAlign: 'center', padding: '100px 20px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Product not found</h1>
          <button
            onClick={() => router.push('/')}
            style={{ padding: '12px 24px', backgroundColor: '#2196f3', color: 'white', border: '2px solid black', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '3px 3px 0px black' }}
          >
            ← Back to Shop
          </button>
        </div>
      </main>
    )
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
      <Header />
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '30px 20px' }}>
        <button
          onClick={() => router.push('/')}
          style={{ padding: '10px 20px', backgroundColor: 'white', color: 'black', border: '2px solid black', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '20px' }}
        >
          ← Back to Shop
        </button>

        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', border: '3px solid black', boxShadow: '4px 4px 0px black', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
          {product.imageUrl && (
            <img
              src={product.imageUrl}
              alt={product.name}
              style={{ width: '100%', height: '300px', objectFit: 'cover', borderRadius: '8px', border: '2px solid black' }}
            />
          )}

          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '10px' }}>{product.name}</h1>
            <p style={{ color: 'gray', fontSize: '16px', marginBottom: '15px' }}>{product.description}</p>

            <p style={{ fontSize: '12px', color: '#00bcd4', fontWeight: 'bold', marginBottom: '15px' }}>
              🏪 Sold by: {product.merchant?.storeName || product.merchant?.user?.name || 'Tindahan Store'}
            </p>

            <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#4caf50', marginBottom: '15px' }}>
              ₱{product.price}
            </p>

            <p style={{ fontSize: '14px', color: product.stock > 0 ? '#4caf50' : 'red', fontWeight: 'bold', marginBottom: '20px' }}>
              {product.stock > 0 ? `✓ In Stock: ${product.stock}` : '✗ Out of Stock'}
            </p>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '20px' }}>
              <label style={{ fontWeight: 'bold' }}>Qty:</label>
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                style={{ width: '40px', height: '40px', backgroundColor: 'white', border: '2px solid black', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '18px' }}
              >
                −
              </button>
              <span style={{ fontSize: '20px', fontWeight: 'bold', width: '40px', textAlign: 'center' }}>{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                style={{ width: '40px', height: '40px', backgroundColor: 'white', border: '2px solid black', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '18px' }}
              >
                +
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={adding || product.stock === 0}
              style={{
                width: '100%',
                padding: '15px',
                backgroundColor: adding || product.stock === 0 ? 'gray' : '#4caf50',
                color: 'white',
                border: '2px solid black',
                borderRadius: '8px',
                fontWeight: 'bold',
                fontSize: '18px',
                cursor: adding || product.stock === 0 ? 'not-allowed' : 'pointer',
                boxShadow: '4px 4px 0px black'
              }}
            >
              {adding ? 'Adding...' : '🛒 Add to Cart'}
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}