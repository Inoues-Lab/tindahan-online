'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Header() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    // Fetch user info
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) setUser(data.user)
      })
      .catch(() => {})

    // Fetch cart count
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
      padding: '15px 30px', 
      borderBottom: '2px solid black', 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <Link href="/" style={{ fontSize: '24px', fontWeight: 'bold', textDecoration: 'none', color: 'black' }}>
        🛒 Tindahan Online
      </Link>

      <nav style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        {user && (
          <>
            <Link href="/cart" style={{ textDecoration: 'none', color: 'black', fontWeight: 'bold', position: 'relative' }}>
              Cart 
              {cartCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-10px',
                  right: '-15px',
                  backgroundColor: 'red',
                  color: 'white',
                  borderRadius: '50%',
                  padding: '2px 6px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  border: '1px solid black'
                }}>
                  {cartCount}
                </span>
              )}
            </Link>
            
            <Link href="/orders" style={{ textDecoration: 'none', color: 'black', fontWeight: 'bold' }}>
              My Orders 📦
            </Link>
            
            <Link href="/products" style={{ textDecoration: 'none', color: 'black', fontWeight: 'bold' }}>
              Shop
            </Link>

            {/* Keep your custom buttons if you have them */}
            <Link href="/pabili" style={{ padding: '8px 16px', backgroundColor: '#ffc107', color: 'black', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', border: '2px solid black' }}>
              PABILI
            </Link>
            <Link href="/padala" style={{ padding: '8px 16px', backgroundColor: '#17a2b8', color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', border: '2px solid black' }}>
              PADALA
            </Link>
          </>
        )}

        {user ? (
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
        ) : (
          <Link href="/login" style={{ padding: '8px 16px', backgroundColor: 'blue', color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', border: '2px solid black' }}>
            Login
          </Link>
        )}
      </nav>
    </header>
  )
}