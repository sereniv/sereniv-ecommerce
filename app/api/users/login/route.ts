import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


export async function POST(request: NextRequest, response: NextResponse) {

  const data = await request.json()

  try {
    const user = await prisma.user.findFirst({
      where: { email: data.email },
    });

    if (!user) {
      return NextResponse.json({
        message: "User not found"
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error in GET /api/users/login', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}
