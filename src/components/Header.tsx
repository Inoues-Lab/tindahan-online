'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Header() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [cartCount, setCartCount] = useState(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) setUser(data.user)
      })
      .catch(() => {})

    fetch('/api/cart')
      .then(res => res.json())
      .then(data => {
        if (data.cartItems) {
          const count = data.cartItems.reduce((sum: number, item: any) => sum + item.quantity, 0)
          setCartCount(count)
        }
      })
      .catch(() => {})
  }, [])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
    router.refresh()
  }

  return (
    <header style={{ 
      backgroundColor: 'white', 
      borderBottom: '2px solid black',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '12px 16px',
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center'
      }}>
        <Link href="/" style={{ 
          fontSize: '20px', 
          fontWeight: 'bold', 
          textDecoration: 'none', 
          color: 'black',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          🛒 Tindahan
        </Link>

        {/* Desktop Navigation */}
        <nav style={{ 
          display: { xs: 'none', md: 'flex' },
          gap: '16px', 
          alignItems: 'center',
          '@media (max-width: 768px)': {
            display: 'none'
          }
        }}>
          {user && (
            <>
              <Link href="/cart" style={{ 
                textDecoration: 'none', 
                color: 'black', 
                fontWeight: 'bold',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                Cart 
                {cartCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '-12px',
                    backgroundColor: 'red',
                    color: 'white',
                    borderRadius: '50%',
                    padding: '2px 6px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    border: '1px solid black',
                    minWidth: '18px',
                    textAlign: 'center'
                  }}>
                    {cartCount}
                  </span>
                )}
              </Link>
              
              <Link href="/orders" style={{ 
                textDecoration: 'none', 
                color: 'black', 
                fontWeight: 'bold',
                fontSize: '14px'
              }}>
                📦 Orders
              </Link>
              
              <Link href="/products" style={{ 
                textDecoration: 'none', 
                color: 'black', 
                fontWeight: 'bold',
                fontSize: '14px'
              }}>
                🛍️ Shop
              </Link>

              <button 
                onClick={handleLogout}
                style={{ 
                  padding: '8px 16px', 
                  backgroundColor: 'red', 
                  color: 'white', 
                  border: '2px solid black', 
                  borderRadius: '8px', 
                  fontWeight: 'bold', 
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Logout
              </button>
            </>
          )}

          {!user && (
            <Link href="/login" style={{ 
              padding: '8px 16px', 
              backgroundColor: 'blue', 
              color: 'white', 
              borderRadius: '8px', 
              textDecoration: 'none', 
              fontWeight: 'bold',
              fontSize: '14px',
              border: '2px solid black'
            }}>
              Login
            </Link>
          )}
        </nav>

        {/* Mobile Menu Button */}
        {user && (
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              display: 'none',
              '@media (max-width: 768px)': {
                display: 'block'
              },
              background: 'none',
              border: '2px solid black',
              borderRadius: '8px',
              padding: '8px 12px',
              cursor: 'pointer',
              fontSize: '20px'
            }}
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        )}
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && user && (
        <div style={{
          display: 'none',
          '@media (max-width: 768px)': {
            display: 'block'
          },
          backgroundColor: '#f9f9f9',
          borderTop: '2px solid black',
          padding: '16px'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Link 
              href="/cart" 
              onClick={() => setMobileMenuOpen(false)}
              style={{ 
                textDecoration: 'none', 
                color: 'black', 
                fontWeight: 'bold',
                padding: '12px',
                backgroundColor: 'white',
                borderRadius: '8px',
                border: '2px solid black',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <span>🛒 Cart</span>
              {cartCount > 0 && (
                <span style={{
                  backgroundColor: 'red',
                  color: 'white',
                  borderRadius: '50%',
                  padding: '4px 10px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  border: '1px solid black',
                  minWidth: '24px',
                  textAlign: 'center'
                }}>
                  {cartCount}
                </span>
              )}
            </Link>
            
            <Link 
              href="/orders" 
              onClick={() => setMobileMenuOpen(false)}
              style={{ 
                textDecoration: 'none', 
                color: 'black', 
                fontWeight: 'bold',
                padding: '12px',
                backgroundColor: 'white',
                borderRadius: '8px',
                border: '2px solid black'
              }}
            >
              📦 My Orders
            </Link>
            
            <Link 
              href="/products" 
              onClick={() => setMobileMenuOpen(false)}
              style={{ 
                textDecoration: 'none', 
                color: 'black', 
                fontWeight: 'bold',
                padding: '12px',
                backgroundColor: 'white',
                borderRadius: '8px',
                border: '2px solid black'
              }}
            >
              🛍️ Shop Products
            </Link>

            <button 
              onClick={() => {
                handleLogout()
                setMobileMenuOpen(false)
              }}
              style={{ 
                padding: '12px', 
                backgroundColor: 'red', 
                color: 'white', 
                border: '2px solid black', 
                borderRadius: '8px', 
                fontWeight: 'bold', 
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </header>
  )
}