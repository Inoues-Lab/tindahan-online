// src/app/orders/confirmation/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Header from '@/components/Header'

export default function OrderConfirmationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const orderId = searchParams.get('orderId')
    if (orderId) {
      fetchOrder(orderId)
    } else {
      router.push('/')
    }
  }, [searchParams])

  const fetchOrder = async (orderId: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`)
      const data = await response.json()
      if (data.order) {
        setOrder(data.order)
      }
    } catch (error) {
      console.error('Error fetching order:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <main style={{ minHeight: '100vh', backgroundColor: 'white' }}>
        <Header />
        <div style={{ textAlign: 'center', padding: '100px 20px' }}>
          <p>Loading...</p>
        </div>
      </main>
    )
  }

  if (!order) {
    return null
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: 'white' }}>
      <Header />
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
        <div style={{ backgroundColor: '#d4edda', padding: '30px', borderRadius: '12px', border: '3px solid #28a745', textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: '#28a745', marginBottom: '10px' }}>
            ✓ Order Placed Successfully!
          </h1>
          <p style={{ fontSize: '18px', color: 'gray' }}>
            Thank you for your order. We'll deliver it soon!
          </p>
        </div>

        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', border: '3px solid black', boxShadow: '4px 4px 0px black' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Order Details</h2>
          
          <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '2px solid #eee' }}>
            <p style={{ fontSize: '16px', color: 'gray', marginBottom: '5px' }}>Order ID: <strong>{order.id}</strong></p>
            <p style={{ fontSize: '16px', color: 'gray', marginBottom: '5px' }}>Status: <strong style={{ color: 'orange' }}>{order.status}</strong></p>
            <p style={{ fontSize: '16px', color: 'gray', marginBottom: '5px' }}>Date: <strong>{new Date(order.createdAt).toLocaleString()}</strong></p>
          </div>

          <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '15px' }}>Items</h3>
          <div style={{ marginBottom: '20px' }}>
            {order.items.map((item: any) => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee' }}>
                <div>
                  <p style={{ fontWeight: 'bold', margin: 0 }}>{item.product?.name || 'Product'}</p>
                  <p style={{ fontSize: '14px', color: 'gray', margin: 0 }}>Qty: {item.quantity}</p>
                </div>
                <p style={{ fontWeight: 'bold', margin: 0 }}>₱{(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>

          <div style={{ backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span>Subtotal:</span>
              <strong>₱{order.totalAmount.toFixed(2)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span>Delivery Fee:</span>
              <strong>₱{order.deliveryFee.toFixed(2)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', borderTop: '2px solid black', fontSize: '24px', fontWeight: 'bold' }}>
              <span>Total:</span>
              <span style={{ color: 'green' }}>₱{order.totalAmount.toFixed(2)}</span>
            </div>
          </div>

          <div style={{ marginTop: '30px', textAlign: 'center' }}>
            <button
              onClick={() => router.push('/')}
              style={{
                backgroundColor: 'blue',
                color: 'white',
                padding: '15px 30px',
                borderRadius: '8px',
                border: '2px solid black',
                fontWeight: 'bold',
                fontSize: '18px',
                cursor: 'pointer'
              }}
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}