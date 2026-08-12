import { Suspense } from 'react'
import Header from '@/components/Header'
import ResetPasswordForm from '@/components/ResetPasswordForm'

export default function ResetPasswordPage() {
  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
      <Header />
      <div style={{ maxWidth: '500px', margin: '50px auto', padding: '20px' }}>
        <Suspense fallback={<div style={{ textAlign: 'center', padding: '50px' }}>Loading...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </main>
  )
}