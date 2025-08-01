import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { generateVerifyToken } from '@/lib/utils';
import { sendEmail } from '@/helpers/mailer';

export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, email, password } = await request.json();

    if (!firstName || !email || !password) {
      return NextResponse.json({
        success: false,
        message: 'First name, email, and password are required'
      }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({
        success: false,
        message: 'User with this email already exists'
      }, { status: 409 });
    }

    const hashedPassword = await hashPassword(password);

    const { verifyToken, verifyTokenExpiry } = generateVerifyToken(24);

    const createdUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        verifyToken,
        verifyTokenExpiry,
        isVerified: true,
        isActive: true,
        role: 'USER'
      }
    });

    // Send verification email
    // try {
    //   await sendEmail(email, "VERIFY");
    // } catch (emailError) {
    //   console.error('Email sending failed:', emailError);
    // }

    const { password: _, verifyToken: __, verifyTokenExpiry: ___, ...userData } = createdUser;

    return NextResponse.json({
      success: true,
      message: 'User created successfully. Please check your email to verify your account.',
      data: userData
    }, { status: 201 });

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}
