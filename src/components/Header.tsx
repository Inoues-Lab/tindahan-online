'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Header() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [cartCount, setCartCount] = useState(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Check if user is logged in
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) setUser(data.user)
      })
      .catch(() => {})

    // Fetch Cart Count (Robust check)
    fetch('/api/cart')
      .then(res => res.json())
      .then(data => {
        // Try different possible names for the cart items array
        const items = data.cartItems || data.items || data.cart || []
        if (Array.isArray(items)) {
          const count = items.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0)
          setCartCount(count)
        }
      })
      .catch((err) => console.error('Cart fetch error:', err))

    // Detect Screen Size for Responsiveness
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile() // Run once on load
    window.addEventListener('resize', checkMobile) // Listen for rotation/resize
    
    return () => window.removeEventListener('resize', checkMobile)
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
        {/* Logo */}
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

        {/* DESKTOP NAV (Hidden on Mobile) */}
        <nav style={{ 
          display: isMobile ? 'none' : 'flex',
          gap: '16px', 
          alignItems: 'center'
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
                gap: '5px',
                backgroundColor: '#f0f0f0',
                padding: '8px 12px',
                borderRadius: '20px',
                border: '1px solid black'
              }}>
                 Cart
                {cartCount > 0 && (
                  <span style={{
                    backgroundColor: 'red',
                    color: 'white',
                    borderRadius: '50%',
                    padding: '2px 8px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    border: '1px solid black',
                    minWidth: '20px',
                    textAlign: 'center'
                  }}>
                    {cartCount}
                  </span>
                )}
              </Link>
              
              <Link href="/orders/my-orders" style={{ textDecoration: 'none', color: 'black', fontWeight: 'bold' }}>
                📦 Orders
              </Link>
              
              <Link href="/products" style={{ textDecoration: 'none', color: 'black', fontWeight: 'bold' }}>
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
                  cursor: 'pointer'
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
              border: '2px solid black'
            }}>
              Login
            </Link>
          )}
        </nav>

        {/* MOBILE MENU BUTTON (Visible only on Mobile) */}
        {user && (
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              display: isMobile ? 'block' : 'none',
              background: 'white',
              border: '2px solid black',
              borderRadius: '8px',
              padding: '8px 12px',
              cursor: 'pointer',
              fontSize: '20px',
              fontWeight: 'bold'
            }}
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        )}
        
        {/* Mobile Login Button if not logged in */}
        {!user && isMobile && (
           <Link href="/login" style={{ 
              padding: '6px 12px', 
              backgroundColor: 'blue', 
              color: 'white', 
              borderRadius: '8px', 
              textDecoration: 'none', 
              fontWeight: 'bold',
              fontSize: '12px',
              border: '2px solid black'
            }}>
              Login
            </Link>
        )}
      </div>

      {/* MOBILE DROPDOWN MENU */}
      {mobileMenuOpen && user && isMobile && (
        <div style={{
          backgroundColor: '#f9f9f9',
          borderTop: '2px solid black',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
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
            <span>🛒 My Cart</span>
            {cartCount > 0 && (
              <span style={{
                backgroundColor: 'red',
                color: 'white',
                borderRadius: '50%',
                padding: '4px 10px',
                fontSize: '14px',
                fontWeight: 'bold',
                border: '1px solid black'
              }}>
                {cartCount}
              </span>
            )}
          </Link>
          
          <Link 
            href="/orders/my-orders" 
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
      )}
    </header>
  )
}