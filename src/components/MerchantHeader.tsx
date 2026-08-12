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
      {/* Desktop Header */}
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '15px 30px',
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center'
      }}>
        <div 
          onClick={() => router.push('/merchant/dashboard')}
          style={{ 
            fontSize: '24px', 
            fontWeight: 'bold', 
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
           Tindahan Merchant
        </div>
        
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
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
              cursor: 'pointer',
              fontSize: '14px'
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
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            🛒 Orders
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
      </div>

      {/* Mobile Menu Toggle */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        style={{
          display: 'none',
          position: 'absolute',
          top: '15px',
          right: '15px',
          padding: '10px',
          backgroundColor: 'white',
          border: '2px solid black',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '24px',
          zIndex: 101
        }}
        className="mobile-menu-btn"
      >
        {menuOpen ? '✕' : '☰'}
      </button>

      {/* Mobile Menu */}
      {menuOpen && (
        <div style={{
          display: 'none',
          backgroundColor: 'white',
          borderTop: '2px solid black',
          padding: '20px',
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          zIndex: 100
        }} className="mobile-menu">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              onClick={() => {
                router.push('/merchant/dashboard')
                setMenuOpen(false)
              }}
              style={{
                padding: '15px',
                backgroundColor: 'white',
                color: 'black',
                border: '2px solid black',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '16px',
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
                padding: '15px',
                backgroundColor: 'white',
                color: 'black',
                border: '2px solid black',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '16px',
                textAlign: 'left'
              }}
            >
              📦 Products
            </button>
            <button
              onClick={() => {
                router.push('/merchant/orders')
                setMenuOpen(false)
              }}
              style={{
                padding: '15px',
                backgroundColor: 'white',
                color: 'black',
                border: '2px solid black',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '16px',
                textAlign: 'left'
              }}
            >
              🛒 Orders
            </button>
            <button
              onClick={() => {
                handleLogout()
                setMenuOpen(false)
              }}
              style={{
                padding: '15px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: '2px solid black',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '16px',
                textAlign: 'center',
                boxShadow: '3px 3px 0px black'
              }}
            >
              Logout
            </button>
          </div>
        </div>
      )}

      {/* Responsive CSS */}
      <style jsx>{`
        @media (max-width: 768px) {
          header > div:first-child {
            padding: 15px 20px;
          }
          
          header > div:first-child > div:last-child {
            display: none;
          }
          
          .mobile-menu-btn {
            display: block !important;
          }
          
          .mobile-menu {
            display: block !important;
          }
          
          header > div:first-child > div:first-child {
            font-size: 20px;
          }
        }
        
        @media (max-width: 480px) {
          header > div:first-child > div:first-child {
            font-size: 18px;
          }
          
          .mobile-menu button {
            padding: 12px !important;
            font-size: 14px !important;
          }
        }
      `}</style>
    </header>
  )
}