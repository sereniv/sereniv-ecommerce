import { NextRequest, NextResponse } from 'next/server';
import { generateAccessToken, generateRefreshToken, getUserById, verifyAccessToken, verifyRefreshToken } from '@/lib/auth';
import { User } from '@/lib/types/user';

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('accessToken')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: 'No access token provided' },
        { status: 401 }
      );
    }

    const accessTokenData = await verifyAccessToken(accessToken);
    let userData: User | null = null;
    let newAccessToken: string | undefined;
    let newRefreshToken: string | undefined;

    if (accessTokenData && accessTokenData.userId) {
      userData = await getUserById(accessTokenData.userId);
    } else {
      const refreshToken = request.cookies.get('refreshToken')?.value;

      if (!refreshToken) {
        return NextResponse.json(
          { success: false, error: 'No refresh token provided' },
          { status: 401 }
        );
      }

      const refreshTokenData = await verifyRefreshToken(refreshToken);

      if (!refreshTokenData || !refreshTokenData.userId) {
        return NextResponse.json(
          { success: false, error: 'Invalid or expired refresh token' },
          { status: 401 }
        );
      }

      userData = await getUserById(refreshTokenData.userId);
      if (!userData) {
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 }
        );
      }

      newAccessToken = await generateAccessToken(userData);
      newRefreshToken = await generateRefreshToken(userData);
    }

    if (!userData) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const nextResponse = NextResponse.json({
      success: true,
      data: userData,
    });

    nextResponse.cookies.set({
      name: 'user',
      value: JSON.stringify(userData),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 1,
    });

    if (newAccessToken && newRefreshToken) {
      nextResponse.cookies.set({
        name: 'accessToken',
        value: newAccessToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24 * 1,
      });

      nextResponse.cookies.set({
        name: 'refreshToken',
        value: newRefreshToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge : 60 * 60 * 24 * 7,
      });
    }

    return nextResponse;
  } catch (error) {
    console.error('Error in GET /api/me:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}