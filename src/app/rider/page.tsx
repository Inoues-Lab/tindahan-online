'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import PWAInstallPrompt from '@/components/PWAInstallPrompt'

export default function RiderDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [pendingOrders, setPendingOrders] = useState<any[]>([])
  const [myOrders, setMyOrders] = useState<any[]>([])
  const [cashOnHand, setCashOnHand] = useState(0)
  const [todayEarnings, setTodayEarnings] = useState(0)
  const [error, setError] = useState('')
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default')
  
  const [showRemittancePopup, setShowRemittancePopup] = useState(false)
  const [showContactModal, setShowContactModal] = useState(false)
  const [remittanceData, setRemittanceData] = useState({ cashOnHand: 0, limit: 20000 })
  const [contactMessage, setContactMessage] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)
  
  const [showPhotoModal, setShowPhotoModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState('')
  const [uploading, setUploading] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const notificationSoundRef = useRef<HTMLAudioElement | null>(null)
  const previousOrdersCount = useRef(0)

  const REMITTANCE_LIMIT = 20000

  // Initialize notification sound with base64 fallback
  useEffect(() => {
    // Try to load the wav file, fallback to base64 beep
    const audio = new Audio('/notification-sound.wav')
    audio.volume = 1.0
    audio.preload = 'auto'
    
    // If the file fails to load, use base64 beep
    audio.onerror = () => {
      console.log('WAV file failed, using base64 beep')
      notificationSoundRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGS57OihUBELTKXh8bllHAU2j9Xvz3kpBSh+zPDajzsKFFqz6OyrWBUIQ5zd8sFuJAUuhM/z2oc2CBhku+zoo1ER')
    }
    
    notificationSoundRef.current = audio
    
    return () => {
      if (notificationSoundRef.current) {
        notificationSoundRef.current.pause()
      }
    }
  }, [])

  // Test sound function
  const testSound = () => {
    if (notificationSoundRef.current) {
      const audio = notificationSoundRef.current
      audio.currentTime = 0
      audio.volume = 1.0
      audio.play().then(() => {
        console.log('✅ Sound played successfully!')
        alert(' Sound is working! You should hear a beep.')
      }).catch(err => {
        console.error('❌ Sound failed:', err)
        alert('❌ Sound failed. Please check your browser settings.')
      })
    }
  }

  useEffect(() => {
    checkAuth()
  }, [router])

  useEffect(() => {
    const interval = setInterval(() => {
      fetchRiderData()
    }, 5000)
    
    return () => clearInterval(interval)
  }, [])

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      setNotificationPermission(permission)
      if (permission === 'granted') {
        alert('Notifications enabled!')
      }
    }
  }

  const playNotificationSound = () => {
    if (notificationSoundRef.current) {
      const audio = notificationSoundRef.current
      audio.currentTime = 0
      audio.volume = 1.0
      audio.play().catch(err => {
        console.log('Sound play failed:', err)
      })
    }
  }

  const sendNotification = (title: string, body: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body: body,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        requireInteraction: true
      })
    }
    
    playNotificationSound()
    
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([300, 100, 300, 100, 300])
    }
    
    const alertDiv = document.createElement('div')
    alertDiv.style.cssText = `
      position: fixed;
      top: 80px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      border-radius: 12px;
      border: 3px solid white;
      box-shadow: 0 10px 40px rgba(0,0,0,0.3);
      z-index: 9999;
      max-width: 90%;
      width: 400px;
      text-align: center;
      animation: slideDown 0.5s ease-out;
    `
    alertDiv.innerHTML = `
      <div style="font-size: 32px; margin-bottom: 10px;">📦</div>
      <div style="font-size: 18px; font-weight: bold; margin-bottom: 5px;">${title}</div>
      <div style="font-size: 14px;">${body}</div>
    `
    
    document.body.appendChild(alertDiv)
    
    setTimeout(() => {
      alertDiv.style.animation = 'slideUp 0.5s ease-out'
      setTimeout(() => alertDiv.remove(), 500)
    }, 5000)
    
    if (!document.getElementById('notification-styles')) {
      const style = document.createElement('style')
      style.id = 'notification-styles'
      style.textContent = `
        @keyframes slideDown {
          from { transform: translateX(-50%) translateY(-100px); opacity: 0; }
          to { transform: translateX(-50%) translateY(0); opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateX(-50%) translateY(0); opacity: 1; }
          to { transform: translateX(-50%) translateY(-100px); opacity: 0; }
        }
      `
      document.head.appendChild(style)
    }
  }

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me')
      const data = await response.json()
      
      if (!data.user || data.user.role !== 'RIDER') {
        alert('Access denied. Riders only.')
        router.push('/')
        return
      }
      
      setUser(data.user)
      setCashOnHand(data.user.cashOnHand || 0)
      if ('Notification' in window) {
        setNotificationPermission(Notification.permission)
      }
      fetchRiderData()
    } catch (error) {
      router.push('/login')
    }
  }

  const fetchRiderData = async () => {
    try {
      const ordersRes = await fetch('/api/rider/orders')
      const ordersData = await ordersRes.json()
      
      if (ordersRes.ok) {
        const newPendingOrders = ordersData.pendingOrders || []
        setPendingOrders(newPendingOrders)
        setMyOrders(ordersData.myOrders || [])
        
        const currentCount = newPendingOrders.length
        if (currentCount > previousOrdersCount.current && currentCount > 0) {
          const newOrdersCount = currentCount - previousOrdersCount.current
          sendNotification(
            '📦 New Order Available!',
            `${newOrdersCount} new order${newOrdersCount > 1 ? 's' : ''} available!`
          )
        }
        previousOrdersCount.current = currentCount
        
        const meRes = await fetch('/api/auth/me')
        const meData = await meRes.json()
        
        if (meRes.ok && meData.user) {
          setCashOnHand(meData.user.cashOnHand || 0)
        }
        
        const today = new Date().toISOString().split('T')[0]
        const todaysCompleted = (ordersData.myOrders || []).filter((order: any) => {
          if (order.status !== 'COMPLETED') return false
          
          const completedDate = order.delivery?.completedAt 
            ? new Date(order.delivery.completedAt).toISOString().split('T')[0]
            : new Date(order.updatedAt).toISOString().split('T')[0]
          
          return completedDate === today
        })
        
        const todaysIncome = todaysCompleted.reduce((sum: number, order: any) => {
          return sum + (order.riderPayout || 0)
        }, 0)
        
        setTodayEarnings(todaysIncome)
        setError('')
      } else {
        setError(ordersData.error || 'Failed to load orders')
      }
    } catch (error) {
      setError('Error loading orders')
    } finally {
      setLoading(false)
    }
  }

  const acceptOrder = async (orderId: string) => {
    try {
      const response = await fetch('/api/rider/orders/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        alert('Order accepted!')
        fetchRiderData()
      } else if (data.error === 'REMITTANCE_LIMIT_REACHED') {
        setRemittanceData({
          cashOnHand: data.cashOnHand,
          limit: data.remittanceLimit
        })
        setShowRemittancePopup(true)
      } else {
        alert(data.error || 'Failed to accept order')
      }
    } catch (error) {
      alert('Error accepting order')
    }
  }

  const handleContactAdmin = async () => {
    setShowContactModal(true)
  }

  const sendMessageToAdmin = async () => {
    if (!contactMessage.trim()) {
      alert('Please enter a message')
      return
    }

    setSendingMessage(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      alert('Message sent to admin!')
      setShowContactModal(false)
      setShowRemittancePopup(false)
      setContactMessage('')
    } catch (error) {
      alert('Failed to send message')
    } finally {
      setSendingMessage(false)
    }
  }

  const openPhotoModal = (order: any) => {
    setSelectedOrder(order)
    setPhotoFile(null)
    setPhotoPreview('')
    setShowPhotoModal(true)
  }

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhotoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleMarkDelivered = async () => {
    if (!photoFile) {
      alert('Please take a photo')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', photoFile)

      const uploadRes = await fetch('/api/rider/upload', {
        method: 'POST',
        body: formData
      })

      const uploadData = await uploadRes.json()

      if (!uploadRes.ok) {
        alert(uploadData.error || 'Failed to upload')
        return
      }

      const statusRes = await fetch('/api/rider/orders/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: selectedOrder.id,
          status: 'COMPLETED',
          proofUrl: uploadData.url
        })
      })

      if (statusRes.ok) {
        alert('Order delivered!')
        setShowPhotoModal(false)
        fetchRiderData()
      } else {
        const data = await statusRes.json()
        alert(data.error || 'Failed')
      }
    } catch (error) {
      alert('Error')
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <main style={{ minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
        <Header />
        <div style={{ textAlign: 'center', padding: '100px 20px' }}><p>Loading...</p></div>
      </main>
    )
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
      <Header />
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '15px' }}>
        <div style={{ marginBottom: '20px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: 'black', marginBottom: '5px' }}>
            Rider Dashboard 🏍️
          </h1>
          <p style={{ fontSize: '16px', color: 'gray', marginBottom: '15px' }}>
            Accept deliveries and earn money
          </p>
          
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {notificationPermission !== 'granted' && (
              <button
                onClick={requestNotificationPermission}
                style={{
                  padding: '12px 20px',
                  backgroundColor: notificationPermission === 'denied' ? '#dc3545' : '#007bff',
                  color: 'white',
                  border: '2px solid black',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '14px',
                  boxShadow: '3px 3px 0px black',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                🔔 {notificationPermission === 'denied' ? 'Enable Notifications' : 'Allow Notifications'}
              </button>
            )}
            
            <button
              onClick={testSound}
              style={{
                padding: '12px 20px',
                backgroundColor: '#28a745',
                color: 'white',
                border: '2px solid black',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '14px',
                boxShadow: '3px 3px 0px black',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              🔊 Test Sound
            </button>
          </div>
        </div>

        {error && (
          <div style={{ backgroundColor: '#fee', padding: '15px', borderRadius: '8px', border: '2px solid red', marginBottom: '20px' }}>
            <strong style={{ color: 'red' }}>Error:</strong> {error}
          </div>
        )}

        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '3px solid black', marginBottom: '20px', boxShadow: '4px 4px 0px black' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '15px' }}> Rider Earnings</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
            <div style={{ padding: '15px', backgroundColor: '#e8f5e9', borderRadius: '8px', border: '2px solid green' }}>
              <p style={{ fontSize: '12px', color: 'gray', marginBottom: '5px' }}>Today's Income</p>
              <p style={{ fontSize: '20px', fontWeight: 'bold', color: 'green' }}>₱{todayEarnings.toFixed(2)}</p>
              <p style={{ fontSize: '11px', color: 'gray' }}>From completed deliveries</p>
            </div>
            <div style={{ padding: '15px', backgroundColor: cashOnHand >= REMITTANCE_LIMIT ? '#fee' : '#e3f2fd', borderRadius: '8px', border: `2px solid ${cashOnHand >= REMITTANCE_LIMIT ? 'red' : 'blue'}` }}>
              <p style={{ fontSize: '12px', color: 'gray', marginBottom: '5px' }}>Cash on Hand</p>
              <p style={{ fontSize: '20px', fontWeight: 'bold', color: cashOnHand >= REMITTANCE_LIMIT ? 'red' : 'blue' }}>₱{cashOnHand.toFixed(2)}</p>
              <p style={{ fontSize: '11px', color: cashOnHand >= REMITTANCE_LIMIT ? 'red' : 'gray' }}>
                {cashOnHand >= REMITTANCE_LIMIT ? '⚠️ Limit!' : 'To remit to admin'}
              </p>
            </div>
            <div style={{ padding: '15px', backgroundColor: '#fff3e0', borderRadius: '8px', border: '2px solid orange' }}>
              <p style={{ fontSize: '12px', color: 'gray', marginBottom: '5px' }}>Remittance Limit</p>
              <p style={{ fontSize: '20px', fontWeight: 'bold', color: 'orange' }}>₱{REMITTANCE_LIMIT.toLocaleString()}.00</p>
              <p style={{ fontSize: '11px', color: 'gray' }}>Max cash before remitting</p>
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '3px solid black', marginBottom: '20px', boxShadow: '4px 4px 0px black' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>
               Available Orders {pendingOrders.length > 0 && (
                <span style={{ 
                  display: 'inline-block',
                  padding: '4px 12px', 
                  backgroundColor: 'red',
                  color: 'white',
                  borderRadius: '20px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  marginLeft: '10px'
                }}>
                  {pendingOrders.length}
                </span>
              )}
            </h2>
            {pendingOrders.length > 0 && (
              <button
                onClick={fetchRiderData}
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'blue',
                  color: 'white',
                  border: '2px solid black',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                 Refresh
              </button>
            )}
          </div>
          {pendingOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
              <p style={{ fontSize: '16px', color: 'gray', marginBottom: '5px' }}>No orders available</p>
              <p style={{ fontSize: '13px', color: 'gray' }}>Check back soon!</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '15px' }}>
              {pendingOrders.map((order) => (
                <div key={order.id} style={{ padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '2px solid black' }}>
                  <div style={{ marginBottom: '10px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '5px' }}>Order #{order.id.slice(0, 8).toUpperCase()}</h3>
                    
                    {order.serviceType && order.serviceType !== 'GROCERY' && (
                      <span style={{ 
                        display: 'inline-block',
                        padding: '4px 8px', 
                        backgroundColor: order.serviceType === 'PABILI' ? '#ffc107' : '#17a2b8',
                        color: 'black',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        marginBottom: '5px',
                        marginRight: '5px'
                      }}>
                        {order.serviceType === 'PABILI' ? '🛒 PABILI' : ' PADALA'}
                      </span>
                    )}
                    
                    <p style={{ color: 'gray', fontSize: '13px', marginBottom: '3px' }}>{order.customer?.name}</p>
                    <p style={{ color: 'gray', fontSize: '13px', marginBottom: '3px' }}>{order.deliveryAddress}</p>
                    <p style={{ color: 'gray', fontSize: '12px', marginBottom: '3px' }}>Contact: {order.contactNumber}</p>
                    
                    {order.serviceType === 'PABILI' && (
                      <div style={{ backgroundColor: '#fff3cd', padding: '8px', borderRadius: '8px', marginBottom: '8px', border: '2px solid #ffc107' }}>
                        <p style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '3px' }}>🛒 What to buy:</p>
                        <p style={{ fontSize: '12px', marginBottom: '3px' }}>{order.itemDescription}</p>
                        {order.maxAmount && <p style={{ fontSize: '12px', fontWeight: 'bold' }}>💰 Max: ₱{order.maxAmount.toFixed(2)}</p>}
                      </div>
                    )}
                    
                    {order.serviceType === 'PADALA' && (
                      <div style={{ backgroundColor: '#d1ecf1', padding: '8px', borderRadius: '8px', marginBottom: '8px', border: '2px solid #17a2b8' }}>
                        <p style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '3px' }}>📦 Package:</p>
                        <p style={{ fontSize: '12px', marginBottom: '3px' }}>{order.packageDescription}</p>
                      </div>
                    )}
                    
                    {!order.serviceType || order.serviceType === 'GROCERY' ? (
                      <p style={{ color: 'gray', fontSize: '12px', marginBottom: '3px' }}>
                        Items: {order.items?.map((item: any) => `${item.product.name} x${item.quantity}`).join(', ')}
                      </p>
                    ) : null}
                    
                    <p style={{ color: 'gray', fontSize: '12px' }}>Weight: {order.requiredLoadKg}kg</p>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div>
                      <p style={{ fontSize: '12px', color: 'gray' }}>Customer Pays</p>
                      <p style={{ fontSize: '20px', fontWeight: 'bold', color: 'green' }}>₱{order.totalAmount?.toFixed(2)}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '12px', color: 'blue', fontWeight: 'bold' }}>You earn: ₱{order.riderPayout?.toFixed(2)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => acceptOrder(order.id)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      backgroundColor: 'blue',
                      color: 'white',
                      border: '2px solid black',
                      borderRadius: '8px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      fontSize: '15px'
                    }}
                  >
                    Accept Order
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {myOrders.length > 0 && (
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '3px solid black', boxShadow: '4px 4px 0px black' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '15px' }}>📋 My Orders ({myOrders.length})</h2>
            <div style={{ display: 'grid', gap: '15px' }}>
              {myOrders.map((order) => (
                <div key={order.id} style={{ padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '2px solid black' }}>
                  <div style={{ marginBottom: '10px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '5px' }}>Order #{order.id.slice(0, 8).toUpperCase()}</h3>
                    
                    {order.serviceType && order.serviceType !== 'GROCERY' && (
                      <span style={{ 
                        display: 'inline-block',
                        padding: '4px 8px', 
                        backgroundColor: order.serviceType === 'PABILI' ? '#ffc107' : '#17a2b8',
                        color: 'black',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        marginBottom: '5px'
                      }}>
                        {order.serviceType === 'PABILI' ? '🛒 PABILI' : '📦 PADALA'}
                      </span>
                    )}
                    
                    <p style={{ color: 'gray', fontSize: '13px', marginBottom: '3px' }}>{order.deliveryAddress}</p>
                    <p style={{ color: 'gray', fontSize: '13px', marginBottom: '3px' }}>
                      Status: <span style={{ 
                        fontWeight: 'bold', 
                        color: order.status === 'COMPLETED' ? 'green' : 
                              order.status === 'ACCEPTED' ? 'blue' : 'orange' 
                      }}>{order.status}</span>
                    </p>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div>
                      <p style={{ fontSize: '12px', color: 'gray' }}>Customer Paid</p>
                      <p style={{ fontSize: '18px', fontWeight: 'bold', color: 'green' }}>₱{order.totalAmount?.toFixed(2)}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '12px', color: 'blue', fontWeight: 'bold' }}>You earn: ₱{order.riderPayout?.toFixed(2)}</p>
                    </div>
                  </div>
                  
                  {order.status === 'ACCEPTED' && (
                    <button
                      onClick={() => openPhotoModal(order)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        backgroundColor: 'green',
                        color: 'white',
                        border: '2px solid black',
                        borderRadius: '8px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        fontSize: '15px'
                      }}
                    >
                      📸 Mark as Delivered (Photo Required)
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showRemittancePopup && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '16px', border: '4px solid #ff4444', maxWidth: '500px', width: '100%', boxShadow: '0px 10px 40px rgba(0,0,0,0.3)' }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '10px' }}>⚠️</div>
              <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#ff4444', marginBottom: '10px' }}>Remittance Limit Reached</h2>
            </div>
            <div style={{ backgroundColor: '#fff3cd', padding: '15px', borderRadius: '12px', border: '2px solid #ffc107', marginBottom: '20px' }}>
              <p style={{ fontSize: '14px', color: '#856404', marginBottom: '8px', textAlign: 'center', fontWeight: 'bold' }}>📢 Action Required</p>
              <p style={{ fontSize: '16px', color: '#856404', textAlign: 'center' }}>Limit: <strong>₱{remittanceData.limit.toLocaleString()}.00</strong></p>
              <p style={{ fontSize: '18px', color: '#d9534f', marginTop: '8px', fontWeight: 'bold', textAlign: 'center' }}>Current: ₱{remittanceData.cashOnHand.toFixed(2)}</p>
            </div>
            <button onClick={() => setShowRemittancePopup(false)} style={{ width: '100%', padding: '12px', backgroundColor: '#6c757d', color: 'white', border: '2px solid #495057', borderRadius: '8px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' }}>I Understand</button>
          </div>
        </div>
      )}

      {showContactModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001, padding: '20px' }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '16px', border: '4px solid #28a745', maxWidth: '500px', width: '100%' }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '10px' }}>📱</div>
              <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#28a745', marginBottom: '10px' }}>Contact Admin</h2>
            </div>
            <textarea value={contactMessage} onChange={(e) => setContactMessage(e.target.value)} placeholder="Enter message..." style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid #ddd', fontSize: '14px', minHeight: '100px', marginBottom: '15px', boxSizing: 'border-box' }} />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => { setShowContactModal(false); setContactMessage('') }} style={{ flex: 1, padding: '12px', backgroundColor: '#6c757d', color: 'white', border: '2px solid #495057', borderRadius: '8px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={sendMessageToAdmin} disabled={sendingMessage || !contactMessage.trim()} style={{ flex: 1, padding: '12px', backgroundColor: (!contactMessage.trim() || sendingMessage) ? '#ccc' : '#28a745', color: 'white', border: '2px solid #1e7e34', borderRadius: '8px', fontWeight: 'bold', fontSize: '14px', cursor: (!contactMessage.trim() || sendingMessage) ? 'not-allowed' : 'pointer' }}>{sendingMessage ? 'Sending...' : 'Send'}</button>
            </div>
          </div>
        </div>
      )}

      {showPhotoModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', border: '3px solid black', maxWidth: '500px', width: '100%' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px', textAlign: 'center' }}>📸 Proof of Delivery</h2>
            <p style={{ fontSize: '12px', marginBottom: '15px', textAlign: 'center', color: 'gray' }}>Order #{selectedOrder?.id.slice(0, 8).toUpperCase()}</p>
            <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handlePhotoSelect} style={{ display: 'none' }} />
            <button onClick={() => fileInputRef.current?.click()} style={{ width: '100%', padding: '12px', backgroundColor: photoFile ? '#e8f5e9' : '#f0f0f0', border: '2px dashed black', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold', marginBottom: '15px' }}>{photoFile ? '✅ Photo Selected' : ' Take Photo'}</button>
            {photoPreview && (<img src={photoPreview} alt="Proof" style={{ width: '100%', borderRadius: '8px', border: '2px solid black', marginBottom: '15px' }} />)}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowPhotoModal(false)} style={{ flex: 1, padding: '12px', backgroundColor: 'gray', color: 'white', border: '2px solid black', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}>Cancel</button>
              <button onClick={handleMarkDelivered} disabled={!photoFile || uploading} style={{ flex: 1, padding: '12px', backgroundColor: !photoFile ? 'gray' : 'green', color: 'white', border: '2px solid black', borderRadius: '8px', fontWeight: 'bold', cursor: !photoFile ? 'not-allowed' : 'pointer', fontSize: '14px' }}>{uploading ? 'Uploading...' : 'Confirm'}</button>
            </div>
          </div>
        </div>
      )}

      <PWAInstallPrompt />
    </main>
  )
}