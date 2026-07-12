// src/app/orders/confirmation/page.tsx
'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Header from '@/components/Header'

function ConfirmationContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')

  return (
    <main style={{ minHeight: '100vh', backgroundColor: 'white' }}>
      <Header />
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', textAlign: 'center' }}>
        <div style={{ backgroundColor: '#d4edda', padding: '40px', borderRadius: '12px', border: '3px solid #28a745', marginTop: '50px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#28a745', marginBottom: '20px' }}>
            Order Confirmed! ✅
          </h1>
          <p style={{ fontSize: '18px', color: 'gray', marginBottom: '20px' }}>
            Thank you for your order!
          </p>
          {orderId && (
            <p style={{ fontSize: '16px', color: 'gray', marginBottom: '30px' }}>
              Order ID: <strong>{orderId}</strong>
            </p>
          )}
          <p style={{ fontSize: '16px', color: 'gray', marginBottom: '30px' }}>
            We'll notify you when a rider accepts your order.
          </p>
          <a
            href="/orders/my-orders"
            style={{
              backgroundColor: 'blue',
              color: 'white',
              padding: '15px 30px',
              borderRadius: '8px',
              border: '2px solid black',
              fontWeight: 'bold',
              textDecoration: 'none',
              display: 'inline-block'
            }}
          >
            View My Orders
          </a>
        </div>
      </div>
    </main>
  )
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Loading...</p>
      </div>
    }>
      <ConfirmationContent />
    </Suspense>
  )
}