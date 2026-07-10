// src/components/Header.tsx
'use client'

import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import { useState, useEffect } from 'react'
import Cookies from 'js-cookie'
import { useRouter } from 'next/navigation'

export default function Header() {
  const { getTotalItems } = useCart()
  const totalItems = getTotalItems()
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState('')

  useEffect(() => {
    // Check if user is logged in (simple check)
    const userId = Cookies.get('userId')
    if (userId) {
      setIsLoggedIn(true)
      // In a real app, you'd fetch the user name here
      setUserName('User') 
    }
  }, [])

  const handleLogout = () => {
    Cookies.remove('userId')
    setIsLoggedIn(false)
    router.push('/')
  }

  return (
    <header style={{ backgroundColor: 'white', borderBottom: '2px solid black', padding: '20px', position: 'sticky', top: 0, zIndex: 50 }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: 'black', margin: 0 }}>Tindahan Online</h1>
            <span style={{ fontSize: '28px' }}>🛒</span>
          </Link>
          
          <nav style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <Link href="/" style={{ color: 'black', fontWeight: 'bold', fontSize: '16px', textDecoration: 'none' }}>
              Shop
            </Link>
            <Link href="/rider" style={{ color: 'black', fontWeight: 'bold', fontSize: '16px', textDecoration: 'none', backgroundColor: '#f0f0f0', padding: '8px 16px', borderRadius: '8px', border: '2px solid black' }}>
              Rider 🏍️
            </Link>
            <Link href="/cart" style={{ color: 'black', fontWeight: 'bold', fontSize: '16px', textDecoration: 'none', position: 'relative' }}>
              Cart 🛍️
              {totalItems > 0 && (
                <span style={{ position: 'absolute', top: '-10px', right: '-15px', backgroundColor: 'green', color: 'white', fontSize: '12px', fontWeight: 'bold', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid black' }}>
                  {totalItems}
                </span>
              )}
            </Link>
            <Link href="/admin" style={{ color: 'black', fontWeight: 'bold', fontSize: '16px', textDecoration: 'none', backgroundColor: '#f0f0f0', padding: '8px 16px', borderRadius: '8px', border: '2px solid black' }}>
              Admin 🔧
            </Link>
            
            {isLoggedIn ? (
              <button 
                onClick={handleLogout}
                style={{ color: 'white', backgroundColor: 'red', fontWeight: 'bold', fontSize: '16px', padding: '8px 16px', borderRadius: '8px', border: '2px solid black', cursor: 'pointer' }}
              >
                Logout
              </button>
            ) : (
              <Link href="/login" style={{ color: 'white', backgroundColor: 'blue', fontWeight: 'bold', fontSize: '16px', padding: '8px 16px', borderRadius: '8px', border: '2px solid black', textDecoration: 'none' }}>
                Login
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}