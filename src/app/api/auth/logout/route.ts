// src/app/api/auth/logout/route.ts
import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ success: true })
  
  // Clear the userId cookie
  response.headers.set('Set-Cookie', 'userId=; Path=/; HttpOnly; Max-Age=0')
  
  return response
}