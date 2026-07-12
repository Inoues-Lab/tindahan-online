'use client'

import { useCart } from '@/context/CartContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useCart()
  const router = useRouter()

  useEffect(() => {
    console.log('Cart page - current cart:', cart)
  }, [cart])

  if (cart.length === 0) {
    return (
      <main style={{ minHeight: '100vh', backgroundColor: 'white' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
          <h1 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '30px' }}>Shopping Cart 🛒</h1>
          <div style={{ backgroundColor: 'white', padding: '60px', borderRadius: '12px', border: '3px solid black', textAlign: 'center' }}>
            <p style={{ fontSize: '18px', color: 'gray', marginBottom: '20px' }}>Your cart is empty</p>
            <button
              onClick={() => router.push('/')}
              style={{ backgroundColor: 'blue', color: 'white', padding: '12px 30px', borderRadius: '8px', border: '2px solid black', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: 'white' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '30px' }}>Shopping Cart 🛒</h1>

        <div style={{ display: 'grid', gap: '15px', marginBottom: '30px' }}>
          {cart.map((item) => (
            <div key={item.id} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '2px solid black', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 5px 0' }}>{item.name}</h3>
                <p style={{ fontSize: '16px', color: 'green', fontWeight: 'bold', margin: 0 }}>₱{item.price.toFixed(2)}</p>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    style={{ width: '30px', height: '30px', borderRadius: '5px', border: '2px solid black', backgroundColor: 'white', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    -
                  </button>
                  <span style={{ fontSize: '16px', fontWeight: 'bold', minWidth: '30px', textAlign: 'center' }}>{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    style={{ width: '30px', height: '30px', borderRadius: '5px', border: '2px solid black', backgroundColor: 'white', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    +
                  </button>
                </div>
                
                <button
                  onClick={() => removeFromCart(item.id)}
                  style={{ backgroundColor: 'red', color: 'white', padding: '8px 15px', borderRadius: '8px', border: '2px solid black', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', border: '3px solid black', boxShadow: '4px 4px 0px black' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Total:</h2>
            <p style={{ fontSize: '36px', fontWeight: 'bold', color: 'green', margin: 0 }}>₱{cartTotal.toFixed(2)}</p>
          </div>
          
          <button
            onClick={() => router.push('/checkout')}
            style={{ width: '100%', backgroundColor: 'green', color: 'white', padding: '15px', borderRadius: '8px', border: '2px solid black', fontWeight: 'bold', fontSize: '18px', cursor: 'pointer' }}
          >
            Proceed to Checkout
          </button>
          
          <button
            onClick={() => router.push('/')}
            style={{ width: '100%', backgroundColor: 'white', color: 'black', padding: '12px', borderRadius: '8px', border: '2px solid black', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', marginTop: '10px' }}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </main>
  )
}