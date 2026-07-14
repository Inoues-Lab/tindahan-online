// src/components/CartButton.tsx
'use client'

import { useState, useEffect } from 'react'

interface Product {
  id: string
  name: string
  price: number
  weightKg: number
}

interface CartButtonProps {
  product: Product
}

export default function CartButton({ product }: CartButtonProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        setIsLoggedIn(!!data.user)
      })
      .catch(() => setIsLoggedIn(false))
  }, [])

  const addToCart = () => {
    if (!isLoggedIn) {
      alert('Please login first to add items to cart!')
      return
    }

    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const existingItem = cart.find((item: any) => item.id === product.id)

    if (existingItem) {
      existingItem.quantity += 1
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        weightKg: product.weightKg,
        quantity: 1
      })
    }

    localStorage.setItem('cart', JSON.stringify(cart))
    
    // Dispatch custom event to notify cart page
    window.dispatchEvent(new Event('cartUpdated'))
    
    alert('Added to cart!')
  }

  return (
    <button
      onClick={addToCart}
      style={{
        backgroundColor: 'green',
        color: 'white',
        padding: '10px 20px',
        borderRadius: '8px',
        border: '2px solid black',
        fontWeight: 'bold',
        cursor: 'pointer',
        fontSize: '14px'
      }}
    >
      Add to Cart
    </button>
  )
}