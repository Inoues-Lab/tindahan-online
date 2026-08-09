// src/components/Header.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Header() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => setUser(data.user))
      .catch(() => setUser(null))
    
    fetchCartCount()
  }, [])

  const fetchCartCount = async () => {
    try {
      const res = await fetch('/api/cart')
      const data = await res.json()
      if (res.ok) {
        setCartCount(data.items?.length || 0)
      }
    } catch (error) {
      console.error('Error fetching cart:', error)
    }
  }

  const handleLogout = () => {
    document.cookie = 'userId=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    document.cookie = 'userRole=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    router.push('/')
    window.location.reload()
  }

  return (
    <header style={{ 
      backgroundColor: 'white', 
      borderBottom: '3px solid black', 
      padding: '12px 15px',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div 
          onClick={() => router.push('/')}
          style={{ 
            fontSize: '20px', 
            fontWeight: 'bold', 
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flex: '1 1 auto'
          }}
        >
          🛒 Tindahan Online
        </div>

        <nav style={{ 
          display: 'flex', 
          gap: '8px', 
          alignItems: 'center',
          flexWrap: 'wrap',
          flex: '0 0 auto'
        }}>
          {user ? (
            <>
              {user.role === 'CUSTOMER' && (
                <>
                  <a href="/cart" style={{ 
                    textDecoration: 'none', 
                    color: 'black', 
                    fontWeight: 'bold',
                    fontSize: '14px',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    Cart 🛒
                    {cartCount > 0 && (
                      <span style={{ 
                        position: 'absolute',
                        top: '-8px',
                        right: '-8px',
                        backgroundColor: 'red',
                        color: 'white',
                        borderRadius: '50%',
                        width: '20px',
                        height: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '11px',
                        fontWeight: 'bold'
                      }}>
                        {cartCount}
                      </span>
                    )}
                  </a>
                  <a href="/orders/my-orders" style={{ 
                    textDecoration: 'none', 
                    color: 'black', 
                    fontWeight: 'bold',
                    fontSize: '14px'
                  }}>
                    My Orders 📦
                  </a>
                  <a href="/" style={{ 
                    textDecoration: 'none', 
                    color: 'black', 
                    fontWeight: 'bold',
                    fontSize: '14px'
                  }}>
                    Shop
                  </a>
                  
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <a href="/pabili" style={{ 
                      padding: '8px 12px', 
                      backgroundColor: '#ffc107',
                      color: 'black', 
                      borderRadius: '6px', 
                      border: '2px solid black', 
                      fontWeight: 'bold', 
                      textDecoration: 'none',
                      fontSize: '12px',
                      whiteSpace: 'nowrap'
                    }}>
                       PABILI
                    </a>
                    <a href="/padala" style={{ 
                      padding: '8px 12px', 
                      backgroundColor: '#17a2b8',
                      color: 'white', 
                      borderRadius: '6px', 
                      border: '2px solid black', 
                      fontWeight: 'bold', 
                      textDecoration: 'none',
                      fontSize: '12px',
                      whiteSpace: 'nowrap'
                    }}>
                      📦 PADALA
                    </a>
                  </div>
                </>
              )}
              
              {user.role === 'RIDER' && (
                <a href="/rider" style={{ 
                  textDecoration: 'none', 
                  color: 'black', 
                  fontWeight: 'bold',
                  fontSize: '14px'
                }}>
                  Rider
                </a>
              )}
              
              {user.role === 'ADMIN' && (
                <a href="/admin" style={{ 
                  textDecoration: 'none', 
                  color: 'black', 
                  fontWeight: 'bold',
                  fontSize: '14px'
                }}>
                  Admin
                </a>
              )}
              
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
                  fontSize: '14px',
                  whiteSpace: 'nowrap'
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={() => router.push('/login')}
              style={{
                padding: '8px 16px',
                backgroundColor: 'blue',
                color: 'white',
                border: '2px solid black',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Login
            </button>
          )}
        </nav>
      </div>
    </header>
  )
}