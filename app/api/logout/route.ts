import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const response = NextResponse.json({
      success: true,
      data: 'Logged out successfully',
    });

    response.cookies.delete('accessToken');
    response.cookies.delete('refreshToken');
    response.cookies.delete('user');

    return response;
  } catch (error) {
    console.error('Error in GET /api/logout:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}