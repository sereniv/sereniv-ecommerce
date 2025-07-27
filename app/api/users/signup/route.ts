import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from "bcryptjs";
import { generateVerifyToken, generateForgotPasswordToken } from '@/lib/utils';
import { sendEmail } from '@/helpers/mailer';


export async function POST(request: NextRequest, response: NextResponse) {

  const data = await request.json()

  try {
    const user = await prisma.user.findFirst({
      where: { email: data.email },
    });

    if (user) {
      return NextResponse.json({
        message: "User already exists",
        success: true,
      }, { status: 401 })
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);
    const { forgotPasswordToken, forgotPasswordTokenExpiry } = generateForgotPasswordToken(24)
    const { verifyToken, verifyTokenExpiry } = generateVerifyToken(1)

    // const createdUser = await prisma.user.create({
    //   data: {
    //     firstName: data.firstName,
    //     lastName: data.LastName,
    //     email: data.email,
    //     password: hashedPassword,
    //     forgotPasswordToken: forgotPasswordToken,
    //     forgotPasswordTokenExpiry: forgotPasswordTokenExpiry,
    //     verifyToken: verifyToken,
    //     verifyTokenExpiry: verifyTokenExpiry
    //   }
    // });

    await sendEmail(data.email, "VERIFY")

    return NextResponse.json({
      message: "User created successfully . Please verify your email",
      success: true,
      data: data
    }, { status: 201 });
  } catch (error) {
    console.error('Error in GET /api/users/signup', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}
