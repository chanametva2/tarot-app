import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getMemberByEmail, createMember } from '@/lib/google-sheets';

function generateMemberId(): string {
  return 'M' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();
}

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const existing = await getMemberByEmail(email);
    if (existing) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await createMember({
      member_id: generateMemberId(),
      email,
      password_hash: passwordHash,
      google_sub: '',
      name,
      role: 'user',
      status: 'active',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}
