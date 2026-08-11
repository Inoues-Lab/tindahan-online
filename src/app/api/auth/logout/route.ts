import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  const response = NextResponse.json({ success: true })
  
  response.cookies.set('userId', '', {
    maxAge: 0,
    path: '/'
  })
  
  return response
}