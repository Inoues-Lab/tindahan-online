'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import NotificationBell from '@/components/NotificationBell'

export default function MerchantHeader() {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch (error) {
      // Ignore
    }
    window.location.href = '/'
  }

  const buttonStyle = {
    padding: '10px 20px',
    backgroundColor: 'white',
    color: 'black',
    border: '2px solid black',
    borderRadius: '8px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '14px'
  }

  return (
    <header style={{ backgroundColor: 'white', borderBottom: '3px solid black', position: 'sticky', top: 0, zIndex: 100 }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div onClick={() => router.push('/merchant/dashboard')} style={{ fontSize: '20px', fontWeight: 'bold', cursor: 'pointer' }}>
          🏪 Tindahan Merchant
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div className="desktop-nav" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button onClick={() => router.push('/merchant/dashboard')} style={buttonStyle}>Dashboard</button>
            <button onClick={() => router.push('/merchant/products')} style={buttonStyle}>Products</button>
            <button onClick={() => router.push('/merchant/orders')} style={buttonStyle}>Orders</button>
            <button onClick={() => router.push('/merchant/income')} style={buttonStyle}>💰 Income</button>
            <button onClick={handleLogout} style={{ ...buttonStyle, backgroundColor: '#dc3545', color: 'white', boxShadow: '3px 3px 0px black' }}>Logout</button>
          </div>

          <NotificationBell />

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="mobile-menu-btn"
            style={{ display: 'none', padding: '10px 15px', backgroundColor: 'white', border: '2px solid black', borderRadius: '8px', cursor: 'pointer', fontSize: '24px' }}
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div style={{ backgroundColor: 'white', borderTop: '2px solid black', padding: '15px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button onClick={() => { router.push('/merchant/dashboard'); setMenuOpen(false) }} style={{ ...buttonStyle, textAlign: 'left', padding: '12px' }}> Dashboard</button>
            <button onClick={() => { router.push('/merchant/products'); setMenuOpen(false) }} style={{ ...buttonStyle, textAlign: 'left', padding: '12px' }}>📦 Products</button>
            <button onClick={() => { router.push('/merchant/orders'); setMenuOpen(false) }} style={{ ...buttonStyle, textAlign: 'left', padding: '12px' }}>🛍️ Orders</button>
            <button onClick={() => { router.push('/merchant/income'); setMenuOpen(false) }} style={{ ...buttonStyle, textAlign: 'left', padding: '12px' }}>💰 Income</button>
            <button onClick={() => { setMenuOpen(false); handleLogout() }} style={{ ...buttonStyle, padding: '12px', backgroundColor: '#dc3545', color: 'white', textAlign: 'center', boxShadow: '3px 3px 0px black' }}>Logout</button>
          </div>
        </div>
      )}

      <style jsx global>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
        @media (min-width: 769px) {
          .desktop-nav { display: flex !important; }
          .mobile-menu-btn { display: none !important; }
        }
      `}</style>
    </header>
  )
}
