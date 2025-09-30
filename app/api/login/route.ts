import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, generateAccessToken, generateRefreshToken } from '@/lib/auth';

export async function POST(request: NextRequest) {

  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({
        success: false,
        message: 'Email and password are required'
      }, { status: 400 });
    }

    const user = await authenticateUser(email, password);

    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'Invalid email or password'
      }, { status: 401 });
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
    console.log("Error logging in", error)
  }

  return NextResponse.json({
    success: false,
    message: 'Internal server error'
  }, { status: 500 });
}
