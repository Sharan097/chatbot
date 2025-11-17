// app/api/auth/signup/route.ts
import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for development (replace with database later)
const users: { email: string; password: string; name: string }[] = [];

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Store user (in production, hash the password!)
    users.push({ email, password, name: name || '' });

    console.log('New user registered:', { email, name });
    console.log('Total users:', users.length);
    console.log('All users:', users.map(u => ({ email: u.email, name: u.name })));

    return NextResponse.json(
      { 
        message: 'User created successfully',
        user: { email, name }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Export the users array for use in NextAuth
export { users };
