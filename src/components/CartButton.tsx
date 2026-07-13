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
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    // Load cart count on mount
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const totalItems = cart.reduce((sum: number, item: any) => sum + item.quantity, 0)
    setCartCount(totalItems)
  }, [])

  const addToCart = () => {
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
    const newCount = cart.reduce((sum: number, item: any) => sum + item.quantity, 0)
    setCartCount(newCount)
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