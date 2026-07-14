// src/app/cart/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'

interface CartItem {
  id: string
  name: string
  price: number
  weightKg: number
  quantity: number
}

export default function CartPage() {
  const router = useRouter()
  const [cart, setCart] = useState<CartItem[]>([])
  const [key, setKey] = useState(0) // Force re-render

  // Load cart from localStorage
  const loadCart = () => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart)
        setCart(parsed)
      } catch (e) {
        console.error('Error parsing cart:', e)
        setCart([])
      }
    } else {
      setCart([])
    }
  }

  useEffect(() => {
    loadCart()
  }, [key]) // Re-run when key changes

  const updateQuantity = (productId: string, newQuantity: number) => {
    const updatedCart = cart.map(item =>
      item.id === productId ? { ...item, quantity: newQuantity } : item
    ).filter(item => item.quantity > 0)

    setCart(updatedCart)
    localStorage.setItem('cart', JSON.stringify(updatedCart))
  }

  const removeItem = (productId: string) => {
    const updatedCart = cart.filter(item => item.id !== productId)
    setCart(updatedCart)
    localStorage.setItem('cart', JSON.stringify(updatedCart))
  }

  const refreshCart = () => {
    setKey(prev => prev + 1) // Force re-render
  }

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
      <Header />
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold' }}>
            Shopping Cart 🛒
          </h1>
          <button
            onClick={refreshCart}
            style={{
              backgroundColor: 'blue',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '8px',
              border: '2px solid black',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
             Refresh
          </button>
        </div>

        {cart.length === 0 ? (
          <div style={{ backgroundColor: 'white', padding: '60px 20px', borderRadius: '12px', border: '3px solid black', textAlign: 'center' }}>
            <p style={{ fontSize: '20px', color: 'gray', marginBottom: '20px' }}>Your cart is empty</p>
            <button
              onClick={() => router.push('/')}
              style={{
                backgroundColor: 'blue',
                color: 'white',
                padding: '15px 30px',
                borderRadius: '8px',
                border: '2px solid black',
                fontWeight: 'bold',
                fontSize: '16px',
                cursor: 'pointer'
              }}
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '3px solid black', marginBottom: '20px' }}>
              {cart.map((item) => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 0', borderBottom: '1px solid #eee' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '5px' }}>{item.name}</h3>
                    <p style={{ color: 'gray' }}>₱{item.price.toFixed(2)} each</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      style={{
                        width: '30px',
                        height: '30px',
                        borderRadius: '50%',
                        border: '2px solid black',
                        backgroundColor: 'white',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '16px'
                      }}
                    >
                      -
                    </button>
                    <span style={{ fontSize: '18px', fontWeight: 'bold', minWidth: '30px', textAlign: 'center' }}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      style={{
                        width: '30px',
                        height: '30px',
                        borderRadius: '50%',
                        border: '2px solid black',
                        backgroundColor: 'white',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '16px'
                      }}
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeItem(item.id)}
                      style={{
                        backgroundColor: 'red',
                        color: 'white',
                        padding: '5px 10px',
                        borderRadius: '5px',
                        border: 'none',
                        cursor: 'pointer',
                        marginLeft: '10px'
                      }}
                    >
                      Remove
                    </button>
                  </div>
                  <div style={{ textAlign: 'right', minWidth: '100px' }}>
                    <p style={{ fontSize: '18px', fontWeight: 'bold', color: 'green' }}>
                      ₱{(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '3px solid black' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '20px', fontWeight: 'bold' }}>
                <span>Total:</span>
                <span style={{ color: 'green' }}>₱{total.toFixed(2)}</span>
              </div>
              <button
                onClick={() => router.push('/checkout')}
                style={{
                  width: '100%',
                  padding: '15px',
                  backgroundColor: 'green',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Proceed to Checkout
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  )
}