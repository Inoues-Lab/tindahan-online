'use client'

import { useRouter } from 'next/navigation'

export default function MerchantHeader() {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <header style={{ 
      backgroundColor: 'white', 
      borderBottom: '3px solid black',
      padding: '15px 30px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <div 
        onClick={() => router.push('/merchant/dashboard')}
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          cursor: 'pointer',
          fontSize: '24px',
          fontWeight: 'bold'
        }}
      >
        <span style={{ fontSize: '28px', marginRight: '10px' }}>🏪</span>
        <span>Tindahan Merchant</span>
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={() => router.push('/merchant/dashboard')}
          style={{
            padding: '10px 20px',
            backgroundColor: 'white',
            color: 'black',
            border: '2px solid black',
            borderRadius: '8px',
            fontWeight: 'bold',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          📊 Dashboard
        </button>
        <button
          onClick={() => router.push('/merchant/products')}
          style={{
            padding: '10px 20px',
            backgroundColor: 'white',
            color: 'black',
            border: '2px solid black',
            borderRadius: '8px',
            fontWeight: 'bold',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          📦 Products
        </button>
        <button
          onClick={() => router.push('/merchant/orders')}
          style={{
            padding: '10px 20px',
            backgroundColor: 'white',
            color: 'black',
            border: '2px solid black',
            borderRadius: '8px',
            fontWeight: 'bold',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          ️ Orders
        </button>
        <button
          onClick={handleLogout}
          style={{
            padding: '10px 24px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: '2px solid black',
            borderRadius: '8px',
            fontWeight: 'bold',
            fontSize: '14px',
            cursor: 'pointer',
            boxShadow: '3px 3px 0px black'
          }}
        >
          Logout
        </button>
      </div>
    </header>
  )
}