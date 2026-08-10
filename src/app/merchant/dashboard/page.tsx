'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'

export default function MerchantDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [merchantProfile, setMerchantProfile] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [error, setError] = useState('')

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
      setMerchantProfile(data.user.merchantProfile)
      
      // Fetch merchant's products
      fetchProducts()
    } catch (error) {
      router.push('/')
    }
  }

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products')
      const data = await res.json()
      if (res.ok) {
        // Filter products that belong to this merchant
        const myProducts = (data.products || []).filter((p: any) => p.merchantId === user?.id)
        setProducts(myProducts)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
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
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '10px' }}>
            🏪 Merchant Dashboard
          </h1>
          <p style={{ fontSize: '18px', color: 'gray' }}>
            Welcome back, {user?.name}!
          </p>
        </div>

        {/* Store Info */}
        {merchantProfile && (
          <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', border: '3px solid black', marginBottom: '20px', boxShadow: '4px 4px 0px black' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '15px' }}>📋 Store Information</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
              <div>
                <p style={{ fontSize: '12px', color: 'gray', marginBottom: '5px' }}>Store Name</p>
                <p style={{ fontSize: '18px', fontWeight: 'bold' }}>{merchantProfile.storeName}</p>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: 'gray', marginBottom: '5px' }}>Business Type</p>
                <p style={{ fontSize: '18px', fontWeight: 'bold' }}>{merchantProfile.businessType}</p>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: 'gray', marginBottom: '5px' }}>Status</p>
                <span style={{ 
                  padding: '4px 12px', 
                  borderRadius: '20px', 
                  fontSize: '14px', 
                  fontWeight: 'bold',
                  backgroundColor: '#e8f5e9',
                  color: 'green',
                  border: '1px solid green'
                }}>
                  {merchantProfile.status}
                </span>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: 'gray', marginBottom: '5px' }}>Commission Rate</p>
                <p style={{ fontSize: '18px', fontWeight: 'bold', color: 'orange' }}>{(merchantProfile.commissionRate * 100).toFixed(0)}%</p>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', border: '3px solid black', marginBottom: '20px', boxShadow: '4px 4px 0px black' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '15px' }}>📊 Quick Stats</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
            <div style={{ padding: '20px', backgroundColor: '#e3f2fd', borderRadius: '8px', border: '2px solid blue', textAlign: 'center' }}>
              <p style={{ fontSize: '12px', color: 'gray', marginBottom: '5px' }}>My Products</p>
              <p style={{ fontSize: '32px', fontWeight: 'bold', color: 'blue' }}>{products.length}</p>
            </div>
            <div style={{ padding: '20px', backgroundColor: '#e8f5e9', borderRadius: '8px', border: '2px solid green', textAlign: 'center' }}>
              <p style={{ fontSize: '12px', color: 'gray', marginBottom: '5px' }}>Total Sales</p>
              <p style={{ fontSize: '32px', fontWeight: 'bold', color: 'green' }}>0.00</p>
            </div>
            <div style={{ padding: '20px', backgroundColor: '#fff3e0', borderRadius: '8px', border: '2px solid orange', textAlign: 'center' }}>
              <p style={{ fontSize: '12px', color: 'gray', marginBottom: '5px' }}>Pending Orders</p>
              <p style={{ fontSize: '32px', fontWeight: 'bold', color: 'orange' }}>0</p>
            </div>
          </div>
        </div>

        {/* My Products */}
        <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', border: '3px solid black', marginBottom: '20px', boxShadow: '4px 4px 0px black' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 'bold', margin: 0 }}>📦 My Products</h2>
            <button
              onClick={() => router.push('/merchant/products')}
              style={{
                padding: '10px 20px',
                backgroundColor: 'blue',
                color: 'white',
                border: '2px solid black',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              + Add Product
            </button>
          </div>

          {products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
              <p style={{ fontSize: '18px', color: 'gray', marginBottom: '10px' }}>No products yet</p>
              <p style={{ fontSize: '14px', color: 'gray' }}>Click "Add Product" to start selling!</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' }}>
              {products.map((product) => (
                <div key={product.id} style={{ padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '2px solid black' }}>
                  {product.imageUrl && (
                    <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px', marginBottom: '10px' }} />
                  )}
                  <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '5px' }}>{product.name}</h3>
                  <p style={{ fontSize: '20px', fontWeight: 'bold', color: 'green' }}>₱{product.price.toFixed(2)}</p>
                  <p style={{ fontSize: '12px', color: 'gray' }}>Stock: {product.stock}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <button
            onClick={() => router.push('/merchant/products')}
            style={{
              padding: '20px',
              backgroundColor: '#667eea',
              color: 'white',
              border: '3px solid black',
              borderRadius: '12px',
              fontWeight: 'bold',
              fontSize: '16px',
              cursor: 'pointer',
              boxShadow: '4px 4px 0px black'
            }}
          >
            📦 Manage Products
          </button>
          <button
            onClick={() => router.push('/merchant/orders')}
            style={{
              padding: '20px',
              backgroundColor: '#28a745',
              color: 'white',
              border: '3px solid black',
              borderRadius: '12px',
              fontWeight: 'bold',
              fontSize: '16px',
              cursor: 'pointer',
              boxShadow: '4px 4px 0px black'
            }}
          >
             View Orders
          </button>
          <button
            onClick={() => router.push('/')}
            style={{
              padding: '20px',
              backgroundColor: 'gray',
              color: 'white',
              border: '3px solid black',
              borderRadius: '12px',
              fontWeight: 'bold',
              fontSize: '16px',
              cursor: 'pointer',
              boxShadow: '4px 4px 0px black'
            }}
          >
            🏠 Go to Home
          </button>
        </div>
      </div>
    </main>
  )
}