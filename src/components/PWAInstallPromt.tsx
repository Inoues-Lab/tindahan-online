// src/components/PWAInstallPrompt.tsx
'use client'

import { useState, useEffect } from 'react'

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstall, setShowInstall] = useState(false)

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      
      // Show install button after 30 seconds if not installed
      setTimeout(() => {
        setShowInstall(true)
      }, 30000)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return
    
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt')
    }
    
    setDeferredPrompt(null)
    setShowInstall(false)
  }

  if (!showInstall) return null

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: '#007bff',
      color: 'white',
      padding: '15px 25px',
      borderRadius: '12px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      gap: '15px',
      maxWidth: '90%',
      width: '400px',
      border: '2px solid black'
    }}>
      <div style={{ fontSize: '24px' }}>📲</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 'bold', marginBottom: '3px' }}>Install Tindahan Rider</div>
        <div style={{ fontSize: '12px', opacity: 0.9 }}>Add to home screen for quick access!</div>
      </div>
      <button
        onClick={handleInstallClick}
        style={{
          backgroundColor: 'white',
          color: '#007bff',
          border: '2px solid black',
          padding: '8px 16px',
          borderRadius: '6px',
          fontWeight: 'bold',
          cursor: 'pointer'
        }}
      >
        Install
      </button>
      <button
        onClick={() => setShowInstall(false)}
        style={{
          background: 'none',
          border: 'none',
          color: 'white',
          fontSize: '20px',
          cursor: 'pointer',
          padding: '0 5px'
        }}
      >
        ×
      </button>
    </div>
  )
}