// src/components/Header.tsx
'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/context/CartContext'

function CartCountBadge() {
  const { cartCount } = useCart()

  if (cartCount === 0) return null

  return (
    <span style={{
      position: 'absolute',
      top: '-8px',
      right: '-15px',
      backgroundColor: 'red',
      color: 'white',
      borderRadius: '50%',
      padding: '2px 6px',
      fontSize: '12px',
      fontWeight: 'bold',
      minWidth: '18px',
      textAlign: 'center'
    }}>
      {cartCount}
    </span>
  )
}

export default function Header() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userRole, setUserRole] = useState<string>('')
  const [userName, setUserName] = useState<string>('')

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me')
      const data = await response.json()
      
      if (data.user) {
        setIsLoggedIn(true)
        setUserRole(data.user.role)
        setUserName(data.user.name)
      } else {
        setIsLoggedIn(false)
        setUserRole('')
        setUserName('')
      }
    } catch (error) {
      console.error('Auth check error:', error)
      setIsLoggedIn(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      localStorage.clear()
      setIsLoggedIn(false)
      setUserRole('')
      setUserName('')
      window.location.href = '/'
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <header style={{ backgroundColor: 'white', borderBottom: '3px solid black', padding: '15px 20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: 'black', margin: 0 }}>🛒 Tindahan Online</h1>
        </Link>

        <nav style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          {(!isLoggedIn || userRole === 'CUSTOMER') && (
            <Link href="/cart" style={{ 
              textDecoration: 'none', 
              color: 'black', 
              fontWeight: 'bold',
              fontSize: '16px',
              position: 'relative'
            }}>
              Cart 🛒
              <CartCountBadge />
            </Link>
          )}

          {userRole === 'CUSTOMER' && (
            <Link href="/orders/my-orders" style={{ 
              textDecoration: 'none', 
              color: 'black', 
              fontWeight: 'bold',
              fontSize: '16px'
            }}>
              My Orders 📦
            </Link>
          )}

          {userRole === 'ADMIN' && (
            <Link href="/admin/products" style={{ 
              textDecoration: 'none', 
              color: 'black', 
              fontWeight: 'bold',
              fontSize: '16px'
            }}>
              Products 📦
            </Link>
          )}

          {/* ONLY customers see Shop link - NOT riders or admin */}
          {userRole === 'CUSTOMER' && (
            <Link href="/" style={{ 
              textDecoration: 'none', 
              color: 'black', 
              fontWeight: 'bold',
              fontSize: '16px'
            }}>
              Shop
            </Link>
          )}

          {isLoggedIn ? (
            <>
              {userRole === 'RIDER' && (
                <Link href="/rider" style={{ 
                  textDecoration: 'none', 
                  color: 'black', 
                  fontWeight: 'bold',
                  fontSize: '16px'
                }}>
                  Rider 🏍️
                </Link>
              )}
              {userRole === 'ADMIN' && (
                <Link href="/admin" style={{ 
                  textDecoration: 'none', 
                  color: 'black', 
                  fontWeight: 'bold',
                  fontSize: '16px'
                }}>
                  Admin 🔧
                </Link>
              )}
              <button
                onClick={handleLogout}
                style={{ 
                  backgroundColor: 'red', 
                  color: 'white', 
                  padding: '10px 20px', 
                  borderRadius: '8px', 
                  border: '2px solid black',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <Link href="/login" style={{ textDecoration: 'none' }}>
              <button style={{ 
                backgroundColor: 'blue', 
                color: 'white', 
                padding: '10px 20px', 
                borderRadius: '8px', 
                border: '2px solid black',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '16px'
              }}>
                Login
              </button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}