'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminHeader from '@/components/AdminHeader'

export default function AdminOrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [router])

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me')
      const data = await res.json()
      if (!data.user || (data.user.role !== 'ADMIN' && data.user.role !== 'SUB_ADMIN')) {
        router.push('/')
        return
      }
      fetchOrders()
    } catch (error) {
      router.push('/')
    }
  }

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/admin/orders')
      const data = await res.json()
      if (res.ok) setOrders(data.orders || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const statusColors: any = {
    PENDING: '#ff9800',
    ACCEPTED: '#2196f3',
    IN_PROGRESS: '#2196f3',
    READY_FOR_PICKUP: '#9c27b0',
    OUT_FOR_DELIVERY: '#9c27b0',
    DELIVERED: '#4caf50',
    COMPLETED: '#4caf50',
    CANCELLED: '#dc3545'
  }

  if (loading) {
    return (
      <main style={{ minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
        <AdminHeader />
        <div style={{ textAlign: 'center', padding: '100px 20px' }}>Loading...</div>
      </main>
    )
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
      <AdminHeader />
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '30px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '5px' }}>📦 All Orders</h1>
            <p style={{ fontSize: '16px', color: 'gray' }}>Every order with customer & rider info</p>
          </div>
          <button onClick={() => router.push('/admin')} style={{ padding: '12px 24px', backgroundColor: 'white', border: '2px solid black', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
            ← Back
          </button>
        </div>

        {orders.length === 0 ? (
          <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', border: '3px solid black', textAlign: 'center' }}>
            <p style={{ fontSize: '18px', color: 'gray' }}>No orders yet.</p>
          </div>
        ) : (
          <>
            <div className="orders-header" style={{ fontWeight: 'bold', padding: '12px 15px', backgroundColor: 'white', border: '3px solid black', borderRadius: '12px', marginBottom: '15px', fontSize: '14px' }}>
              <span>Order ID</span>
              <span>Customer</span>
              <span>Rider</span>
              <span>Total</span>
              <span>Status</span>
            </div>
            <div style={{ display: 'grid', gap: '15px' }}>
              {orders.map((o) => (
                <div key={o.id} className="order-row" style={{ backgroundColor: 'white', padding: '15px', borderRadius: '12px', border: '3px solid black', boxShadow: '4px 4px 0px black' }}>
                  <div>
                    <span className="cell-label">Order ID: </span>
                    <strong>#{o.id.slice(-6).toUpperCase()}</strong>
                    <p style={{ fontSize: '11px', color: 'gray', margin: '3px 0 0 0' }}>{new Date(o.createdAt).toLocaleString()} | {o.serviceType}</p>
                  </div>
                  <div>
                    <span className="cell-label">Customer: </span>
                    {o.user?.name || 'N/A'}
                  </div>
                  <div>
                    <span className="cell-label">Rider: </span>
                    {o.rider?.user?.name || '—'}
                  </div>
                  <div>
                    <span className="cell-label">Total: </span>
                    <strong style={{ color: '#4caf50' }}>₱{(o.totalAmount || 0).toFixed(2)}</strong>
                  </div>
                  <div>
                    <span style={{ padding: '5px 12px', backgroundColor: statusColors[o.status] || '#757575', color: 'white', borderRadius: '20px', fontWeight: 'bold', fontSize: '12px', whiteSpace: 'nowrap' }}>
                      {o.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <style jsx global>{`
        @media (min-width: 769px) {
          .orders-header {
            display: grid !important;
            grid-template-columns: 1.3fr 1.2fr 1fr 0.8fr 1fr;
            gap: 10px;
            align-items: center;
          }
          .order-row {
            display: grid !important;
            grid-template-columns: 1.3fr 1.2fr 1fr 0.8fr 1fr;
            gap: 10px;
            align-items: center;
          }
          .cell-label { display: none !important; }
        }
        @media (max-width: 768px) {
          .orders-header { display: none !important; }
          .order-row {
            display: flex !important;
            flex-direction: column;
            gap: 8px;
          }
          .cell-label {
            display: inline !important;
            font-weight: bold;
            color: gray;
            font-size: 12px;
            margin-right: 5px;
          }
        }
      `}</style>
    </main>
  )
}
