import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'


export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD

    if (adminEmail !== email || adminPassword !== password) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const token = process.env.ADMIN_TOKEN_HASH || ''

    cookies().set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Login error:', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}