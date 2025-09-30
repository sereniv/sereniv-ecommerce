import { NextRequest, NextResponse } from 'next/server';
import { generateAccessToken, generateRefreshToken, createUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, email, password } = await request.json();

    if (!firstName || !email || !password) {
      return NextResponse.json({
        success: false,
        message: 'First name, email, and password are required'
      }, { status: 400 });
    }

    const user = await createUser(firstName, lastName, email, password);

    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'User already exists'
      }, { status: 400 });
    }

    let accessToken = await generateAccessToken(user);
    let refreshToken = await generateRefreshToken(user);

    const nextResponse = NextResponse.json({
      success: true,
      data: user,
    });

    nextResponse.cookies.set({
      name: 'user',
      value: JSON.stringify(user),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 1,
    });

    if (accessToken && refreshToken) {
      nextResponse.cookies.set({
        name: 'accessToken',
        value: accessToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24 * 1,
      });

      nextResponse.cookies.set({
        name: 'refreshToken',
        value: refreshToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    return nextResponse;

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}
