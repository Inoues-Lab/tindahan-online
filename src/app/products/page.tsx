'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'

export default function ProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products')
      const data = await res.json()
      if (res.ok) {
        const approvedProducts = data.products.filter((p: any) => 
          p.merchant?.status === 'APPROVED' || p.merchant?.status === undefined
        )
        setProducts(approvedProducts || [])
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async (productId: string) => {
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity: 1 })
      })

      if (res.ok) {
        window.location.reload()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to add to cart')
      }
    } catch (error) {
      alert('Error adding to cart')
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
        <div style={{ textAlign: 'center', padding: '100px 20px' }}>Loading products...</div>
      </main>
    )
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
      <Header />
      
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '16px',
        '@media (min-width: 768px)': {
          padding: '20px'
        }
      }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ 
            fontSize: '24px', 
            fontWeight: 'bold', 
            marginBottom: '8px',
            '@media (min-width: 768px)': {
              fontSize: '32px'
            }
          }}>
            🛒 Shop Products
          </h1>
          <p style={{ fontSize: '14px', color: 'gray' }}>
            Fresh groceries delivered to your door!
          </p>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <input
            type="text"
            placeholder=" Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '2px solid black',
              borderRadius: '8px',
              fontSize: '16px',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {filteredProducts.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 20px', 
            backgroundColor: 'white', 
            borderRadius: '12px', 
            border: '3px solid black' 
          }}>
            <p style={{ fontSize: '18px', color: 'gray' }}>No products found</p>
            <p style={{ fontSize: '14px', color: 'gray' }}>Try a different search term</p>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr',
            gap: '16px',
            '@media (min-width: 640px)': {
              gridTemplateColumns: 'repeat(2, 1fr)'
            },
            '@media (min-width: 1024px)': {
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '20px'
            }
          }}>
            {filteredProducts.map((product) => (
              <div key={product.id} style={{ 
                backgroundColor: 'white', 
                padding: '16px', 
                borderRadius: '12px', 
                border: '3px solid black',
                boxShadow: '4px 4px 0px black',
                display: 'flex',
                flexDirection: 'column'
              }}>
                {product.imageUrl ? (
                  <img 
                    src={product.imageUrl} 
                    alt={product.name} 
                    style={{ 
                      width: '100%', 
                      height: '180px', 
                      objectFit: 'cover', 
                      borderRadius: '8px', 
                      marginBottom: '12px' 
                    }}
                  />
                ) : (
                  <div style={{ 
                    width: '100%', 
                    height: '180px', 
                    backgroundColor: '#f0f0f0', 
                    borderRadius: '8px', 
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '48px'
                  }}>
                    
                  </div>
                )}
                
                <h3 style={{ 
                  fontSize: '16px', 
                  fontWeight: 'bold', 
                  marginBottom: '6px',
                  lineHeight: '1.3'
                }}>
                  {product.name}
                </h3>
                
                <p style={{ 
                  fontSize: '13px', 
                  color: 'gray', 
                  marginBottom: '10px',
                  lineHeight: '1.4',
                  flex: '1'
                }}>
                  {product.description || 'No description'}
                </p>
                
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  marginBottom: '8px' 
                }}>
                  <span style={{ 
                    fontSize: '20px', 
                    fontWeight: 'bold', 
                    color: 'green' 
                  }}>
                    ₱{product.price.toFixed(2)}
                  </span>
                  <span style={{ 
                    fontSize: '12px', 
                    color: 'gray',
                    backgroundColor: product.stock > 10 ? '#e8f5e9' : product.stock > 0 ? '#fff3cd' : '#fee',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontWeight: 'bold'
                  }}>
                    {product.stock > 10 ? 'In Stock' : product.stock > 0 ? `Only ${product.stock} left` : 'Out of Stock'}
                  </span>
                </div>

                {product.merchant && (
                  <p style={{ 
                    fontSize: '11px', 
                    color: 'gray', 
                    marginBottom: '12px',
                    fontStyle: 'italic'
                  }}>
                    🏪 {product.merchant.storeName || 'Store'}
                  </p>
                )}
                
                <button
                  onClick={() => handleAddToCart(product.id)}
                  disabled={product.stock <= 0}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: product.stock <= 0 ? '#e0e0e0' : '#ffc107',
                    color: product.stock <= 0 ? '#999' : 'black',
                    border: '2px solid black',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    fontSize: '15px',
                    cursor: product.stock <= 0 ? 'not-allowed' : 'pointer',
                    boxShadow: product.stock <= 0 ? 'none' : '3px 3px 0px black',
                    transition: 'all 0.2s'
                  }}
                >
                  {product.stock <= 0 ? 'Out of Stock' : '🛒 Add to Cart'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}