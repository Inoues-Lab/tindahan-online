'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import NotificationBell from '@/components/NotificationBell'

export default function Header() {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me')
      const data = await res.json()
      setUser(data.user || null)
    } catch (error) {
      setUser(null)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch (error) {
      // Ignore
    }
    window.location.href = '/'
  }

  const buttonStyle = {
    padding: '10px 16px',
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
        <div onClick={() => router.push('/')} style={{ fontSize: '20px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
          🛒 Tindahan
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div className="desktop-nav" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {user ? (
              <>
                <button onClick={() => router.push('/shop')} style={buttonStyle}>🛍️ Shop</button>
                <button onClick={() => router.push('/pabili')} style={buttonStyle}>🏃 Pabili</button>
                <button onClick={() => router.push('/padala')} style={buttonStyle}>📦 Padala</button>
                <button onClick={() => router.push('/cart')} style={buttonStyle}>🛒 Cart</button>
                <button onClick={() => router.push('/orders')} style={buttonStyle}>📋 Orders</button>
                <button onClick={handleLogout} style={{ ...buttonStyle, backgroundColor: '#dc3545', color: 'white', boxShadow: '3px 3px 0px black' }}>Logout</button>
              </>
            ) : (
              <>
                <button onClick={() => router.push('/login')} style={buttonStyle}>Login</button>
                <button onClick={() => router.push('/register')} style={{ ...buttonStyle, backgroundColor: '#4caf50', color: 'white', boxShadow: '3px 3px 0px black' }}>Register</button>
              </>
            )}
          </div>

          {user && <NotificationBell />}

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
            {user ? (
              <>
                <button onClick={() => { router.push('/shop'); setMenuOpen(false) }} style={{ ...buttonStyle, textAlign: 'left', padding: '12px' }}>🛍️ Shop</button>
                <button onClick={() => { router.push('/pabili'); setMenuOpen(false) }} style={{ ...buttonStyle, textAlign: 'left', padding: '12px' }}>🏃 Pabili</button>
                <button onClick={() => { router.push('/padala'); setMenuOpen(false) }} style={{ ...buttonStyle, textAlign: 'left', padding: '12px' }}>📦 Padala</button>
                <button onClick={() => { router.push('/cart'); setMenuOpen(false) }} style={{ ...buttonStyle, textAlign: 'left', padding: '12px' }}>🛒 Cart</button>
                <button onClick={() => { router.push('/orders'); setMenuOpen(false) }} style={{ ...buttonStyle, textAlign: 'left', padding: '12px' }}>📋 Orders</button>
                <button onClick={() => { setMenuOpen(false); handleLogout() }} style={{ ...buttonStyle, padding: '12px', backgroundColor: '#dc3545', color: 'white', textAlign: 'center', boxShadow: '3px 3px 0px black' }}>Logout</button>
              </>
            ) : (
              <>
                <button onClick={() => { router.push('/login'); setMenuOpen(false) }} style={{ ...buttonStyle, textAlign: 'left', padding: '12px' }}>🔑 Login</button>
                <button onClick={() => { router.push('/register'); setMenuOpen(false) }} style={{ ...buttonStyle, padding: '12px', backgroundColor: '#4caf50', color: 'white', textAlign: 'center', boxShadow: '3px 3px 0px black' }}>✍️ Register</button>
              </>
            )}
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
