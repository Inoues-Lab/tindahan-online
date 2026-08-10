'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'

export default function HomePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleMerchantClick = () => {
    if (user) {
      // User is logged in - go straight to apply
      router.push('/merchant/apply')
    } else {
      // User is NOT logged in - go to register first
      router.push('/register?role=MERCHANT')
    }
  }

  const handleRiderClick = () => {
    if (user) {
      router.push('/rider/apply')
    } else {
      router.push('/register?role=RIDER')
    }
  }

  const handleShopClick = () => {
    if (user) {
      router.push('/products')
    } else {
      router.push('/register?role=CUSTOMER')
    }
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
      <Header />
      
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '80px 20px',
        textAlign: 'center',
        color: 'white'
      }}>
        <h1 style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '20px' }}>
          🛒 Tindahan Online
        </h1>
        <p style={{ fontSize: '24px', marginBottom: '40px' }}>
          Fresh groceries delivered to your door within the day!
        </p>
        
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={handleShopClick}
            style={{
              padding: '20px 40px',
              backgroundColor: 'white',
              color: '#667eea',
              border: '3px solid black',
              borderRadius: '12px',
              fontWeight: 'bold',
              fontSize: '20px',
              cursor: 'pointer',
              boxShadow: '4px 4px 0px black'
            }}
          >
            🛒 Shop Now
          </button>
          
          <button
            onClick={handleRiderClick}
            style={{
              padding: '20px 40px',
              backgroundColor: '#28a745',
              color: 'white',
              border: '3px solid black',
              borderRadius: '12px',
              fontWeight: 'bold',
              fontSize: '20px',
              cursor: 'pointer',
              boxShadow: '4px 4px 0px black'
            }}
          >
            🏍️ Become a Rider
          </button>
          
          <button
            onClick={handleMerchantClick}
            style={{
              padding: '20px 40px',
              backgroundColor: '#ffc107',
              color: 'black',
              border: '3px solid black',
              borderRadius: '12px',
              fontWeight: 'bold',
              fontSize: '20px',
              cursor: 'pointer',
              boxShadow: '4px 4px 0px black'
            }}
          >
            🏪 Partner Merchant
          </button>
        </div>
      </div>

      <div style={{ padding: '60px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '36px', fontWeight: 'bold', textAlign: 'center', marginBottom: '50px' }}>
          Why Choose Tindahan Online?
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', border: '3px solid black', boxShadow: '4px 4px 0px black', textAlign: 'center' }}>
            <div style={{ fontSize: '60px', marginBottom: '20px' }}></div>
            <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '15px' }}>Same-Day Delivery</h3>
            <p style={{ color: 'gray', fontSize: '16px' }}>Order before 2 PM and get your groceries delivered the same day!</p>
          </div>

          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', border: '3px solid black', boxShadow: '4px 4px 0px black', textAlign: 'center' }}>
            <div style={{ fontSize: '60px', marginBottom: '20px' }}>💰</div>
            <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '15px' }}>Best Prices</h3>
            <p style={{ color: 'gray', fontSize: '16px' }}>Competitive prices with transparent pricing. No hidden fees!</p>
          </div>

          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', border: '3px solid black', boxShadow: '4px 4px 0px black', textAlign: 'center' }}>
            <div style={{ fontSize: '60px', marginBottom: '20px' }}>🛡️</div>
            <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '15px' }}>Secure & Safe</h3>
            <p style={{ color: 'gray', fontSize: '16px' }}>Verified riders and merchants. Your safety is our priority!</p>
          </div>
        </div>
      </div>

      <div style={{ backgroundColor: '#2c3e50', color: 'white', padding: '40px 20px', textAlign: 'center' }}>
        <p style={{ fontSize: '14px', color: '#95a5a6' }}>
          © 2024 Tindahan Online. All rights reserved.
        </p>
      </div>
    </main>
  )
}