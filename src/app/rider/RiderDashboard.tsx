// src/app/rider/RiderDashboard.tsx
'use client'

import { useState } from 'react'

interface Product {
  id: string
  name: string
  price: number
  weightKg: number
}

interface OrderItem {
  id: string
  productId: string
  quantity: number
  price: number
  product: Product
}

interface Delivery {
  id: string
  status: string
  riderId: string | null
}

interface Order {
  id: string
  totalAmount: number
  deliveryFee: number
  riderPayout: number
  requiredLoadKg: number
  deliveryAddress: string
  contactNumber: string
  status: string
  createdAt: string
  items: OrderItem[]
  delivery: Delivery | null
}

export function RiderDashboard({ orders }: { orders: Order[] }) {
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null)

  // Filter orders by status - use order status instead of delivery status
  const availableOrders = orders.filter(o => 
    o.status === 'PENDING'
  )
  
  const activeOrders = orders.filter(o => 
    o.status === 'ACCEPTED' || o.status === 'OUT_FOR_DELIVERY'
  )
  
  const completedOrders = orders.filter(o => 
    o.status === 'COMPLETED' || o.status === 'DELIVERED'
  )

  const totalEarnings = completedOrders.reduce((sum, order) => sum + order.riderPayout, 0)

  const handleAcceptOrder = async (orderId: string) => {
    try {
      const response = await fetch('/api/rider/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId })
      })
      
      if (response.ok) {
        alert('Order accepted! Go pick up the items.')
        window.location.reload()
      } else {
        alert('Failed to accept order. It may have been taken by another rider.')
      }
    } catch (error) {
      alert('Error accepting order')
    }
  }

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/rider/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus })
      })
      
      if (response.ok) {
        alert(`Order status updated to ${newStatus}`)
        window.location.reload()
      } else {
        alert('Failed to update status')
      }
    } catch (error) {
      alert('Error updating status')
    }
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
      {/* Left Column - Available Orders */}
      <div style={{ gridColumn: 'span 2' }}>
        {/* Earnings Card */}
        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', border: '3px solid black', marginBottom: '30px', boxShadow: '4px 4px 0px black' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'black', marginBottom: '10px', margin: 0 }}>Total Earnings</h2>
          <p style={{ fontSize: '48px', fontWeight: 'bold', color: 'darkgreen', margin: '10px 0' }}>₱{totalEarnings.toFixed(2)}</p>
          <p style={{ color: 'black', fontWeight: 'bold', fontSize: '16px', margin: 0 }}>From {completedOrders.length} completed deliveries</p>
        </div>

        {/* Available Orders */}
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: 'black', marginBottom: '20px', display: 'flex', alignItems: 'center', margin: '0 0 20px 0' }}>
            <span style={{ width: '15px', height: '15px', backgroundColor: 'green', borderRadius: '50%', marginRight: '10px', border: '2px solid black' }}></span>
            Available Orders ({availableOrders.length})
          </h2>
          
          {availableOrders.length === 0 ? (
            <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', border: '3px solid black', textAlign: 'center', boxShadow: '4px 4px 0px black' }}>
              <p style={{ color: 'black', fontWeight: 'bold', fontSize: '20px', margin: 0 }}>No orders available right now</p>
              <p style={{ color: 'black', marginTop: '10px', fontWeight: 'bold', marginBottom: 0 }}>Check back soon!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {availableOrders.map((order) => (
                <div key={order.id} style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', border: '3px solid black', boxShadow: '4px 4px 0px black' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                    <div>
                      <h3 style={{ fontSize: '22px', fontWeight: 'bold', color: 'black', margin: '0 0 10px 0' }}>Order #{order.id.slice(0, 8)}</h3>
                      <p style={{ color: 'black', fontWeight: 'bold', fontSize: '18px', margin: 0 }}>₱{order.totalAmount.toFixed(2)} + ₱{order.deliveryFee.toFixed(2)} delivery</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ color: 'black', fontWeight: 'bold', fontSize: '20px', margin: '0 0 5px 0' }}>You earn: <span style={{ color: 'darkgreen', fontSize: '24px' }}>₱{order.riderPayout.toFixed(2)}</span></p>
                      <p style={{ color: 'black', fontSize: '14px', fontWeight: 'bold', margin: 0 }}>Load: {order.requiredLoadKg} kg</p>
                    </div>
                  </div>

                  <div style={{ borderTop: '3px solid black', paddingTop: '20px', marginBottom: '20px' }}>
                    <h4 style={{ fontWeight: 'bold', color: 'black', marginBottom: '10px', marginTop: 0 }}>Items:</h4>
                    <ul style={{ margin: 0, paddingLeft: '20px' }}>
                      {order.items.map((item) => (
                        <li key={item.id} style={{ color: 'black', fontWeight: 'bold', marginBottom: '5px' }}>
                          {item.product.name} x{item.quantity}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ backgroundColor: '#f0f0f0', padding: '15px', borderRadius: '8px', border: '2px solid black', marginBottom: '20px' }}>
                    <p style={{ color: 'black', fontWeight: 'bold', marginBottom: '5px', marginTop: 0 }}> {order.deliveryAddress}</p>
                    <p style={{ color: 'black', fontWeight: 'bold', margin: 0 }}>📞 {order.contactNumber}</p>
                  </div>

                  <button
                    onClick={() => handleAcceptOrder(order.id)}
                    style={{ width: '100%', backgroundColor: 'green', color: 'white', fontWeight: 'bold', fontSize: '18px', padding: '15px', borderRadius: '8px', border: '3px solid black', cursor: 'pointer', boxShadow: '3px 3px 0px black' }}
                  >
                    Accept Order
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active Orders */}
        {activeOrders.length > 0 && (
          <div>
            <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: 'black', marginBottom: '20px', display: 'flex', alignItems: 'center', margin: '30px 0 20px 0' }}>
              <span style={{ width: '15px', height: '15px', backgroundColor: 'blue', borderRadius: '50%', marginRight: '10px', border: '2px solid black' }}></span>
              Active Deliveries ({activeOrders.length})
            </h2>
            
            {activeOrders.map((order) => (
              <div key={order.id} style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', border: '3px solid black', boxShadow: '4px 4px 0px black', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                  <div>
                    <h3 style={{ fontSize: '22px', fontWeight: 'bold', color: 'black', margin: '0 0 10px 0' }}>Order #{order.id.slice(0, 8)}</h3>
                    <p style={{ color: 'black', fontWeight: 'bold', fontSize: '16px', margin: 0 }}> {order.deliveryAddress}</p>
                  </div>
                  <span style={{ backgroundColor: 'blue', color: 'white', padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold', border: '2px solid black', fontSize: '14px' }}>
                    IN PROGRESS
                  </span>
                </div>

                <button
                  onClick={() => handleUpdateStatus(order.id, 'COMPLETED')}
                  style={{ width: '100%', backgroundColor: 'blue', color: 'white', fontWeight: 'bold', fontSize: '16px', padding: '15px', borderRadius: '8px', border: '3px solid black', cursor: 'pointer', boxShadow: '3px 3px 0px black' }}
                >
                  Mark as Delivered
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Column - Recent Completed */}
      <div>
        <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', border: '3px solid black', boxShadow: '4px 4px 0px black', position: 'sticky', top: '24px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: 'black', marginBottom: '20px', marginTop: 0 }}>Completed Today</h2>
          
          {completedOrders.length === 0 ? (
            <p style={{ color: 'black', fontWeight: 'bold', margin: 0 }}>No completed orders yet</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {completedOrders.slice(0, 5).map((order) => (
                <div key={order.id} style={{ borderBottom: '2px solid black', paddingBottom: '15px' }}>
                  <p style={{ color: 'black', fontWeight: 'bold', margin: '0 0 5px 0', fontSize: '16px' }}>Order #{order.id.slice(0, 8)}</p>
                  <p style={{ color: 'darkgreen', fontWeight: 'bold', margin: '0 0 5px 0', fontSize: '18px' }}>+₱{order.riderPayout.toFixed(2)}</p>
                  <p style={{ color: 'black', fontSize: '12px', fontWeight: 'bold', margin: 0 }}>
                    {new Date(order.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}