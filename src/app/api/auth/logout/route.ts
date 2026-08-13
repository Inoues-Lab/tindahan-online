import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  const response = NextResponse.json({ success: true })
  
  // 🔑 Properly DELETE the session cookie
  response.cookies.delete('userId')
  
  return response
}