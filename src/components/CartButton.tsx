'use client'

import { useState } from 'react'
import { useCart } from '@/context/CartContext'

interface Product {
  id: string
  name: string
  price: number
  weightKg: number
}

export default function CartButton({ product }: { product: Product }) {
  const { addToCart } = useCart()
  const [added, setAdded] = useState(false)

  const handleAddToCart = () => {
    console.log('Adding product:', product)
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      weightKg: product.weightKg
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <button
      onClick={handleAddToCart}
      style={{
        backgroundColor: added ? '#22c55e' : '#16a34a',
        color: 'white',
        padding: '10px 20px',
        borderRadius: '8px',
        border: '2px solid black',
        fontWeight: 'bold',
        cursor: 'pointer',
        fontSize: '14px'
      }}
    >
      {added ? 'Added!' : 'Add to Cart'}
    </button>
  )
}