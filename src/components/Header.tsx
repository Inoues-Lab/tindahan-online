// src/components/Header.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Header() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => setUser(data.user))
      .catch(() => setUser(null))
  }, [])

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
      padding: '15px 20px',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
      }}>
        <div 
          onClick={() => router.push('/')}
          style={{ 
            fontSize: '24px', 
            fontWeight: 'bold', 
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
           Tindahan Online
        </div>

        <nav style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          {user ? (
            <>
              {user.role === 'CUSTOMER' && (
                <>
                  <a href="/cart" style={{ 
                    textDecoration: 'none', 
                    color: 'black', 
                    fontWeight: 'bold',
                    fontSize: '16px',
                    position: 'relative'
                  }}>
                    Cart 🛒
                    {/* Cart badge would go here */}
                  </a>
                  <a href="/orders/my-orders" style={{ 
                    textDecoration: 'none', 
                    color: 'black', 
                    fontWeight: 'bold',
                    fontSize: '16px'
                  }}>
                    My Orders 
                  </a>
                  <a href="/" style={{ 
                    textDecoration: 'none', 
                    color: 'black', 
                    fontWeight: 'bold',
                    fontSize: '16px'
                  }}>
                    Shop
                  </a>
                  
                  {/* PABILI and PADALA Buttons */}
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <a href="/pabili" style={{ 
                      padding: '10px 20px', 
                      backgroundColor: '#ffc107',
                      color: 'black', 
                      borderRadius: '8px', 
                      border: '2px solid black', 
                      fontWeight: 'bold', 
                      textDecoration: 'none',
                      fontSize: '14px',
                      boxShadow: '2px 2px 0px black'
                    }}>
                      🛒 PABILI
                    </a>
                    <a href="/padala" style={{ 
                      padding: '10px 20px', 
                      backgroundColor: '#17a2b8',
                      color: 'white', 
                      borderRadius: '8px', 
                      border: '2px solid black', 
                      fontWeight: 'bold', 
                      textDecoration: 'none',
                      fontSize: '14px',
                      boxShadow: '2px 2px 0px black'
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
                  fontSize: '16px'
                }}>
                  Rider
                </a>
              )}
              
              {user.role === 'ADMIN' && (
                <a href="/admin" style={{ 
                  textDecoration: 'none', 
                  color: 'black', 
                  fontWeight: 'bold',
                  fontSize: '16px'
                }}>
                  Admin
                </a>
              )}
              
              <button
                onClick={handleLogout}
                style={{
                  padding: '10px 20px',
                  backgroundColor: 'red',
                  color: 'white',
                  border: '2px solid black',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '16px',
                  boxShadow: '2px 2px 0px black'
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={() => router.push('/login')}
              style={{
                padding: '10px 20px',
                backgroundColor: 'blue',
                color: 'white',
                border: '2px solid black',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '16px',
                boxShadow: '2px 2px 0px black'
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