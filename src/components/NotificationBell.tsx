'use client'

import { useState, useEffect } from 'react'

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications')
      const data = await res.json()
      setNotifications(data.notifications || [])
    } catch (error) {
      // Ignore
    }
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{ position: 'relative', padding: '10px 14px', backgroundColor: 'white', border: '2px solid black', borderRadius: '8px', cursor: 'pointer', fontSize: '16px' }}
      >
        🔔
        {notifications.length > 0 && (
          <span style={{ position: 'absolute', top: '-8px', right: '-8px', backgroundColor: '#dc3545', color: 'white', borderRadius: '50%', minWidth: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', border: '2px solid black' }}>
            {notifications.length}
          </span>
        )}
      </button>
      {open && (
        <div style={{ position: 'absolute', right: 0, top: '110%', backgroundColor: 'white', border: '3px solid black', borderRadius: '12px', boxShadow: '4px 4px 0px black', width: '320px', maxWidth: '90vw', zIndex: 200, maxHeight: '400px', overflowY: 'auto' }}>
          <div style={{ padding: '12px 15px', borderBottom: '2px solid black', fontWeight: 'bold' }}>🔔 Notifications</div>
          {notifications.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: 'gray', fontSize: '14px' }}>No notifications</div>
          ) : (
            notifications.map((n) => (
              <div key={n.id + n.message} style={{ padding: '12px 15px', borderBottom: '1px solid #eee', fontSize: '14px' }}>
                <span style={{ marginRight: '8px' }}>{n.icon}</span>
                {n.message}
                <p style={{ fontSize: '11px', color: 'gray', margin: '4px 0 0 0' }}>{new Date(n.time).toLocaleString()}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
