// src/components/CartButton.tsx
'use client'

import { useCart } from '@/context/CartContext'
import { useState } from 'react'

export function CartButton({ product }: { product: { id: string; name: string; price: number; weightKg: number } }) {
  const { addToCart } = useCart()
  const [added, setAdded] = useState(false)

  const handleAddToCart = () => {
    addToCart(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <button
      onClick={handleAddToCart}
      className={`px-4 py-2 rounded-lg transition ${
        added
          ? 'bg-green-700 text-white'
          : 'bg-green-600 text-white hover:bg-green-700'
      }`}
    >
      {added ? 'Added!' : 'Add to Cart'}
    </button>
  )
}