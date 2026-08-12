'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function MerchantHeader() {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
  }

  return (
    <header style={{ 
      backgroundColor: 'white', 
      borderBottom: '3px solid black',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '15px 20px',
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center'
      }}>
        <div 
          onClick={() => router.push('/merchant/dashboard')}
          style={{ 
            fontSize: '20px', 
            fontWeight: 'bold', 
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
           Tindahan Merchant
        </div>
        
        {/* Desktop Navigation - Hidden on Mobile */}
        <div className="desktop-nav" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={() => router.push('/merchant/dashboard')}
            style={{
              padding: '10px 20px',
              backgroundColor: 'white',
              color: 'black',
              border: '2px solid black',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
             Dashboard
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
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
             Products
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
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
             Orders
          </button>
          <button
            onClick={handleLogout}
            style={{
              padding: '10px 20px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: '2px solid black',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '14px',
              boxShadow: '3px 3px 0px black'
            }}
          >
            Logout
          </button>
        </div>

        {/* Mobile Menu Toggle - Hidden on Desktop */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="mobile-menu-btn"
          style={{
            display: 'none',
            padding: '10px 15px',
            backgroundColor: 'white',
            border: '2px solid black',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '24px',
            marginLeft: '10px'
          }}
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <div className="mobile-menu" style={{
          backgroundColor: 'white',
          borderTop: '2px solid black',
          padding: '15px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              onClick={() => {
                router.push('/merchant/dashboard')
                setMenuOpen(false)
              }}
              style={{
                padding: '12px',
                backgroundColor: 'white',
                color: 'black',
                border: '2px solid black',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
               Dashboard
            </button>
            <button
              onClick={() => {
                router.push('/merchant/products')
                setMenuOpen(false)
              }}
              style={{
                padding: '12px',
                backgroundColor: 'white',
                color: 'black',
                border: '2px solid black',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
               Products
            </button>
            <button
              onClick={() => {
                router.push('/merchant/orders')
                setMenuOpen(false)
              }}
              style={{
                padding: '12px',
                backgroundColor: 'white',
                color: 'black',
                border: '2px solid black',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
               Orders
            </button>
            <button
              onClick={() => {
                handleLogout()
                setMenuOpen(false)
              }}
              style={{
                padding: '12px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: '2px solid black',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer',
                textAlign: 'center',
                boxShadow: '3px 3px 0px black'
              }}
            >
              Logout
            </button>
          </div>
        </div>
      )}

      {/* Responsive CSS - Forces proper display */}
      <style jsx global>{`
        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-menu-btn {
            display: block !important;
          }
        }
        @media (min-width: 769px) {
          .desktop-nav {
            display: flex !important;
          }
          .mobile-menu-btn {
            display: none !important;
          }
        }
      `}</style>
    </header>
  )
}