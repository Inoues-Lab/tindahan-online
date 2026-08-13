'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminDashboardPage() {
  const router = useRouter()

  useEffect(() => {
    // Send everyone to /admin which handles ADMIN and SUB_ADMIN correctly
    router.replace('/admin')
  }, [router])

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
      <div style={{ textAlign: 'center', padding: '100px 20px' }}>Loading...</div>
    </main>
  )
}