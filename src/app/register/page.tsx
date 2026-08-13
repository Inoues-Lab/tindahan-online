import { Suspense } from 'react'
import Link from 'next/link'
import RegisterForm from '@/components/RegisterForm'

export default function RegisterPage() {
  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
      {/* Clean Simple Header for Auth Pages */}
      <div style={{ 
        backgroundColor: 'white', 
        borderBottom: '3px solid black', 
        padding: '15px 30px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Link href="/" style={{ fontSize: '24px', fontWeight: 'bold', textDecoration: 'none', color: 'black', display: 'flex', alignItems: 'center', gap: '10px' }}>
           Tindahan
        </Link>
        <Link href="/login" style={{ 
          padding: '8px 20px', 
          backgroundColor: 'white', 
          color: 'black', 
          border: '2px solid black', 
          borderRadius: '8px', 
          fontWeight: 'bold', 
          textDecoration: 'none',
          fontSize: '14px'
        }}>
          Login
        </Link>
      </div>

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