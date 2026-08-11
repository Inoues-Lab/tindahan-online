'use client'

import { useRouter } from 'next/navigation'

export default function AdminHeader() {
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
        onClick={() => router.push('/admin/dashboard')}
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          cursor: 'pointer',
          fontSize: '24px',
          fontWeight: 'bold'
        }}
      >
        <span style={{ fontSize: '28px', marginRight: '10px' }}>🛒</span>
        <span>Tindahan Admin</span>
      </div>

      <button
        onClick={handleLogout}
        style={{
          padding: '10px 24px',
          backgroundColor: '#dc3545',
          color: 'white',
          border: '2px solid black',
          borderRadius: '8px',
          fontWeight: 'bold',
          fontSize: '16px',
          cursor: 'pointer',
          boxShadow: '3px 3px 0px black'
        }}
      >
        Logout
      </button>
    </header>
  )
}