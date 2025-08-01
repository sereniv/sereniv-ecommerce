import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateUser, generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(7);
  console.log(`[${requestId}] Login request started`);
  
  try {
    // Debug: Log request headers and basic info
    console.log(`[${requestId}] Request headers:`, {
      'content-type': request.headers.get('content-type'),
      'user-agent': request.headers.get('user-agent'),
      'origin': request.headers.get('origin'),
    });

    const body = await request.json();
    console.log(`[${requestId}] Request body received:`, {
      email: body.email ? `${body.email.substring(0, 3)}***` : 'missing',
      passwordProvided: !!body.password,
      passwordLength: body.password?.length || 0
    });

    const { email, password } = body;

    if (!email || !password) {
      console.log(`[${requestId}] Validation failed: missing credentials`, {
        emailProvided: !!email,
        passwordProvided: !!password
      });
      return NextResponse.json({
        success: false,
        message: 'Email and password are required'
      }, { status: 400 });
    }

    console.log(`[${requestId}] Attempting to authenticate user: ${email.substring(0, 3)}***`);
    
    // Authenticate user
    const startAuth = Date.now();
    const user = await authenticateUser(email, password);
    const authDuration = Date.now() - startAuth;
    
    console.log(`[${requestId}] Authentication completed in ${authDuration}ms`, {
      userFound: !!user,
      userId: user?.id || 'N/A'
    });

    if (!user) {
      console.log(`[${requestId}] Authentication failed: invalid credentials for ${email.substring(0, 3)}***`);
      return NextResponse.json({
        success: false,
        message: 'Invalid email or password'
      }, { status: 401 });
    }

    console.log(`[${requestId}] User found, checking verification status`, {
      userId: user.id,
      isVerified: user.isVerified,
      isActive: user.isActive,
      email: `${user.email.substring(0, 3)}***`
    });

    if (!user.isVerified) {
      console.log(`[${requestId}] Login blocked: email not verified for user ${user.id}`);
      return NextResponse.json({
        success: false,
        message: 'Please verify your email before logging in'
      }, { status: 401 });
    }

    if (!user.isActive) {
      console.log(`[${requestId}] Login blocked: account deactivated for user ${user.id}`);
      return NextResponse.json({
        success: false,
        message: 'Your account has been deactivated'
      }, { status: 401 });
    }

    console.log(`[${requestId}] User validation passed, generating token for user ${user.id}`);

    // Generate JWT token
    const startToken = Date.now();
    const token = await generateToken(user);
    const tokenDuration = Date.now() - startToken;
    
    console.log(`[${requestId}] Token generated in ${tokenDuration}ms`, {
      tokenLength: token?.length || 0,
      tokenPrefix: token ? `${token.substring(0, 10)}...` : 'N/A'
    });

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;
    
    console.log(`[${requestId}] Login successful for user ${user.id}`, {
      totalDuration: Date.now() - parseInt(requestId, 36),
      userRole: user.role || 'N/A',
      lastLogin: user.lastLogin || 'N/A'
    });

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userWithoutPassword,
        token
      }
    });

  } catch (error) {
    console.error(`[${requestId}] Login error occurred:`, {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
      timestamp: new Date().toISOString()
    });

    // Log additional context for common error types
    if (error instanceof Error) {
      if (error.message.includes('JSON')) {
        console.error(`[${requestId}] JSON parsing error - invalid request body format`);
      } else if (error.message.includes('database') || error.message.includes('prisma')) {
        console.error(`[${requestId}] Database connection or query error`);
      } else if (error.message.includes('jwt') || error.message.includes('token')) {
        console.error(`[${requestId}] Token generation error`);
      }
    }

    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}