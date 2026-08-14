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

  const shuffle = (arr: any[]) => {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const temp = a[i]
      a[i] = a[j]
      a[j] = temp
    }
    return a
  }

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products')
      const data = await res.json()
      if (res.ok) {
        const all = data.products || []
        setProducts(shuffle(all).slice(0, 10))
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
            Shop, Pabili, at Padala — lahat nandito na!
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
          <div
            onClick={() => router.push('/shop')}
            style={{ backgroundColor: '#e3f2fd', padding: '25px', borderRadius: '12px', border: '3px solid #2196f3', textAlign: 'center', cursor: 'pointer', boxShadow: '4px 4px 0px black' }}
          >
            <p style={{ fontSize: '40px', marginBottom: '10px' }}>🛒</p>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '5px' }}>Grocery Shopping</h3>
            <p style={{ fontSize: '14px', color: 'gray' }}>Browse and buy products from local merchants</p>
          </div>

          <div
            onClick={() => router.push('/pabili')}
            style={{ backgroundColor: '#fff3e0', padding: '25px', borderRadius: '12px', border: '3px solid #ff9800', textAlign: 'center', cursor: 'pointer', boxShadow: '4px 4px 0px black' }}
          >
            <p style={{ fontSize: '40px', marginBottom: '10px' }}>🏃</p>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '5px' }}>Pabili Service</h3>
            <p style={{ fontSize: '14px', color: 'gray' }}>We'll buy it for you from any store!</p>
          </div>

          <div
            onClick={() => router.push('/padala')}
            style={{ backgroundColor: '#e8f5e9', padding: '25px', borderRadius: '12px', border: '3px solid #4caf50', textAlign: 'center', cursor: 'pointer', boxShadow: '4px 4px 0px black' }}
          >
            <p style={{ fontSize: '40px', marginBottom: '10px' }}>📦</p>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '5px' }}>Padala Service</h3>
            <p style={{ fontSize: '14px', color: 'gray' }}>Fast and safe package delivery</p>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>🔥 Featured Products</h2>
          <button
            onClick={() => router.push('/shop')}
            style={{ padding: '10px 20px', backgroundColor: 'white', border: '2px solid black', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '3px 3px 0px black' }}
          >
            View All →
          </button>
        </div>
        <p style={{ fontSize: '12px', color: 'gray', marginBottom: '20px' }}>🎲 Fresh picks every visit — reload to see more!</p>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>Loading products...</div>
        ) : products.length === 0 ? (
          <div style={{ backgroundColor: 'white', padding: '60px 40px', borderRadius: '12px', border: '3px solid black', textAlign: 'center' }}>
            <p style={{ fontSize: '24px', marginBottom: '10px' }}>🏪</p>
            <p style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px' }}>No products yet</p>
            <p style={{ color: 'gray' }}>Merchants will add products soon!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {products.map((product) => (
              <div
                key={product.id}
                onClick={() => router.push('/products/' + product.id)}
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
