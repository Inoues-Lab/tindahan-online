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
          // Redirect based on role
          if (data.user.role === 'ADMIN') router.push('/admin')
          else if (data.user.role === 'RIDER') router.push('/rider')
          else if (data.user.role === 'MERCHANT') router.push('/merchant/dashboard')
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [router])

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
      <Header />
      
      {/* Hero Section */}
      <div style={{ 
        backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '80px 20px',
        textAlign: 'center',
        color: 'white'
      }}>
        <h1 style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '20px', textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
          🛒 Tindahan Online
        </h1>
        <p style={{ fontSize: '24px', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px' }}>
          Fresh groceries delivered to your door within the day!
        </p>
        
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap', maxWidth: '800px', margin: '0 auto' }}>
          <button
            onClick={() => router.push('/shop')}
            style={{
              padding: '20px 40px',
              backgroundColor: 'white',
              color: '#667eea',
              border: '3px solid black',
              borderRadius: '12px',
              fontWeight: 'bold',
              fontSize: '20px',
              cursor: 'pointer',
              boxShadow: '4px 4px 0px black',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translate(-2px, -2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translate(0, 0)'}
          >
            🛍️ Shop Now
          </button>
          
          <button
            onClick={() => router.push('/rider/apply')}
            style={{
              padding: '20px 40px',
              backgroundColor: '#28a745',
              color: 'white',
              border: '3px solid black',
              borderRadius: '12px',
              fontWeight: 'bold',
              fontSize: '20px',
              cursor: 'pointer',
              boxShadow: '4px 4px 0px black',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translate(-2px, -2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translate(0, 0)'}
          >
            🏍️ Become a Rider
          </button>
          
          <button
            onClick={() => router.push('/merchant/apply')}
            style={{
              padding: '20px 40px',
              backgroundColor: '#ffc107',
              color: 'black',
              border: '3px solid black',
              borderRadius: '12px',
              fontWeight: 'bold',
              fontSize: '20px',
              cursor: 'pointer',
              boxShadow: '4px 4px 0px black',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translate(-2px, -2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translate(0, 0)'}
          >
            🏪 Partner Merchant
          </button>
        </div>
      </div>

      {/* Features Section */}
      <div style={{ padding: '60px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '36px', fontWeight: 'bold', textAlign: 'center', marginBottom: '50px' }}>
          Why Choose Tindahan Online?
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
          {/* Feature 1 */}
          <div style={{ 
            backgroundColor: 'white', 
            padding: '30px', 
            borderRadius: '12px', 
            border: '3px solid black',
            boxShadow: '4px 4px 0px black',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '60px', marginBottom: '20px' }}>🚚</div>
            <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '15px' }}>Same-Day Delivery</h3>
            <p style={{ color: 'gray', fontSize: '16px' }}>
              Order before 2 PM and get your groceries delivered the same day!
            </p>
          </div>

          {/* Feature 2 */}
          <div style={{ 
            backgroundColor: 'white', 
            padding: '30px', 
            borderRadius: '12px', 
            border: '3px solid black',
            boxShadow: '4px 4px 0px black',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '60px', marginBottom: '20px' }}>💰</div>
            <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '15px' }}>Best Prices</h3>
            <p style={{ color: 'gray', fontSize: '16px' }}>
              Competitive prices with transparent pricing. No hidden fees!
            </p>
          </div>

          {/* Feature 3 */}
          <div style={{ 
            backgroundColor: 'white', 
            padding: '30px', 
            borderRadius: '12px', 
            border: '3px solid black',
            boxShadow: '4px 4px 0px black',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '60px', marginBottom: '20px' }}>🛡️</div>
            <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '15px' }}>Secure & Safe</h3>
            <p style={{ color: 'gray', fontSize: '16px' }}>
              Verified riders and merchants. Your safety is our priority!
            </p>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div style={{ backgroundColor: '#f0f8ff', padding: '60px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '36px', fontWeight: 'bold', textAlign: 'center', marginBottom: '50px' }}>
            How It Works
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                width: '80px', 
                height: '80px', 
                backgroundColor: '#667eea', 
                color: 'white', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: '32px',
                fontWeight: 'bold',
                margin: '0 auto 20px',
                border: '3px solid black'
              }}>
                1
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px' }}>Browse & Order</h3>
              <p style={{ color: 'gray' }}>Shop from your favorite local stores</p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                width: '80px', 
                height: '80px', 
                backgroundColor: '#28a745', 
                color: 'white', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: '32px',
                fontWeight: 'bold',
                margin: '0 auto 20px',
                border: '3px solid black'
              }}>
                2
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px' }}>We Process</h3>
              <p style={{ color: 'gray' }}>Our team picks and packs your order</p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                width: '80px', 
                height: '80px', 
                backgroundColor: '#ffc107', 
                color: 'black', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: '32px',
                fontWeight: 'bold',
                margin: '0 auto 20px',
                border: '3px solid black'
              }}>
                3
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px' }}>Fast Delivery</h3>
              <p style={{ color: 'gray' }}>Tracked delivery right to your door</p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action Footer */}
      <div style={{ 
        backgroundColor: '#2c3e50', 
        color: 'white', 
        padding: '40px 20px', 
        textAlign: 'center'
      }}>
        <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '20px' }}>
          Ready to Get Started?
        </h2>
        <p style={{ fontSize: '18px', marginBottom: '30px' }}>
          Join thousands of satisfied customers in your area!
        </p>
        <button
          onClick={() => router.push('/register')}
          style={{
            padding: '15px 40px',
            backgroundColor: '#667eea',
            color: 'white',
            border: '3px solid black',
            borderRadius: '12px',
            fontWeight: 'bold',
            fontSize: '18px',
            cursor: 'pointer',
            boxShadow: '4px 4px 0px black'
          }}
        >
          Create Free Account
        </button>
        
        <p style={{ marginTop: '30px', fontSize: '14px', color: '#95a5a6' }}>
          © 2024 Tindahan Online. All rights reserved.
        </p>
      </div>
    </main>
  )
}