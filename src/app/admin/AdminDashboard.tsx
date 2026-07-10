// src/app/admin/AdminDashboard.tsx
'use client'

import { useState } from 'react'

interface Product {
  id: string
  name: string
  description: string
  price: number
  weightKg: number
  stock: number
}

interface OrderItem {
  id: string
  productId: string
  quantity: number
  price: number
  product: Product
}

interface Order {
  id: string
  totalAmount: number
  status: string
  deliveryAddress: string
  contactNumber: string
  createdAt: string
  items: OrderItem[]
  customer: {
    name: string
  }
}

interface Rider {
  id: string
  name: string
  email: string
  riderProfile: {
    vehicleType: string
    plateNumber: string
  } | null
}

export function AdminDashboard({ 
  products, 
  orders, 
  riders, 
  stats 
}: { 
  products: Product[]
  orders: Order[]
  riders: Rider[]
  stats: {
    totalRevenue: number
    totalOrders: number
    completedOrders: number
    pendingOrders: number
  }
}) {
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'riders'>('overview')
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    weightKg: '',
    stock: ''
  })

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProduct.name,
          description: newProduct.description,
          price: parseFloat(newProduct.price),
          weightKg: parseFloat(newProduct.weightKg),
          stock: parseInt(newProduct.stock)
        })
      })

      if (response.ok) {
        alert('Product added successfully!')
        setShowAddProduct(false)
        setNewProduct({ name: '', description: '', price: '', weightKg: '', stock: '' })
        window.location.reload()
      } else {
        alert('Failed to add product')
      }
    } catch (error) {
      alert('Error adding product')
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      const response = await fetch(`/api/admin/products?id=${productId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        alert('Product deleted successfully!')
        window.location.reload()
      } else {
        alert('Failed to delete product')
      }
    } catch (error) {
      alert('Error deleting product')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'yellow'
      case 'ACCEPTED': return 'blue'
      case 'OUT_FOR_DELIVERY': return 'orange'
      case 'COMPLETED': return 'green'
      default: return 'gray'
    }
  }

  return (
    <div>
      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', border: '3px solid black', boxShadow: '4px 4px 0px black' }}>
          <p style={{ fontSize: '14px', fontWeight: 'bold', color: 'black', margin: '0 0 10px 0' }}>Total Revenue</p>
          <p style={{ fontSize: '36px', fontWeight: 'bold', color: 'darkgreen', margin: 0 }}>₱{stats.totalRevenue.toFixed(2)}</p>
        </div>
        
        <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', border: '3px solid black', boxShadow: '4px 4px 0px black' }}>
          <p style={{ fontSize: '14px', fontWeight: 'bold', color: 'black', margin: '0 0 10px 0' }}>Total Orders</p>
          <p style={{ fontSize: '36px', fontWeight: 'bold', color: 'black', margin: 0 }}>{stats.totalOrders}</p>
        </div>
        
        <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', border: '3px solid black', boxShadow: '4px 4px 0px black' }}>
          <p style={{ fontSize: '14px', fontWeight: 'bold', color: 'black', margin: '0 0 10px 0' }}>Completed Orders</p>
          <p style={{ fontSize: '36px', fontWeight: 'bold', color: 'green', margin: 0 }}>{stats.completedOrders}</p>
        </div>
        
        <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', border: '3px solid black', boxShadow: '4px 4px 0px black' }}>
          <p style={{ fontSize: '14px', fontWeight: 'bold', color: 'black', margin: '0 0 10px 0' }}>Pending Orders</p>
          <p style={{ fontSize: '36px', fontWeight: 'bold', color: 'orange', margin: 0 }}>{stats.pendingOrders}</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', borderBottom: '3px solid black', paddingBottom: '10px' }}>
        <button
          onClick={() => setActiveTab('overview')}
          style={{
            padding: '12px 24px',
            fontWeight: 'bold',
            fontSize: '16px',
            border: '3px solid black',
            borderRadius: '8px',
            cursor: 'pointer',
            backgroundColor: activeTab === 'overview' ? 'black' : 'white',
            color: activeTab === 'overview' ? 'white' : 'black'
          }}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('products')}
          style={{
            padding: '12px 24px',
            fontWeight: 'bold',
            fontSize: '16px',
            border: '3px solid black',
            borderRadius: '8px',
            cursor: 'pointer',
            backgroundColor: activeTab === 'products' ? 'black' : 'white',
            color: activeTab === 'products' ? 'white' : 'black'
          }}
        >
          Products ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          style={{
            padding: '12px 24px',
            fontWeight: 'bold',
            fontSize: '16px',
            border: '3px solid black',
            borderRadius: '8px',
            cursor: 'pointer',
            backgroundColor: activeTab === 'orders' ? 'black' : 'white',
            color: activeTab === 'orders' ? 'white' : 'black'
          }}
        >
          Orders ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('riders')}
          style={{
            padding: '12px 24px',
            fontWeight: 'bold',
            fontSize: '16px',
            border: '3px solid black',
            borderRadius: '8px',
            cursor: 'pointer',
            backgroundColor: activeTab === 'riders' ? 'black' : 'white',
            color: activeTab === 'riders' ? 'white' : 'black'
          }}
        >
          Riders ({riders.length})
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', border: '3px solid black', boxShadow: '4px 4px 0px black' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'black', marginBottom: '20px', marginTop: 0 }}>Welcome to Admin Dashboard</h2>
          <p style={{ color: 'black', fontWeight: 'bold', fontSize: '16px', lineHeight: '1.6' }}>
            Use the navigation tabs above to manage your grocery delivery business:
          </p>
          <ul style={{ color: 'black', fontWeight: 'bold', fontSize: '16px', lineHeight: '2' }}>
            <li>📦 <strong>Products</strong> - Add, edit, and manage your product catalog</li>
            <li>📋 <strong>Orders</strong> - View and manage all customer orders</li>
            <li>🏍️ <strong>Riders</strong> - Manage delivery riders and their profiles</li>
          </ul>
        </div>
      )}

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'black', margin: 0 }}>Manage Products</h2>
            <button
              onClick={() => setShowAddProduct(true)}
              style={{
                backgroundColor: 'green',
                color: 'white',
                padding: '12px 24px',
                fontWeight: 'bold',
                fontSize: '16px',
                border: '3px solid black',
                borderRadius: '8px',
                cursor: 'pointer',
                boxShadow: '3px 3px 0px black'
              }}
            >
              + Add Product
            </button>
          </div>

          {showAddProduct && (
            <form onSubmit={handleAddProduct} style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', border: '3px solid black', marginBottom: '30px', boxShadow: '4px 4px 0px black' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: 'black', marginBottom: '20px', marginTop: 0 }}>Add New Product</h3>
              
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', color: 'black', marginBottom: '5px' }}>Product Name</label>
                <input
                  type="text"
                  required
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  style={{ width: '100%', padding: '10px', fontSize: '16px', border: '2px solid black', borderRadius: '8px', fontWeight: 'bold', color: 'black', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', color: 'black', marginBottom: '5px' }}>Description</label>
                <textarea
                  required
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                  rows={3}
                  style={{ width: '100%', padding: '10px', fontSize: '16px', border: '2px solid black', borderRadius: '8px', fontWeight: 'bold', color: 'black', resize: 'vertical', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', color: 'black', marginBottom: '5px' }}>Price (₱)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                    style={{ width: '100%', padding: '10px', fontSize: '16px', border: '2px solid black', borderRadius: '8px', fontWeight: 'bold', color: 'black', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', color: 'black', marginBottom: '5px' }}>Weight (kg)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newProduct.weightKg}
                    onChange={(e) => setNewProduct({...newProduct, weightKg: e.target.value})}
                    style={{ width: '100%', padding: '10px', fontSize: '16px', border: '2px solid black', borderRadius: '8px', fontWeight: 'bold', color: 'black', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', color: 'black', marginBottom: '5px' }}>Stock</label>
                  <input
                    type="number"
                    required
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                    style={{ width: '100%', padding: '10px', fontSize: '16px', border: '2px solid black', borderRadius: '8px', fontWeight: 'bold', color: 'black', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button
                  type="submit"
                  style={{
                    backgroundColor: 'green',
                    color: 'white',
                    padding: '12px 24px',
                    fontWeight: 'bold',
                    fontSize: '16px',
                    border: '3px solid black',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    boxShadow: '3px 3px 0px black'
                  }}
                >
                  Save Product
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddProduct(false)}
                  style={{
                    backgroundColor: 'gray',
                    color: 'white',
                    padding: '12px 24px',
                    fontWeight: 'bold',
                    fontSize: '16px',
                    border: '3px solid black',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div style={{ display: 'grid', gap: '15px' }}>
            {products.map((product) => (
              <div key={product.id} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '3px solid black', boxShadow: '3px 3px 0px black' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'black', margin: '0 0 10px 0' }}>{product.name}</h3>
                    <p style={{ color: 'black', fontWeight: 'bold', margin: '0 0 10px 0' }}>{product.description}</p>
                    <div style={{ display: 'flex', gap: '20px' }}>
                      <span style={{ color: 'darkgreen', fontWeight: 'bold', fontSize: '20px' }}>₱{product.price.toFixed(2)}</span>
                      <span style={{ color: 'black', fontWeight: 'bold' }}>{product.weightKg} kg</span>
                      <span style={{ color: 'blue', fontWeight: 'bold' }}>Stock: {product.stock}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    style={{
                      backgroundColor: 'red',
                      color: 'white',
                      padding: '10px 20px',
                      fontWeight: 'bold',
                      border: '2px solid black',
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'black', marginBottom: '20px', marginTop: 0 }}>All Orders</h2>
          
          <div style={{ display: 'grid', gap: '15px' }}>
            {orders.map((order) => (
              <div key={order.id} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '3px solid black', boxShadow: '3px 3px 0px black' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'black', margin: '0 0 5px 0' }}>Order #{order.id.slice(0, 8)}</h3>
                    <p style={{ color: 'black', fontWeight: 'bold', margin: 0 }}>Customer: {order.customer.name}</p>
                    <p style={{ color: 'black', fontWeight: 'bold', margin: '5px 0 0 0' }}>📍 {order.deliveryAddress}</p>
                    <p style={{ color: 'black', fontWeight: 'bold', margin: '5px 0 0 0' }}>📞 {order.contactNumber}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontWeight: 'bold',
                      border: '2px solid black',
                      backgroundColor: getStatusColor(order.status) === 'green' ? 'lightgreen' :
                                     getStatusColor(order.status) === 'yellow' ? 'yellow' :
                                     getStatusColor(order.status) === 'blue' ? 'lightblue' : 'orange',
                      color: 'black',
                      marginBottom: '10px'
                    }}>
                      {order.status}
                    </span>
                    <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'darkgreen', margin: '10px 0 0 0' }}>₱{order.totalAmount.toFixed(2)}</p>
                    <p style={{ color: 'black', fontWeight: 'bold', fontSize: '12px', margin: 0 }}>
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <div style={{ borderTop: '2px solid black', paddingTop: '15px' }}>
                  <h4 style={{ fontWeight: 'bold', color: 'black', margin: '0 0 10px 0' }}>Items:</h4>
                  <ul style={{ margin: 0, paddingLeft: '20px' }}>
                    {order.items.map((item) => (
                      <li key={item.id} style={{ color: 'black', fontWeight: 'bold', marginBottom: '5px' }}>
                        {item.product.name} x{item.quantity} - ₱{(item.price * item.quantity).toFixed(2)}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Riders Tab */}
      {activeTab === 'riders' && (
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'black', marginBottom: '20px', marginTop: 0 }}>Delivery Riders</h2>
          
          <div style={{ display: 'grid', gap: '15px' }}>
            {riders.map((rider) => (
              <div key={rider.id} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '3px solid black', boxShadow: '3px 3px 0px black' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'black', margin: '0 0 5px 0' }}>{rider.name}</h3>
                    <p style={{ color: 'black', fontWeight: 'bold', margin: 0 }}>{rider.email}</p>
                    {rider.riderProfile && (
                      <div style={{ marginTop: '10px' }}>
                        <p style={{ color: 'black', fontWeight: 'bold', margin: '5px 0' }}>
                          ️ Vehicle: {rider.riderProfile.vehicleType}
                        </p>
                        <p style={{ color: 'black', fontWeight: 'bold', margin: '5px 0' }}>
                           Plate: {rider.riderProfile.plateNumber}
                        </p>
                      </div>
                    )}
                  </div>
                  <div style={{ backgroundColor: 'lightblue', padding: '8px 16px', borderRadius: '8px', border: '2px solid black', fontWeight: 'bold', color: 'black' }}>
                    RIDER
                  </div>
                </div>
              </div>
            ))}
            
            {riders.length === 0 && (
              <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', border: '3px solid black', textAlign: 'center' }}>
                <p style={{ color: 'black', fontWeight: 'bold', fontSize: '18px', margin: 0 }}>No riders registered yet</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}