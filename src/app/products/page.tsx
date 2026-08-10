'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'

export default function ProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    fetchProducts()
    fetchCartCount()
  }, [])

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products')
      const data = await res.json()
      if (res.ok) {
        // Only show products from APPROVED merchants
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

  const fetchCartCount = async () => {
    try {
      const res = await fetch('/api/cart')
      const data = await res.json()
      if (res.ok) {
        const totalItems = data.cartItems?.reduce((sum: number, item: any) => sum + item.quantity, 0)
        setCartCount(totalItems || 0)
      }
    } catch (error) {
      console.error('Error fetching cart:', error)
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
        alert('✅ Added to cart!')
        fetchCartCount()
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
      
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '10px' }}>
             Shop Products
          </h1>
          <p style={{ fontSize: '16px', color: 'gray' }}>
            Fresh groceries delivered to your door!
          </p>
        </div>

        {/* Search Bar */}
        <div style={{ marginBottom: '30px' }}>
          <input
            type="text"
            placeholder="🔍 Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '15px',
              border: '2px solid black',
              borderRadius: '8px',
              fontSize: '16px',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: 'white', borderRadius: '12px', border: '3px solid black' }}>
            <p style={{ fontSize: '18px', color: 'gray' }}>No products found</p>
            <p style={{ fontSize: '14px', color: 'gray' }}>Try a different search term</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {filteredProducts.map((product) => (
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
                    style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px', marginBottom: '15px' }}
                  />
                ) : (
                  <div style={{ 
                    width: '100%', 
                    height: '200px', 
                    backgroundColor: '#f0f0f0', 
                    borderRadius: '8px', 
                    marginBottom: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '48px'
                  }}>
                    
                  </div>
                )}
                
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
                  {product.name}
                </h3>
                
                <p style={{ fontSize: '14px', color: 'gray', marginBottom: '10px', minHeight: '40px' }}>
                  {product.description || 'No description'}
                </p>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <span style={{ fontSize: '24px', fontWeight: 'bold', color: 'green' }}>
                    ₱{product.price.toFixed(2)}
                  </span>
                  <span style={{ fontSize: '14px', color: 'gray' }}>
                    Stock: {product.stock}
                  </span>
                </div>

                {product.merchant && (
                  <p style={{ fontSize: '12px', color: 'gray', marginBottom: '15px' }}>
                    🏪 {product.merchant.storeName || 'Store'}
                  </p>
                )}
                
                <button
                  onClick={() => handleAddToCart(product.id)}
                  disabled={product.stock <= 0}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: product.stock <= 0 ? 'gray' : '#ffc107',
                    color: product.stock <= 0 ? '#999' : 'black',
                    border: '2px solid black',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    fontSize: '16px',
                    cursor: product.stock <= 0 ? 'not-allowed' : 'pointer',
                    boxShadow: product.stock <= 0 ? 'none' : '4px 4px 0px black'
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