// src/components/Header.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Header() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    // Fetch user info
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        setUser(data.user)
      })
      .catch(() => setUser(null))

    // Load cart count
    const loadCartCount = () => {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]')
      const count = cart.reduce((sum: number, item: any) => sum + item.quantity, 0)
      setCartCount(count)
    }

    loadCartCount()
    
    // Listen for cart updates
    window.addEventListener('storage', loadCartCount)
    window.addEventListener('cartUpdated', loadCartCount)
    
    return () => {
      window.removeEventListener('storage', loadCartCount)
      window.removeEventListener('cartUpdated', loadCartCount)
    }
  }, [])

  const handleLogout = () => {
    // Clear auth cookies
    document.cookie = 'userId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/'
    document.cookie = 'userRole=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/'
    // DON'T clear localStorage cart - keep it for when they login again
    router.push('/')
    router.refresh()
  }

  return (
    <header style={{ backgroundColor: 'white', borderBottom: '2px solid black', padding: '15px 20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" style={{ fontSize: '24px', fontWeight: 'bold', color: 'black', textDecoration: 'none' }}>
          🛒 Tindahan Online
        </Link>
        
        <nav style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          {user ? (
            <>
              {user.role === 'ADMIN' && (
                <Link href="/admin" style={{ color: 'black', textDecoration: 'none', fontWeight: 'bold' }}>
                  Admin
                </Link>
              )}
              {user.role === 'RIDER' && (
                <Link href="/rider" style={{ color: 'black', textDecoration: 'none', fontWeight: 'bold' }}>
                  Rider
                </Link>
              )}
              {user.role === 'CUSTOMER' && (
                <>
                  <Link href="/cart" style={{ color: 'black', textDecoration: 'none', fontWeight: 'bold', position: 'relative' }}>
                    Cart 🛒
                    {cartCount > 0 && (
                      <span style={{
                        position: 'absolute',
                        top: '-8px',
                        right: '-15px',
                        backgroundColor: 'red',
                        color: 'white',
                        borderRadius: '50%',
                        width: '20px',
                        height: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        {cartCount}
                      </span>
                    )}
                  </Link>
                  <Link href="/orders/my-orders" style={{ color: 'black', textDecoration: 'none', fontWeight: 'bold' }}>
                    My Orders 📦
                  </Link>
                  <Link href="/" style={{ color: 'black', textDecoration: 'none', fontWeight: 'bold' }}>
                    Shop
                  </Link>
                </>
              )}
              <button
                onClick={handleLogout}
                style={{
                  backgroundColor: 'red',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '2px solid black',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <Link href="/login" style={{ backgroundColor: 'blue', color: 'white', padding: '8px 16px', borderRadius: '8px', border: '2px solid black', fontWeight: 'bold', textDecoration: 'none' }}>
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}