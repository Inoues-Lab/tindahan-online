'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function MyOrdersRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/orders')
  }, [router])

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
      <div style={{ textAlign: 'center', padding: '100px 20px' }}>
        <p style={{ fontSize: '18px', fontWeight: 'bold' }}>Redirecting to your orders...</p>
      </div>
    </main>
  )
}