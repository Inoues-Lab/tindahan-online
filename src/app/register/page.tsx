import { Suspense } from 'react'
import Header from '@/components/Header'
import RegisterForm from '@/components/RegisterForm'

export default function RegisterPage() {
  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
      <Header />
      <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px' }}>
        <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', border: '3px solid black', boxShadow: '4px 4px 0px black' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '30px', textAlign: 'center' }}>
            Create Account
          </h1>

          <Suspense fallback={<div style={{ textAlign: 'center', padding: '20px' }}>Loading...</div>}>
            <RegisterForm />
          </Suspense>

          <div style={{ marginTop: '30px', textAlign: 'center' }}>
            <p style={{ color: 'gray' }}>
              Already have an account?{' '}
              <a href="/login" style={{ color: '#2196f3', fontWeight: 'bold' }}>
                Login here
              </a>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}