'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function RiderDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [profileStatus, setProfileStatus] = useState<string>('')

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me')
      const data = await res.json()
      
      if (!data.user) {
        router.push('/login')
        return
      }
      
      if (data.user.role !== 'RIDER') {
        router.push('/') // Redirect non-riders to home
        return
      }
      
      setUser(data.user)
      setProfileStatus(data.user.riderProfile?.status || 'NONE')
    } catch (error) {
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
  }

  if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>Loading...</div>

  // 🚫 BLOCK REJECTED USERS
  if (profileStatus === 'REJECTED') {
    return (
      <main style={{ minHeight: '100vh', backgroundColor: '#f9f9f9', display: 'flex', flexDirection: 'column' }}>
        <header style={{ padding: '15px 30px', display: 'flex', justifyContent: 'flex-end', borderBottom: '3px solid black', backgroundColor: 'white' }}>
          <button onClick={handleLogout} style={{ padding: '10px 20px', backgroundColor: '#dc3545', color: 'white', border: '2px solid black', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Logout</button>
        </header>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', border: '3px solid black', boxShadow: '4px 4px 0px black', textAlign: 'center', maxWidth: '500px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '20px', color: 'red' }}>❌ Application Rejected</h1>
            <p style={{ fontSize: '16px', color: 'gray', marginBottom: '30px' }}>Your rider application was not approved. You cannot access the dashboard.</p>
            <button onClick={() => router.push('/')} style={{ padding: '15px 30px', backgroundColor: '#2196f3', color: 'white', border: '2px solid black', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '3px 3px 0px black' }}>Go to Home</button>
          </div>
        </div>
      </main>
    )
  }

  // ⏳ PENDING USERS
  if (profileStatus === 'PENDING' || profileStatus === 'NONE') {
    return (
      <main style={{ minHeight: '100vh', backgroundColor: '#f9f9f9', display: 'flex', flexDirection: 'column' }}>
        <header style={{ padding: '15px 30px', display: 'flex', justifyContent: 'flex-end', borderBottom: '3px solid black', backgroundColor: 'white' }}>
          <button onClick={handleLogout} style={{ padding: '10px 20px', backgroundColor: '#dc3545', color: 'white', border: '2px solid black', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Logout</button>
        </header>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', border: '3px solid black', boxShadow: '4px 4px 0px black', textAlign: 'center', maxWidth: '500px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '20px' }}>⏳ Waiting for Approval</h1>
            <p style={{ fontSize: '16px', color: 'gray', marginBottom: '20px' }}>Your rider application is currently under review by the admin.</p>
            <div style={{ backgroundColor: '#fff3cd', padding: '15px', borderRadius: '8px', marginBottom: '20px', fontWeight: 'bold', color: '#856404' }}>Current Status: {profileStatus === 'NONE' ? 'NOT SUBMITTED' : 'PENDING'}</div>
            <button onClick={() => router.push(profileStatus === 'NONE' ? '/rider/apply' : '/')} style={{ padding: '15px 30px', backgroundColor: '#2196f3', color: 'white', border: '2px solid black', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '3px 3px 0px black' }}>{profileStatus === 'NONE' ? 'Submit Application' : 'Go to Home'}</button>
          </div>
        </div>
      </main>
    )
  }

  // ✅ APPROVED USERS (Normal Dashboard)
  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
      <header style={{ backgroundColor: 'white', borderBottom: '3px solid black', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '24px', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => router.push('/rider/dashboard')}>🏍️ Tindahan Rider</div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => router.push('/rider/orders')} style={{ padding: '10px 20px', backgroundColor: 'white', color: 'black', border: '2px solid black', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>My Deliveries</button>
          <button onClick={handleLogout} style={{ padding: '10px 20px', backgroundColor: '#dc3545', color: 'white', border: '2px solid black', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Logout</button>
        </div>
      </header>
      
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '30px 20px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '5px' }}>Welcome, Rider {user?.name}! 🏍️</h1>
        <p style={{ fontSize: '16px', color: 'gray', marginBottom: '30px' }}>Manage your deliveries and earnings</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          <button onClick={() => router.push('/rider/orders')} style={{ padding: '40px', backgroundColor: '#28a745', color: 'white', border: '3px solid black', borderRadius: '12px', fontSize: '24px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '4px 4px 0px black', textAlign: 'center' }}>
             View Orders & Deliveries
          </button>
          <button onClick={() => router.push('/')} style={{ padding: '40px', backgroundColor: 'white', color: 'black', border: '3px solid black', borderRadius: '12px', fontSize: '24px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '4px 4px 0px black', textAlign: 'center' }}>
            🏠 Go to Home
          </button>
        </div>
      </div>
    </main>
  )
}