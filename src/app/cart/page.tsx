// src/app/cart/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'

interface CartItem {
  id: string
  quantity: number
  product: {
    id: string
    name: string
    description: string
    price: number
    imageUrl?: string
    weightKg: number
  }
}

export default function CartPage() {
  const router = useRouter()
  const [items, setItems] = useState<CartItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        setUser(data.user)
        if (!data.user) router.push('/login')
      })
      .catch(() => router.push('/login'))
  }, [router])

  useEffect(() => {
    fetchCart()
  }, [])

  const fetchCart = async () => {
    try {
      const res = await fetch('/api/cart')
      const data = await res.json()
      if (res.ok) {
        setItems(data.items || [])
        setTotal(data.total || 0)
      }
    } catch (error) {
      console.error('Error fetching cart:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    try {
      const res = await fetch('/api/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartItemId, quantity })
      })
      if (res.ok) fetchCart()
    } catch (error) {
      alert('Failed to update quantity')
    }
  }

  const removeItem = async (cartItemId: string) => {
    if (!confirm('Remove this item from cart?')) return
    try {
      const res = await fetch(`/api/cart?cartItemId=${cartItemId}`, {
        method: 'DELETE'
      })
      if (res.ok) fetchCart()
    } catch (error) {
      alert('Failed to remove item')
    }
  }

  if (loading) {
    return (
      <main style={{ minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
        <Header />
        <div style={{ textAlign: 'center', padding: '100px 20px' }}>Loading cart...</div>
      </main>
    )
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
      <Header />
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '20px' }}>
           Shopping Cart
        </h1>

        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: 'white', borderRadius: '12px', border: '3px solid black' }}>
            <p style={{ fontSize: '48px', marginBottom: '10px' }}>🛒</p>
            <p style={{ fontSize: '18px', color: 'gray', marginBottom: '20px' }}>Your cart is empty</p>
            <button
              onClick={() => router.push('/')}
              style={{ padding: '12px 24px', backgroundColor: 'blue', color: 'white', border: '2px solid black', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' }}
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gap: '15px', marginBottom: '20px' }}>
              {items.map((item) => (
                <div key={item.id} style={{ backgroundColor: 'white', padding: '15px', borderRadius: '12px', border: '3px solid black', display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ width: '80px', height: '80px', backgroundColor: '#f0f0f0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>
                    📦
                  </div>
                  <div style={{ flex: 1, minWidth: '150px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '5px' }}>{item.product.name}</h3>
                    <p style={{ fontSize: '13px', color: 'gray' }}>{item.product.description}</p>
                    <p style={{ fontSize: '14px', fontWeight: 'bold', color: 'green', marginTop: '5px' }}>₱{item.product.price.toFixed(2)}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      style={{ width: '32px', height: '32px', backgroundColor: '#f0f0f0', border: '2px solid black', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '18px' }}
                    >
                      -
                    </button>
                    <span style={{ fontSize: '16px', fontWeight: 'bold', minWidth: '30px', textAlign: 'center' }}>{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      style={{ width: '32px', height: '32px', backgroundColor: '#f0f0f0', border: '2px solid black', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '18px' }}
                    >
                      +
                    </button>
                  </div>
                  <div style={{ textAlign: 'right', minWidth: '80px' }}>
                    <p style={{ fontSize: '16px', fontWeight: 'bold', color: 'green' }}>₱{(item.product.price * item.quantity).toFixed(2)}</p>
                    <button
                      onClick={() => removeItem(item.id)}
                      style={{ padding: '6px 12px', backgroundColor: 'red', color: 'white', border: '2px solid black', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}
                    >
                       Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '3px solid black' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '16px' }}>
                <span>Subtotal:</span>
                <span style={{ fontWeight: 'bold' }}>₱{total.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '16px' }}>
                <span>Delivery Fee:</span>
                <span style={{ fontWeight: 'bold' }}>₱50.00</span>
              </div>
              <div style={{ borderTop: '2px solid black', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: 'bold' }}>
                <span>Total:</span>
                <span style={{ color: 'green' }}>₱{(total + 50).toFixed(2)}</span>
              </div>
              <button
                onClick={() => router.push('/checkout')}
                style={{ width: '100%', marginTop: '20px', padding: '15px', backgroundColor: 'green', color: 'white', border: '2px solid black', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '18px' }}
              >
                Proceed to Checkout →
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  )
}