'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'

export default function RiderDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [router])

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me')
      const data = await res.json()
      if (!data.user || data.user.role !== 'RIDER') {
        router.push('/')
        return
      }
      setUser(data.user)
    } catch (error) {
      router.push('/')
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
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '10px' }}>
          Welcome, Rider {user?.name}! 🏍️
        </h1>
        <p style={{ fontSize: '18px', color: 'gray', marginBottom: '30px' }}>
          Manage your deliveries and earnings
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          <button
            onClick={() => router.push('/rider/orders')}
            style={{
              padding: '40px',
              backgroundColor: '#28a745',
              color: 'white',
              border: '3px solid black',
              borderRadius: '12px',
              fontSize: '24px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '4px 4px 0px black',
              textAlign: 'center'
            }}
          >
             View Orders & Deliveries
          </button>

          <button
            onClick={() => router.push('/')}
            style={{
              padding: '40px',
              backgroundColor: 'white',
              color: 'black',
              border: '3px solid black',
              borderRadius: '12px',
              fontSize: '24px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '4px 4px 0px black',
              textAlign: 'center'
            }}
          >
            🏠 Go to Home
          </button>
        </div>
      </div>
    </main>
  )
}